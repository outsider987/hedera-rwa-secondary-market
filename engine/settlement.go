package engine

import (
	"context"
	"encoding/json"
	"errors"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/jackc/pgx/v5"
)

const Admin = "0xfd8fdb4989a916c6f2420a2116c356e34c889840"
const Asset = "0x261ce349df182988fa25d00868cf6cf434220c24"

type SettlementTerms struct {
	MatchID     string `json:"matchId"`
	SellerOrder string `json:"sellerOrder"`
	BuyerOrder  string `json:"buyerOrder"`
	Seller      string `json:"seller"`
	Buyer       string `json:"buyer"`
	Amount      int64  `json:"amount,string"`
	Price       int64  `json:"priceTinybars,string"`
	PreparedAt  int64  `json:"preparedAt,string"`
	Expiry      int64  `json:"expiry,string"`
	HoldID      int64  `json:"holdId,string"`
}
type Settlement struct {
	ID        string          `json:"id"`
	Contract  string          `json:"contract"`
	Salt      string          `json:"salt"`
	Terms     SettlementTerms `json:"terms"`
	Digest    string          `json:"digest"`
	Status    string          `json:"status"`
	BaseBlock string          `json:"baseBlock"`
	UpdatedAt int64           `json:"updatedAt,string"`
}
type SettlementOperation struct {
	ID           string              `json:"id"`
	SettlementID string              `json:"settlementId"`
	Action       string              `json:"action"`
	Sender       string              `json:"sender"`
	To           string              `json:"to"`
	Calldata     string              `json:"calldata"`
	Value        string              `json:"value"` // Canonical decimal RPC weibars, never tinybars.
	Status       string              `json:"status"`
	Hash         string              `json:"hash"`
	CreatedAt    int64               `json:"createdAt,string"`
	Evidence     *SettlementEvidence `json:"evidence,omitempty"`
}
type SettlementDeployment struct {
	Address  string             `json:"address"`
	Cutoff   int64              `json:"cutoff,string"`
	Salt     string             `json:"salt"`
	Evidence SettlementEvidence `json:"evidence"`
}
type SettlementBalances struct {
	SellerAvailable string `json:"sellerAvailable"`
	SellerHeld      string `json:"sellerHeld"`
	BuyerAvailable  string `json:"buyerAvailable"`
	BuyerHeld       string `json:"buyerHeld"`
}
type SettlementEvidence struct {
	Before            *SettlementBalances `json:"before,omitempty"`
	After             *SettlementBalances `json:"after,omitempty"`
	Hash              string              `json:"hash"`
	Block             string              `json:"block"`
	Timestamp         string              `json:"timestamp"`
	Contract          string              `json:"contract"`
	HoldID            int64               `json:"holdId,string"`
	FeeTinybars       string              `json:"feeTinybars"`
	PrincipalTinybars string              `json:"principalTinybars"`
	TransactionID     string              `json:"transactionId"`
	LogIndices        []string            `json:"logIndices"`
	Reverted          bool                `json:"reverted"`
}

