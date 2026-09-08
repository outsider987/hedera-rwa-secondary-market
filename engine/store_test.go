package engine

import (
	"context"
	"errors"
	"os"
	"reflect"
	"sync"
	"testing"
)

func testStore(t *testing.T) *Store {
	t.Helper()
	url := os.Getenv("HOLDBOOK_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("real PostgreSQL test requires dedicated HOLDBOOK_TEST_DATABASE_URL")
	}
	s, e := Open(context.Background(), url)
	if e != nil {
		t.Fatal(e)
	}
	t.Cleanup(s.Pool.Close)
	// Only the explicitly named disposable test database may be reset.
	var db string
	if e = s.Pool.QueryRow(context.Background(), "SELECT current_database()").Scan(&db); e != nil || db != "holdbook_test" {
		t.Fatal("requires isolated holdbook_test database", e)
	}
	if _, e = s.Pool.Exec(context.Background(), "TRUNCATE settlement_events,settlement_operations,settlements,settlement_deployment,commands,orders,matches; UPDATE markets SET sequence=0,effective_time=0,version=0"); e != nil {
		t.Fatal(e)
	}
	s.now = func() int64 { return 1000 }
	s.Verify = func(p Prepared, salt, signature string, now int64) (string, error) {
		if signature != "integration-verifier-double" {
			return "", errors.New("test verifier rejected")
		}
		h, e := Digest(TypedData(p, salt))
		return "0x" + hexString(h), e
	}
	return s
}
func hexString(b []byte) string {
	const h = "0123456789abcdef"
	v := make([]byte, len(b)*2)
	for i, x := range b {
		v[i*2] = h[x>>4]
		v[i*2+1] = h[x&15]
	}
	return string(v)
}
func prepared(t *testing.T, s *Store, c Command) CommandRecord {
	t.Helper()
	r, e := s.Prepare(context.Background(), c)
	if e != nil {
		t.Fatal(e)
	}
	return r
}
func submit(t *testing.T, s *Store, r CommandRecord) CommandRecord {
	t.Helper()
	v, e := s.Submit(context.Background(), r.Prepared.RequestID, "integration-verifier-double")
	if e != nil || v.Status != "accepted" {
		t.Fatal(v, e)
	}
	return v
}
func TestPostgresDurability(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	a := prepared(t, s, place("", Seller, "Sell", 4, 9000000))
	b := prepared(t, s, place("", Seller, "Sell", 5, 10000000))
	submit(t, s, a)
	submit(t, s, b)
	buy := prepared(t, s, place("", Buyer, "Buy", 6, 10000000))
	s.fault = func(stage string) error {
		if stage == "before-commit" {
			return errors.New("simulated process interruption before commit")
		}
		return nil
	}
	if _, e := s.Submit(ctx, buy.Prepared.RequestID, "integration-verifier-double"); e == nil {
		t.Fatal("fault missing")
	}
	v, e := s.Snapshot(ctx)
	if e != nil || len(v.Matches) != 0 {
		t.Fatal(v, e)
	}
	s.fault = func(stage string) error {
		if stage == "after-commit" {
			return errors.New("simulated lost response after durable commit")
		}
		return nil
	}
	if _, e = s.Submit(ctx, buy.Prepared.RequestID, "integration-verifier-double"); e == nil {
		t.Fatal("fault missing")
	}
	s.fault = nil
	result := submit(t, s, buy)
	if len(result.Result.Matches) != 2 {
		t.Fatal(result)
	}
	var wg sync.WaitGroup
	errs := make(chan error, 12)
	for range 12 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			r, e := s.Submit(ctx, buy.Prepared.RequestID, "integration-verifier-double")
			if e == nil && !reflect.DeepEqual(r, result) {
				e = errors.New("duplicate changed result")
			}
			errs <- e
		}()
	}
	wg.Wait()
	close(errs)
	for e := range errs {
		if e != nil {
			t.Fatal(e)
		}
	}
	if _, e = s.Submit(ctx, buy.Prepared.RequestID, "conflicting-signature"); e == nil {
		t.Fatal("conflict accepted")
	}
	cancel := prepared(t, s, Command{OrderID: b.Prepared.OrderID, Owner: Seller, Market: Market, Action: "Cancel"})
	r := submit(t, s, cancel)
	if r.Result.Order.Cancelled != 3 || r.Result.Order.Matched != 2 {
		t.Fatal(r)
	}
	before, e := s.Snapshot(ctx)
	if e != nil {
		t.Fatal(e)
	}
	restarted, e := Open(ctx, os.Getenv("HOLDBOOK_TEST_DATABASE_URL"))
	if e != nil {
		t.Fatal(e)
	}
	restarted.now = s.now
	t.Cleanup(restarted.Pool.Close)
	after, e := restarted.Snapshot(ctx)
	if e != nil || !reflect.DeepEqual(before, after) {
		t.Fatal("restart changed state", e)
	}
	recovered, e := restarted.Get(ctx, buy.Prepared.RequestID)
	if e != nil || !reflect.DeepEqual(result, recovered) {
		t.Fatal("lost response recovery", e)
	}
	// Reconnect proves DB durability, with a new service pool and no command replay.
	restarted.Pool.Close()
	if _, e = restarted.Snapshot(ctx); e == nil {
		t.Fatal("offline database acknowledged")
	}
}
func TestPostgresConcurrentCancelAndPlace(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	sell := prepared(t, s, place("", Seller, "Sell", 10, 10))
	submit(t, s, sell)
	cancel := prepared(t, s, Command{OrderID: sell.Prepared.OrderID, Owner: Seller, Market: Market, Action: "Cancel"})
	buy := prepared(t, s, place("", Buyer, "Buy", 10, 10))
	ch := make(chan error, 2)
	for _, r := range []CommandRecord{cancel, buy} {
		go func() { _, e := s.Submit(ctx, r.Prepared.RequestID, "integration-verifier-double"); ch <- e }()
	}
	for range 2 {
		if e := <-ch; e != nil {
			t.Fatal(e)
		}
	}
	v, e := s.Snapshot(ctx)
	if e != nil {
		t.Fatal(e)
	}
	conserved(t, &Book{Orders: v.Orders})
	if len(v.Matches) > 1 {
		t.Fatal("duplicate match")
	}
	pending := prepared(t, s, place("", Seller, "Buy", 1, 1))
	s.now = func() int64 { return 1300 }
	r, e := s.Get(ctx, pending.Prepared.RequestID)
	if e != nil || r.Status != "expired" {
		t.Fatal(r, e)
	}
	s.now = func() int64 { return 87400 }
	v, e = s.Snapshot(ctx)
	if e != nil {
		t.Fatal(e)
	}
	for _, o := range v.Orders {
		if o.Remaining != 0 {
			t.Fatal("expiry equality")
		}
	}
}

func TestPostgresConcurrentBuys(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	submit(t, s, prepared(t, s, place("", Seller, "Sell", 10, 10)))
	first := prepared(t, s, place("", Buyer, "Buy", 6, 10))
	second := prepared(t, s, place("", Buyer, "Buy", 6, 10))
	ch := make(chan error, 2)
	for _, r := range []CommandRecord{first, second} {
		go func() { _, e := s.Submit(ctx, r.Prepared.RequestID, "integration-verifier-double"); ch <- e }()
	}
	for range 2 {
		if e := <-ch; e != nil {
			t.Fatal(e)
		}
	}
	v, e := s.Snapshot(ctx)
	if e != nil {
		t.Fatal(e)
	}
	conserved(t, &Book{Orders: v.Orders})
	var total int64
	for _, m := range v.Matches {
		total += m.Quantity
	}
	if total != 10 || len(v.Matches) != 2 {
		t.Fatal("concurrent orders overmatched", v)
	}
}
