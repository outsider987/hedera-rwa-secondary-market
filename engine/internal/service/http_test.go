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
	h := Handler(&Store{}, Origin, "")
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
	h := Handler(s, Origin, "")
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

func TestDeployedHostAndOrigin(t *testing.T) {
	handler := Handler(&Store{}, "https://holdbook.example", "holdbook-123.run.app")
	for _, item := range []struct {
		host, origin, method string
		status               int
	}{
		{"holdbook-123.run.app", "https://holdbook.example", "GET", 404},
		{"holdbook-123.run.app", "", "GET", 404},
		{"holdbook-123.run.app", "https://holdbook.example", "POST", 404},
		{"evil.example", "https://holdbook.example", "GET", 403},
		{"holdbook-123.run.app", "https://evil.example", "GET", 403},
		{"holdbook-123.run.app", "http://127.0.0.1:4173", "POST", 403},
		{"holdbook-123.run.app", "", "POST", 403},
	} {
		request := httptest.NewRequest(item.method, "https://"+item.host+"/missing", nil)
		request.Header.Set("Origin", item.origin)
		request.Header.Set("X-Forwarded-Host", "holdbook-123.run.app")
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != item.status {
			t.Fatalf("%s %s: %d", item.host, item.origin, response.Code)
		}
	}
}

func TestPagesPreflight(t *testing.T) {
	handler := Handler(&Store{}, "https://outsider987.github.io", "holdbook-123.run.app")
	for _, item := range []struct {
		origin, method, headers string
		status                  int
	}{
		{"https://outsider987.github.io", "POST", "content-type", 204},
		{"https://outsider987.github.io", "GET", "", 204},
		{"https://evil.example", "POST", "content-type", 403},
		{"", "POST", "content-type", 403},
		{"https://outsider987.github.io", "DELETE", "", 403},
		{"https://outsider987.github.io", "POST", "authorization", 403},
	} {
		r := httptest.NewRequest("OPTIONS", "https://holdbook-123.run.app/api/commands", nil)
		r.Header.Set("Origin", item.origin)
		r.Header.Set("Access-Control-Request-Method", item.method)
		r.Header.Set("Access-Control-Request-Headers", item.headers)
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)
		if w.Code != item.status {
			t.Fatalf("preflight %s %s: %d", item.origin, item.method, w.Code)
		}
		if w.Header().Get("Access-Control-Allow-Credentials") != "" {
			t.Fatal("cookies must not be enabled")
		}
		if item.status == 204 && w.Header().Get("Access-Control-Allow-Origin") != item.origin {
			t.Fatal("missing exact origin")
		}
		if item.origin != "https://outsider987.github.io" && w.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Fatal("untrusted origin allowed")
		}
	}
}