func word(n int64) []byte { return common.LeftPadBytes(big.NewInt(n).Bytes(), 32) }
func TermsDigest(s Settlement) (string, error) {
	t := s.Terms
	if !address.MatchString(s.Contract) || !hashRE.MatchString(s.Salt) || !hashRE.MatchString(t.MatchID) || !hashRE.MatchString(t.SellerOrder) || !hashRE.MatchString(t.BuyerOrder) || !Eligible(t.Seller) || !Eligible(t.Buyer) || t.Seller == t.Buyer || t.SellerOrder == t.BuyerOrder || t.PreparedAt < 1 || t.Expiry-t.PreparedAt != 1800 || t.HoldID < 1 {
		return "", errors.New("invalid settlement terms")
	}
	if _, e := Notional(t.Amount, t.Price); e != nil {
		return "", e
	}
	b := append([]byte{}, crypto.Keccak256([]byte("HoldBook Settlement v1"))...)
	for _, v := range [][]byte{word(296), common.LeftPadBytes(common.HexToAddress(s.Contract).Bytes(), 32), common.LeftPadBytes(common.HexToAddress(Asset).Bytes(), 32), common.FromHex(s.Salt), common.FromHex(t.MatchID), common.FromHex(t.SellerOrder), common.FromHex(t.BuyerOrder), common.LeftPadBytes(common.HexToAddress(t.Seller).Bytes(), 32), common.LeftPadBytes(common.HexToAddress(t.Buyer).Bytes(), 32), word(t.Amount), word(t.Price), word(t.PreparedAt), word(t.Expiry), word(t.HoldID)} {
		b = append(b, v...)
	}
	return crypto.Keccak256Hash(b).Hex(), nil
}
func (s *Store) SettlementDeployment(ctx context.Context) (*SettlementDeployment, error) {
	var d SettlementDeployment
	e := s.Pool.QueryRow(ctx, "SELECT d.address,d.cutoff,m.salt,d.evidence FROM settlement_deployment d JOIN markets m ON m.id=d.market WHERE d.market=$1", Market).Scan(&d.Address, &d.Cutoff, &d.Salt, &d.Evidence)
	if errors.Is(e, pgx.ErrNoRows) {
		return nil, nil
	}
	return &d, e
}
func (s *Store) Settlements(ctx context.Context) ([]Settlement, error) {
	result := []Settlement{}
	rows, e := s.Pool.Query(ctx, "SELECT data FROM settlements ORDER BY id")
	if e != nil {
		return nil, e
	}
	defer rows.Close()
	for rows.Next() {
		var v Settlement
		if e = rows.Scan(&v); e != nil {
			return nil, e
		}
		result = append(result, v)
	}
	return result, rows.Err()
}
func (s *Store) Settlement(ctx context.Context, id string) (Settlement, error) {
	var v Settlement
	e := s.Pool.QueryRow(ctx, "SELECT data FROM settlements WHERE id=$1", id).Scan(&v)
	return v, e
}
func (s *Store) Operation(ctx context.Context, id string) (SettlementOperation, error) {
	var o SettlementOperation
	e := s.Pool.QueryRow(ctx, "SELECT data FROM settlement_operations WHERE id=$1", id).Scan(&o)
	return o, e
}
func (s *Store) PendingOperation(ctx context.Context) (*SettlementOperation, error) {
	var o SettlementOperation
	e := s.Pool.QueryRow(ctx, "SELECT data FROM settlement_operations WHERE status IN ('prepared','pending')").Scan(&o)
	if errors.Is(e, pgx.ErrNoRows) {
		return nil, nil
	}
	return &o, e
}

