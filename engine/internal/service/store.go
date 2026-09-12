package service

import (
	"holdbook/engine/internal/matching"

	"context"
	"crypto/rand"
	_ "embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/001-market.sql
var migration string

//go:embed migrations/002-settlement.sql
var settlementMigration string

type Store struct {
	Pool *pgxpool.Pool
	// Verify is the cryptographic boundary; integration tests explicitly substitute it.
	Verify func(Prepared, string, string, int64) (string, error)
	now    func() int64
	// Tests inject process failures here; production leaves this nil.
	fault func(string) error
}
type CommandRecord struct {
	Prepared Prepared         `json:"prepared"`
	Status   string           `json:"status"`
	Digest   string           `json:"digest"`
	Verified bool             `json:"verified"`
	Result   *matching.Result `json:"result"`
	Reason   string           `json:"reason"`
}
type Snapshot struct {
	Market     string           `json:"market"`
	Salt       string           `json:"salt"`
	ServerTime int64            `json:"serverTime,string"`
	Version    int64            `json:"version,string"`
	Orders     []matching.Order `json:"orders"`
	Matches    []matching.Match `json:"matches"`
}

func ID() string {
	b := make([]byte, 32)
	if _, e := rand.Read(b); e != nil {
		panic(e)
	}
	return hex.EncodeToString(b)
}
func Open(ctx context.Context, url string) (*Store, error) {
	cfg, e := pgxpool.ParseConfig(url)
	if e != nil {
		return nil, e
	}
	// Bound each autoscaled instance's database footprint.
	cfg.MaxConns = 4
	cfg.MinConns = 0
	cfg.MaxConnIdleTime = time.Minute
	pool, e := pgxpool.NewWithConfig(ctx, cfg)
	if e != nil {
		return nil, e
	}
	s := &Store{Pool: pool, Verify: Verify, now: func() int64 { return time.Now().Unix() }}
	if e = s.Init(ctx); e != nil {
		pool.Close()
		return nil, e
	}
	return s, nil
}
func (s *Store) Init(ctx context.Context) error {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(ctx)
	if _, e = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(2968787)"); e != nil {
		return e
	}
	if _, e = tx.Exec(ctx, migration); e != nil {
		return e
	}
	if _, e = tx.Exec(ctx, settlementMigration); e != nil {
		return e
	}
	if _, e = tx.Exec(ctx, "INSERT INTO markets(id,salt) VALUES($1,$2) ON CONFLICT DO NOTHING", matching.Market, "0x"+ID()); e != nil {
		return e
	}
	return tx.Commit(ctx)
}
func (s *Store) lock(ctx context.Context, tx pgx.Tx) (*matching.Book, string, int64, error) {
	b := &matching.Book{}
	var salt string
	var version int64
	e := tx.QueryRow(ctx, "SELECT salt,sequence,effective_time,version FROM markets WHERE id=$1 FOR UPDATE", matching.Market).Scan(&salt, &b.Sequence, &b.Time, &version)
	if e != nil {
		return nil, "", 0, e
	}
	rows, e := tx.Query(ctx, "SELECT data FROM orders WHERE market=$1 ORDER BY sequence", matching.Market)
	if e != nil {
		return nil, "", 0, e
	}
	defer rows.Close()
	for rows.Next() {
		var o matching.Order
		if e = rows.Scan(&o); e != nil {
			return nil, "", 0, e
		}
		b.Orders = append(b.Orders, o)
	}
	return b, salt, version, rows.Err()
}
func (s *Store) save(ctx context.Context, tx pgx.Tx, b *matching.Book, matches []matching.Match) error {
	for _, o := range b.Orders {
		if _, e := tx.Exec(ctx, "INSERT INTO orders(id,market,sequence,data) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data", o.OrderID, matching.Market, o.Sequence, o); e != nil {
			return e
		}
	}
	for _, m := range matches {
		if _, e := tx.Exec(ctx, "INSERT INTO matches(id,market,data) VALUES($1,$2,$3)", m.ID, matching.Market, m); e != nil {
			return e
		}
	}
	_, e := tx.Exec(ctx, "UPDATE markets SET sequence=$2,effective_time=$3,version=version+1 WHERE id=$1", matching.Market, b.Sequence, b.Time)
	return e
}
func (s *Store) Prepare(ctx context.Context, c matching.Command) (CommandRecord, error) {
	if !Eligible(c.Owner) || c.Market != matching.Market {
		return CommandRecord{}, errors.New("only the original Seller and Buyer may trade NOVA/HBAR")
	}
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return CommandRecord{}, e
	}
	defer tx.Rollback(ctx)
	b, _, _, e := s.lock(ctx, tx)
	if e != nil {
		return CommandRecord{}, e
	}
	now := max(s.now(), b.Time)
	c.RequestID = ID()
	if c.Action == "Place" {
		c.OrderID = ID()
		c.ExpiresAt = now + 86400
	}
	p := Prepared{Command: c, Deadline: now + 300, PreparedAt: now}
	// Validate on the reconstructed disposable book; preparation never changes orders.
	if _, e = b.Apply(c, now); e != nil {
		return CommandRecord{}, e
	}
	r := CommandRecord{Prepared: p, Status: "pending"}
	_, e = tx.Exec(ctx, "INSERT INTO commands(id,market,prepared,status) VALUES($1,$2,$3,'pending')", c.RequestID, matching.Market, p)
	if e != nil {
		return r, e
	}
	return r, tx.Commit(ctx)
}
func commandRow(ctx context.Context, q interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}, id string) (CommandRecord, string, error) {
	var r CommandRecord
	var signature string
	e := q.QueryRow(ctx, "SELECT prepared,status,COALESCE(signature,''),COALESCE(digest,''),result,reason FROM commands WHERE id=$1", id).Scan(&r.Prepared, &r.Status, &signature, &r.Digest, &r.Result, &r.Reason)
	r.Verified = r.Status == "accepted"
	return r, signature, e
}
func (s *Store) Submit(ctx context.Context, id, signature string) (CommandRecord, error) {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return CommandRecord{}, e
	}
	defer tx.Rollback(ctx)
	b, salt, _, e := s.lock(ctx, tx)
	if e != nil {
		return CommandRecord{}, e
	}
	r, old, e := commandRow(ctx, tx, id)
	if e != nil {
		return r, e
	}
	if r.Status != "pending" {
		if old != "" && old != signature {
			return r, errors.New("conflicting request ID")
		}
		return r, tx.Commit(ctx)
	}
	now := max(s.now(), b.Time)
	if now >= r.Prepared.Deadline {
		r.Status = "expired"
		r.Reason = "Submission deadline expired"
	} else {
		digest, err := s.Verify(r.Prepared, salt, signature, now)
		// Invalid signatures do not consume another owner's prepared request.
		if err != nil {
			return r, errors.New("signature verification failed")
		}
		r.Digest = digest
		r.Verified = true
		result, err := b.Apply(r.Prepared.Command, now)
		if err != nil {
			r.Status = "rejected"
			r.Reason = "Order is no longer valid"
			r.Verified = false
		} else {
			r.Status = "accepted"
			r.Result = &result
			if e = s.save(ctx, tx, b, result.Matches); e != nil {
				return r, e
			}
		}
	}
	_, e = tx.Exec(ctx, "UPDATE commands SET status=$2,signature=$3,digest=$4,result=$5,reason=$6 WHERE id=$1", id, r.Status, signature, r.Digest, r.Result, r.Reason)
	if e != nil {
		return r, e
	}
	if s.fault != nil {
		if e = s.fault("before-commit"); e != nil {
			return r, e
		}
	}
	if e = tx.Commit(ctx); e != nil {
		return r, e
	}
	if s.fault != nil {
		if e = s.fault("after-commit"); e != nil {
			return r, e
		}
	}
	return r, nil
}
func (s *Store) Expire(ctx context.Context) error {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(ctx)
	b, _, _, e := s.lock(ctx, tx)
	if e != nil {
		return e
	}
	now := max(s.now(), b.Time)
	before, _ := json.Marshal(b.Orders)
	_ = b.Expire(now)
	after, _ := json.Marshal(b.Orders)
	if string(before) != string(after) {
		if e = s.save(ctx, tx, b, nil); e != nil {
			return e
		}
	}
	_, e = tx.Exec(ctx, "UPDATE commands SET status='expired',reason='Submission deadline expired' WHERE market=$1 AND status='pending' AND (prepared->>'deadline')::bigint <= $2", matching.Market, now)
	if e != nil {
		return e
	}
	return tx.Commit(ctx)
}
func (s *Store) Get(ctx context.Context, id string) (CommandRecord, error) {
	if e := s.Expire(ctx); e != nil {
		return CommandRecord{}, e
	}
	r, _, e := commandRow(ctx, s.Pool, id)
	return r, e
}
func (s *Store) Snapshot(ctx context.Context) (Snapshot, error) {
	if e := s.Expire(ctx); e != nil {
		return Snapshot{}, e
	}
	tx, e := s.Pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.RepeatableRead, AccessMode: pgx.ReadOnly})
	if e != nil {
		return Snapshot{}, e
	}
	defer tx.Rollback(ctx)
	r := Snapshot{Market: matching.Market, Orders: []matching.Order{}, Matches: []matching.Match{}}
	var effective int64
	if e = tx.QueryRow(ctx, "SELECT salt,version,effective_time FROM markets WHERE id=$1", matching.Market).Scan(&r.Salt, &r.Version, &effective); e != nil {
		return r, e
	}
	r.ServerTime = max(s.now(), effective)
	rows, e := tx.Query(ctx, "SELECT data FROM orders WHERE market=$1 ORDER BY sequence", matching.Market)
	if e != nil {
		return r, e
	}
	for rows.Next() {
		var o matching.Order
		if e = rows.Scan(&o); e != nil {
			rows.Close()
			return r, e
		}
		r.Orders = append(r.Orders, o)
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		return r, e
	}
	rows, e = tx.Query(ctx, "SELECT data FROM matches WHERE market=$1 ORDER BY (data->>'time')::bigint,split_part(id,'-',1)::bigint,split_part(id,'-',2)::bigint", matching.Market)
	if e != nil {
		return r, e
	}
	for rows.Next() {
		var m matching.Match
		if e = rows.Scan(&m); e != nil {
			rows.Close()
			return r, e
		}
		r.Matches = append(r.Matches, m)
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		return r, e
	}
	return r, tx.Commit(ctx)
}
func (s *Store) Tick(ctx context.Context) {
	timer := time.NewTicker(time.Second)
	defer timer.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			bounded, cancel := context.WithTimeout(ctx, 5*time.Second)
			_ = s.Expire(bounded)
			cancel()
		}
	}
}
func PublicError(e error) string {
	if errors.Is(e, pgx.ErrNoRows) {
		return "Request not found; retain the original intent"
	}
	return fmt.Sprint("Request could not complete; query the original request before retrying")
}
