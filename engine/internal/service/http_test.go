package service

import (
	"holdbook/engine/internal/matching"

	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTTPGuards(t *testing.T) {
	h := Handler(&Store{})
	for _, v := range []struct{ host, origin, body string }{{"evil.example", Origin, "{}"}, {"127.0.0.1:8787", "https://evil.example", "{}"}, {"127.0.0.1:8787", "", "{}"}, {"127.0.0.1:8787", "http://127.0.0.1:5173", "{}"}, {"127.0.0.1:8787", Origin, `{"requestId":"x","signature":"x","unknown":true}`}, {"127.0.0.1:8787", Origin, strings.Repeat("x", 9000)}} {
		r := httptest.NewRequest("POST", "http://"+v.host+"/api/commands", strings.NewReader(v.body))
		r.Header.Set("Origin", v.origin)
		r.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code < 400 {
			t.Fatal(w.Code)
		}
	}
}
func TestHTTPPostgres(t *testing.T) {
	s := testStore(t)
	h := Handler(s)
	snap, e := s.Snapshot(context.Background())
	if e != nil {
		t.Fatal(e)
	}
	input := prepareInput{Market: matching.Market, Salt: snap.Salt, Owner: Seller, Action: "Place", Side: "Sell", Quantity: "4", Price: "9000000"}
	raw, _ := json.Marshal(input)
	req := httptest.NewRequest("POST", "http://127.0.0.1:8787/api/commands/prepare", strings.NewReader(string(raw)))
	req.Header.Set("Origin", Origin)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var response struct {
		Record CommandRecord `json:"record"`
	}
	if e = json.Unmarshal(w.Body.Bytes(), &response); e != nil {
		t.Fatal(e)
	}
	if response.Record.Prepared.Deadline != 1300 || response.Record.Prepared.ExpiresAt != 87400 {
		t.Fatal(response)
	}
	if strings.Contains(w.Body.String(), "signature") {
		t.Fatal("signature leak")
	}
	// Deliberately invalid all-zero signature accepted ONLY by this named test double.
	// Exercises the actual HTTP submission/commit/retry route without a private signer.
	verificationDouble := s.Verify
	s.Verify = func(p Prepared, salt, signature string, now int64) (string, error) {
		if signature != "0x"+strings.Repeat("0", 130) {
			return "", errors.New("HTTP verifier double rejected")
		}
		return verificationDouble(p, salt, "integration-verifier-double", now)
	}
	body, _ := json.Marshal(map[string]string{"requestId": response.Record.Prepared.RequestID, "signature": "0x" + strings.Repeat("0", 130)})
	var original string
	for i := 0; i < 2; i++ {
		request := httptest.NewRequest("POST", "http://127.0.0.1:8787/api/commands", strings.NewReader(string(body)))
		request.Header.Set("Origin", Origin)
		request.Header.Set("Content-Type", "application/json")
		out := httptest.NewRecorder()
		h.ServeHTTP(out, request)
		if out.Code != 200 {
			t.Fatal(out.Code, out.Body.String())
		}
		var record CommandRecord
		if e = json.Unmarshal(out.Body.Bytes(), &record); e != nil || record.Status != "accepted" || !record.Verified {
			t.Fatal(record, e)
		}
		if strings.Contains(out.Body.String(), "signature") {
			t.Fatal("raw signature leaked")
		}
		if i == 0 {
			original = out.Body.String()
		} else if original != out.Body.String() {
			t.Fatal("HTTP retry changed durable result")
		}
	}
	for _, path := range []string{"/api/health", "/api/market", "/api/orders?owner=" + Seller, "/api/matches", "/api/commands/" + response.Record.Prepared.RequestID} {
		w = httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", "http://127.0.0.1:8787"+path, nil))
		if w.Code != 200 {
			t.Fatal(path, w.Code)
		}
	}
}
