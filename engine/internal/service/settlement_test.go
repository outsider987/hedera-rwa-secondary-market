package service

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
)

func TestSettlementPublicVector(t *testing.T) {
	raw, e := os.ReadFile("../../../tests/fixtures/settlement-vector.json")
	if e != nil {
		t.Fatal(e)
	}
	var v Settlement
	if e = json.Unmarshal(raw, &v); e != nil {
		t.Fatal(e)
	}
	digest, e := TermsDigest(v)
	if e != nil || digest != v.Digest {
		t.Fatal(digest, e)
	}
	v.Terms.Price = 9223372036854775807
	if _, e = TermsDigest(v); e == nil {
		t.Fatal("overflow accepted")
	}
}
func TestSettlementPostgresRecovery(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	s.now = func() int64 { return 1788832446 }
	// Synthetic chain evidence is injected only here; production obtains it through the independent verifier.
	oldSell := submit(t, s, prepared(t, s, place("", Seller, "Sell", 1, 10000000)))
	oldBuy := submit(t, s, prepared(t, s, place("", Buyer, "Buy", 1, 10000000)))
	_ = oldSell
	deploy, e := s.PrepareSettlement(ctx, "", "deploy", "40250000", s.now())
	if e != nil {
		t.Fatal(e)
	}
	dh := "0x" + strings.Repeat("1", 64)
	_, e = s.SaveSettlementHash(ctx, deploy.ID, dh)
	if e != nil {
		t.Fatal(e)
	}
	proof := SettlementEvidence{Hash: dh, Contract: "0x" + strings.Repeat("1", 40), Block: "40250001", Timestamp: "1788832446", FeeTinybars: "1", PrincipalTinybars: "0", TransactionID: "explicit-test-double", LogIndices: []string{"0"}}
	if _, e = s.ApplySettlementEvidence(ctx, deploy.ID, proof); e != nil {
		t.Fatal(e)
	}
	d, e := s.SettlementDeployment(ctx)
	if e != nil || d.Cutoff != 2 {
		t.Fatal(d, e)
	}
	if _, e = s.PrepareSettlement(ctx, oldBuy.Result.Matches[0].ID, "lock", "40250002", s.now()); e == nil {
		t.Fatal("historical match admitted")
	}
	submit(t, s, prepared(t, s, place("", Seller, "Sell", 2, 10000000)))
	buy := submit(t, s, prepared(t, s, place("", Buyer, "Buy", 2, 10000000)))
	id := buy.Result.Matches[0].ID
	var wg sync.WaitGroup
	ids := make(chan string, 8)
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			o, e := s.PrepareSettlement(ctx, id, "lock", "40250002", s.now())
			if e != nil {
				t.Error(e)
				return
			}
			ids <- o.ID
		}()
	}
	wg.Wait()
	close(ids)
	first := ""
	for x := range ids {
		if first == "" {
			first = x
		}
		if x != first {
			t.Fatal("duplicate intents")
		}
	}
	h := "0x" + strings.Repeat("2", 64)
	_, e = s.SaveSettlementHash(ctx, first, h)
	if e != nil {
		t.Fatal(e)
	}
	proof.Hash = h
	proof.HoldID = 17
	proof.LogIndices = []string{"1"}
	s.fault = func(stage string) error {
		if stage == "before-commit" {
			return errors.New("injected failure")
		}
		return nil
	}
	if _, e = s.ApplySettlementEvidence(ctx, first, proof); e == nil {
		t.Fatal("failure missing")
	}
	v, e := s.Settlement(ctx, id)
	if e != nil || v.Status != "Unprepared" || v.Terms.HoldID != 0 {
		t.Fatal(v, e)
	}
	s.fault = func(stage string) error {
		if stage == "after-commit" {
			return errors.New("lost response")
		}
		return nil
	}
	if _, e = s.ApplySettlementEvidence(ctx, first, proof); e == nil {
		t.Fatal("lost response missing")
	}
	s.fault = nil
	for i := 0; i < 3; i++ {
		if _, e = s.ApplySettlementEvidence(ctx, first, proof); e != nil {
			t.Fatal(e)
		}
	}
	v, e = s.Settlement(ctx, id)
	if e != nil || v.Status != "Locked" || v.Terms.HoldID != 17 {
		t.Fatal(v, e)
	}
	var count int
	if e = s.Pool.QueryRow(ctx, "SELECT count(*) FROM settlement_events WHERE operation_id=$1", first).Scan(&count); e != nil || count != 1 {
		t.Fatal(count, e)
	}
	if _, e = s.SaveSettlementHash(ctx, first, dh); e == nil {
		t.Fatal("conflicting hash accepted")
	}
	proof.HoldID = 18
	if _, e = s.ApplySettlementEvidence(ctx, first, proof); e == nil {
		t.Fatal("conflicting evidence accepted")
	}
	// A new pool must reconstruct the original operation and match without reapplying it.
	restarted, e := Open(ctx, os.Getenv("HOLDBOOK_TEST_DATABASE_URL"))
	if e != nil {
		t.Fatal(e)
	}
	defer restarted.Pool.Close()
	restored, e := restarted.Operation(ctx, first)
	if e != nil || restored.Hash != h || restored.Status != "verified" {
		t.Fatal(restored, e)
	}
}
func TestSettlementHTTPBoundariesAndOffline(t *testing.T) {
	s := testStore(t)
	handler := Handler(s)
	for _, x := range []struct {
		path, origin, body string
		want               int
	}{{"/api/settlements/prepare", "https://attacker.invalid", `{}`, 403}, {"/api/settlements/prepare", Origin, `{"matchId":"13-1","action":"lock","quantity":"999"}`, 400}, {"/api/settlement-deployment", Origin, `{"action":"prepare","address":"0x123"}`, 400}, {"/api/settlement-operations/invalid/transaction", Origin, `{"hash":"0x1"}`, 400}} {
		r := httptest.NewRequest("POST", "http://127.0.0.1:8787"+x.path, strings.NewReader(x.body))
		r.Header.Set("Origin", x.origin)
		r.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)
		if w.Code != x.want {
			t.Fatal(x.path, w.Code)
		}
	}
	original := publicClient
	publicClient = &http.Client{Transport: offlineTransport{}}
	defer func() { publicClient = original }()
	r := httptest.NewRequest("POST", "http://127.0.0.1:8787/api/settlement-deployment", strings.NewReader(`{"action":"prepare"}`))
	r.Header.Set("Origin", Origin)
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	if w.Code != 503 {
		t.Fatal(w.Code)
	}
	pending, e := s.PendingOperation(context.Background())
	if e != nil || pending != nil {
		t.Fatal("offline read created operation", e)
	}
}

type offlineTransport struct{}

func (offlineTransport) RoundTrip(*http.Request) (*http.Response, error) {
	return nil, errors.New("controlled RPC offline")
}