// Prepare reconstructs saved orders under the same lock as matching. No caller-supplied terms.
func (s *Store) PrepareSettlement(ctx context.Context, id, action string, chainBlock string, chainTime int64) (SettlementOperation, error) {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return SettlementOperation{}, e
	}
	defer tx.Rollback(ctx)
	b, salt, _, e := s.lock(ctx, tx)
	if e != nil {
		return SettlementOperation{}, e
	}
	var old SettlementOperation
	e = tx.QueryRow(ctx, "SELECT data FROM settlement_operations WHERE status IN ('prepared','pending')").Scan(&old)
	if e == nil {
		if old.SettlementID == id && old.Action == action {
			return old, tx.Commit(ctx)
		}
		return old, errors.New("recover original pending operation")
	}
	if !errors.Is(e, pgx.ErrNoRows) {
		return old, e
	}
	o := SettlementOperation{ID: ID(), SettlementID: id, Action: action, CreatedAt: s.now(), Status: "prepared", Value: "0"}
	var d SettlementDeployment
	e = tx.QueryRow(ctx, "SELECT address,cutoff,evidence FROM settlement_deployment WHERE market=$1", Market).Scan(&d.Address, &d.Cutoff, &d.Evidence)
	if action == "deploy" {
		if !errors.Is(e, pgx.ErrNoRows) || id != "" {
			return o, errors.New("deployment already exists or unavailable")
		}
		o.Sender = Admin
		o.Calldata = settlementArtifact.Bytecode + strings.TrimPrefix(salt, "0x")
	} else {
		if e != nil {
			return o, e
		}
		o.To = d.Address
		var v Settlement
		e = tx.QueryRow(ctx, "SELECT data FROM settlements WHERE id=$1", id).Scan(&v)
		if errors.Is(e, pgx.ErrNoRows) && action == "lock" {
			var m Match
			if e = tx.QueryRow(ctx, "SELECT data FROM matches WHERE id=$1", id).Scan(&m); e != nil {
				return o, e
			}
			var maker, taker *Order
			for i := range b.Orders {
				if b.Orders[i].OrderID == m.Maker {
					maker = &b.Orders[i]
				}
				if b.Orders[i].OrderID == m.Taker {
					taker = &b.Orders[i]
				}
			}
			if maker == nil || taker == nil || maker.Sequence <= d.Cutoff || taker.Sequence <= d.Cutoff || maker.Owner == taker.Owner || chainTime < m.Time || chainTime > s.now()+30 || chainTime < s.now()-60 {
				return o, errors.New("only fresh verified matches can settle")
			}
			sell, buy := maker, taker
			if sell.Side != "Sell" {
				sell, buy = buy, sell
			}
			if sell.Owner != m.Seller || buy.Owner != m.Buyer || sell.Side != "Sell" || buy.Side != "Buy" {
				return o, errors.New("match parties differ")
			}
			if n, err := Notional(m.Quantity, m.Price); err != nil || n != m.Notional {
				return o, errors.New("invalid notional")
			}
			v = Settlement{ID: id, Contract: d.Address, Salt: salt, BaseBlock: chainBlock, Status: "Unprepared", UpdatedAt: chainTime, Terms: SettlementTerms{MatchID: crypto.Keccak256Hash([]byte(id)).Hex(), SellerOrder: "0x" + sell.OrderID, BuyerOrder: "0x" + buy.OrderID, Seller: m.Seller, Buyer: m.Buyer, Amount: m.Quantity, Price: m.Price, PreparedAt: chainTime, Expiry: chainTime + 1800}}
			if _, e = tx.Exec(ctx, "INSERT INTO settlements(id,seller,data) VALUES($1,$2,$3)", id, v.Terms.Seller, v); e != nil {
				return o, e
			}
		} else if e != nil {
			return o, e
		}
		if v.Contract != d.Address || v.Salt != salt {
			return o, errors.New("deployment differs")
		}
		allowed := map[string]string{"lock": "Unprepared", "register": "Locked", "settle": "Ready", "cancel": "Ready", "reclaim": "Ready", "orphan": "Locked"}
		if allowed[action] == "" || v.Status != allowed[action] {
			return o, errors.New("settlement action no longer available")
		}
		if action == "reclaim" && chainTime < v.Terms.Expiry || action != "reclaim" && action != "orphan" && chainTime >= v.Terms.Expiry {
			return o, errors.New("settlement expiry changed")
		}
		o.Sender = v.Terms.Seller
		if action == "settle" {
			o.Sender = v.Terms.Buyer
			o.Value = new(big.Int).Mul(big.NewInt(v.Terms.Amount*v.Terms.Price), big.NewInt(10000000000)).String()
		}
		if action == "lock" {
			o.To = Asset
		}
		o.Calldata, e = settlementCalldata(action, v)
		if e != nil {
			return o, e
		}
	}
	var match any
	if id != "" {
		match = id
	}
	if _, e = tx.Exec(ctx, "INSERT INTO settlement_operations(id,settlement_id,action,status,data) VALUES($1,$2,$3,$4,$5)", o.ID, match, o.Action, o.Status, o); e != nil {
		return o, e
	}
	return o, tx.Commit(ctx)
}

