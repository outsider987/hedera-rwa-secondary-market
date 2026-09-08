package engine

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var requestID = regexp.MustCompile(`^[0-9a-f]{64}$`)

type prepareInput struct {
	Market   string `json:"market"`
	Salt     string `json:"salt"`
	Owner    string `json:"owner"`
	Action   string `json:"action"`
	Side     string `json:"side"`
	Quantity string `json:"quantity"`
	Price    string `json:"price"`
	OrderID  string `json:"orderId"`
}

func decode(w http.ResponseWriter, r *http.Request, v any) error {
	if r.Header.Get("Content-Type") != "application/json" {
		return errors.New("JSON required")
	}
	r.Body = http.MaxBytesReader(w, r.Body, 8192)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if e := d.Decode(v); e != nil {
		return e
	}
	if e := d.Decode(new(any)); e != io.EOF {
		return errors.New("trailing JSON")
	}
	return nil
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func fail(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
func domain(salt string) map[string]string {
	return map[string]string{"name": "HoldBook Unfunded Orders", "version": "1", "chainId": "296", "salt": salt}
}
func typedJSON(p Prepared, salt string) map[string]any {
	t := TypedData(p, salt)
	return map[string]any{"types": t.Types, "primaryType": t.PrimaryType, "domain": domain(salt), "message": t.Message}
}
func Handler(s *Store) http.Handler {
	mux := http.NewServeMux()
	settlementRoutes(mux, s)
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		if e := s.Pool.Ping(r.Context()); e != nil {
			fail(w, 503, "Database offline")
			return
		}
		writeJSON(w, 200, map[string]string{"status": "ready"})
	})
	mux.HandleFunc("GET /api/market", func(w http.ResponseWriter, r *http.Request) {
		v, e := s.Snapshot(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, map[string]any{"market": v.Market, "domain": domain(v.Salt), "serverTime": strconv.FormatInt(v.ServerTime, 10), "version": strconv.FormatInt(v.Version, 10), "orders": v.Orders, "matches": v.Matches, "notice": "Funds are not reserved"})
	})
	mux.HandleFunc("GET /api/orders", func(w http.ResponseWriter, r *http.Request) {
		owner := r.URL.Query().Get("owner")
		if !address.MatchString(owner) {
			fail(w, 400, "Invalid owner")
			return
		}
		v, e := s.Snapshot(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		orders := []Order{}
		for _, o := range v.Orders {
			if o.Owner == owner {
				orders = append(orders, o)
			}
		}
		writeJSON(w, 200, orders)
	})
	mux.HandleFunc("GET /api/matches", func(w http.ResponseWriter, r *http.Request) {
		v, e := s.Snapshot(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, v.Matches)
	})
	mux.HandleFunc("GET /api/commands/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if !requestID.MatchString(id) {
			fail(w, 400, "Invalid request ID")
			return
		}
		v, e := s.Get(r.Context(), id)
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, v)
	})
	mux.HandleFunc("POST /api/commands/prepare", func(w http.ResponseWriter, r *http.Request) {
		var in prepareInput
		if e := decode(w, r, &in); e != nil {
			fail(w, 400, "Invalid or oversized JSON fields")
			return
		}
		v, e := s.Snapshot(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		if in.Market != Market || in.Salt != v.Salt {
			fail(w, 400, "Market or domain differs; reload the market")
			return
		}
		c := Command{Owner: in.Owner, Market: in.Market, Action: in.Action, Side: in.Side, OrderID: in.OrderID}
		if c.Action == "Place" {
			if in.OrderID != "" {
				fail(w, 400, "Server assigns order ID")
				return
			}
			c.Quantity, e = Positive(in.Quantity)
			if e == nil {
				c.Price, e = Positive(in.Price)
			}
		} else if in.Quantity != "0" || in.Price != "0" || in.Side != "" || !requestID.MatchString(in.OrderID) {
			e = errors.New("invalid cancel")
		}
		if e != nil {
			fail(w, 400, "Invalid integer or cancellation fields")
			return
		}
		prepared, e := s.Prepare(r.Context(), c)
		if e != nil {
			fail(w, 400, "Invalid order, owner or unavailable database")
			return
		}
		writeJSON(w, 200, map[string]any{"record": prepared, "typedData": typedJSON(prepared.Prepared, v.Salt)})
	})
	mux.HandleFunc("POST /api/commands", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			RequestID string `json:"requestId"`
			Signature string `json:"signature"`
		}
		if e := decode(w, r, &in); e != nil || !requestID.MatchString(in.RequestID) || len(in.Signature) != 132 {
			fail(w, 400, "Invalid submission fields")
			return
		}
		v, e := s.Submit(r.Context(), in.RequestID, in.Signature)
		if e != nil {
			fail(w, 409, PublicError(e))
			return
		}
		writeJSON(w, 200, v)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// No CORS. Loopback Host + exact browser Origin also resist DNS rebinding.
		if r.Host != "127.0.0.1:8787" && r.Host != "127.0.0.1:4173" && r.Host != "127.0.0.1:5173" {
			fail(w, 403, "Loopback host required")
			return
		}
		origin := r.Header.Get("Origin")
		if origin != "" && origin != Origin && origin != "http://127.0.0.1:5173" {
			fail(w, 403, "Origin rejected")
			return
		}
		if r.Method == "POST" && origin != Origin {
			fail(w, 403, "Use production preview for reviewed commands")
			return
		}
		if strings.HasPrefix(r.URL.Path, "/api/") {
			timeout := 10 * time.Second
			if strings.HasPrefix(r.URL.Path, "/api/settlement-operations/") {
				timeout = 180 * time.Second
			}
			ctx, cancel := context.WithTimeout(r.Context(), timeout)
			defer cancel()
			mux.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		http.NotFound(w, r)
	})
}