// A hash is accepted only after read-only transaction identity checks. Once stored it is immutable.
func (s *Store) SaveSettlementHash(ctx context.Context, id, hash string) (SettlementOperation, error) {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return SettlementOperation{}, e
	}
	defer tx.Rollback(ctx)
	var o SettlementOperation
	if e = tx.QueryRow(ctx, "SELECT data FROM settlement_operations WHERE id=$1 FOR UPDATE", id).Scan(&o); e != nil {
		return o, e
	}
	if !hashRE.MatchString(hash) || o.Hash != "" && o.Hash != hash {
		return o, errors.New("conflicting transaction hash")
	}
	if o.Hash == hash {
		return o, tx.Commit(ctx)
	}
	o.Hash = hash
	o.Status = "pending"
	_, e = tx.Exec(ctx, "UPDATE settlement_operations SET status=$2,transaction_hash=$3,data=$4 WHERE id=$1", id, o.Status, hash, o)
	if e != nil {
		return o, e
	}
	return o, tx.Commit(ctx)
}
func (s *Store) ApplySettlementEvidence(ctx context.Context, id string, proof SettlementEvidence) (SettlementOperation, error) {
	tx, e := s.Pool.Begin(ctx)
	if e != nil {
		return SettlementOperation{}, e
	}
	defer tx.Rollback(ctx)
	b, salt, _, e := s.lock(ctx, tx)
	if e != nil {
		return SettlementOperation{}, e
	}
	var o SettlementOperation
	if e = tx.QueryRow(ctx, "SELECT data FROM settlement_operations WHERE id=$1 FOR UPDATE", id).Scan(&o); e != nil {
		return o, e
	}
	if o.Hash == "" || o.Hash != proof.Hash {
		return o, errors.New("evidence hash mismatch")
	}
	if o.Status == "verified" || o.Status == "reverted" {
		a, _ := json.Marshal(o.Evidence)
		z, _ := json.Marshal(proof)
		if string(a) != string(z) {
			return o, errors.New("evidence conflicts")
		}
		return o, tx.Commit(ctx)
	}
	o.Evidence = &proof
	o.Status = "verified"
	if proof.Reverted {
		o.Status = "reverted"
	}
	if !proof.Reverted {
		if o.Action == "deploy" {
			if !address.MatchString(proof.Contract) {
				return o, errors.New("invalid deployment")
			}
			_, e = tx.Exec(ctx, "INSERT INTO settlement_deployment(market,address,cutoff,evidence) VALUES($1,$2,$3,$4)", Market, proof.Contract, b.Sequence, proof)
		} else {
			var v Settlement
			if e = tx.QueryRow(ctx, "SELECT data FROM settlements WHERE id=$1", o.SettlementID).Scan(&v); e != nil {
				return o, e
			}
			status := map[string]string{"lock": "Locked", "register": "Ready", "settle": "Settled", "cancel": "Cancelled", "reclaim": "Reclaimed", "orphan": "Returned"}[o.Action]
			if status == "" {
				return o, errors.New("invalid operation")
			}
			v.Status = status
			v.UpdatedAt = s.now()
			if o.Action == "lock" {
				if proof.HoldID < 1 {
					return o, errors.New("missing verified Hold")
				}
				v.Terms.HoldID = proof.HoldID
				v.Salt = salt
				v.Digest, e = TermsDigest(v)
				if e != nil {
					return o, e
				}
			}
			_, e = tx.Exec(ctx, "UPDATE settlements SET hold_id=$2,data=$3 WHERE id=$1", v.ID, v.Terms.HoldID, v)
		}
		if e != nil {
			return o, e
		}
		for _, index := range proof.LogIndices {
			if _, e = tx.Exec(ctx, "INSERT INTO settlement_events(transaction_hash,log_index,operation_id) VALUES($1,$2,$3)", proof.Hash, index, id); e != nil {
				return o, e
			}
		}
	}
	if _, e = tx.Exec(ctx, "UPDATE settlement_operations SET status=$2,data=$3 WHERE id=$1", id, o.Status, o); e != nil {
		return o, e
	}
	if s.fault != nil {
		if e = s.fault("before-commit"); e != nil {
			return o, e
		}
	}
	if e = tx.Commit(ctx); e != nil {
		return o, e
	}
	if s.fault != nil {
		if e = s.fault("after-commit"); e != nil {
			return o, e
		}
	}
	return o, nil
}
