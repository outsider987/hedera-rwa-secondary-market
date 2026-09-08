package engine

import (
	"context"
	"net/http"
	"regexp"
)

var matchIDPattern = regexp.MustCompile(`^[1-9][0-9]{0,18}-[1-9][0-9]{0,18}$`)

func (s *Store) RecoverSettlement(ctx context.Context, o SettlementOperation) (SettlementOperation, error) {
	if o.Hash == "" || o.Status == "verified" || o.Status == "reverted" {
		return o, nil
	}
	var v Settlement
	var salt string
	var e error
	if o.SettlementID != "" {
		v, e = s.Settlement(ctx, o.SettlementID)
		salt = v.Salt
	} else {
		e = s.Pool.QueryRow(ctx, "SELECT salt FROM markets WHERE id=$1", Market).Scan(&salt)
	}
	if e != nil {
		return o, e
	}
	proof, e := verifySettlementChain(ctx, o, v, salt)
	if e != nil {
		return o, e
	}
	return s.ApplySettlementEvidence(ctx, o.ID, proof)
}
func settlementRoutes(mux *http.ServeMux, s *Store) {
	mux.HandleFunc("GET /api/settlements", func(w http.ResponseWriter, r *http.Request) {
		values, e := s.Settlements(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		pending, e := s.PendingOperation(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, map[string]any{"settlements": values, "pendingOperation": pending})
	})
	mux.HandleFunc("GET /api/settlements/{id}", func(w http.ResponseWriter, r *http.Request) {
		v, e := s.Settlement(r.Context(), r.PathValue("id"))
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, v)
	})
	mux.HandleFunc("POST /api/settlements/prepare", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			MatchID string `json:"matchId"`
			Action  string `json:"action"`
		}
		if e := decode(w, r, &in); e != nil || !matchIDPattern.MatchString(in.MatchID) {
			fail(w, 400, "Invalid preparation fields")
			return
		}
		block, t, e := LatestSettlementBlock(r.Context())
		if e != nil {
			fail(w, 503, "Chain unavailable; retain original intent")
			return
		}
		o, e := s.PrepareSettlement(r.Context(), in.MatchID, in.Action, block, t)
		if e != nil {
			fail(w, 409, "Action unavailable; query the original operation")
			return
		}
		writeJSON(w, 200, o)
	})
	mux.HandleFunc("GET /api/settlement-operations/{id}", func(w http.ResponseWriter, r *http.Request) {
		if !requestID.MatchString(r.PathValue("id")) {
			fail(w, 400, "Invalid operation ID")
			return
		}
		o, e := s.Operation(r.Context(), r.PathValue("id"))
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		recovered, e := s.RecoverSettlement(r.Context(), o)
		writeJSON(w, 200, map[string]any{"operation": recovered, "verificationPending": e != nil})
	})
	mux.HandleFunc("POST /api/settlement-operations/{id}/transaction", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Hash string `json:"hash"`
		}
		if e := decode(w, r, &in); e != nil || !hashRE.MatchString(in.Hash) || !requestID.MatchString(r.PathValue("id")) {
			fail(w, 400, "Invalid transaction fields")
			return
		}
		o, e := s.Operation(r.Context(), r.PathValue("id"))
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		if e = CheckSettlementHash(r.Context(), o, in.Hash); e != nil {
			fail(w, 409, "Transaction pending or differs; retain the original hash")
			return
		}
		o, e = s.SaveSettlementHash(r.Context(), o.ID, in.Hash)
		if e != nil {
			fail(w, 409, PublicError(e))
			return
		}
		recovered, e := s.RecoverSettlement(r.Context(), o)
		writeJSON(w, 200, map[string]any{"operation": recovered, "verificationPending": e != nil})
	})
	mux.HandleFunc("GET /api/settlement-deployment", func(w http.ResponseWriter, r *http.Request) {
		d, e := s.SettlementDeployment(r.Context())
		if e != nil {
			fail(w, 503, PublicError(e))
			return
		}
		writeJSON(w, 200, d)
	})
	mux.HandleFunc("POST /api/settlement-deployment", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Action string `json:"action"`
		}
		if e := decode(w, r, &in); e != nil || in.Action != "prepare" {
			fail(w, 400, "Prepare a manual deployment; submit its hash through the original operation")
			return
		}
		block, t, e := LatestSettlementBlock(r.Context())
		if e != nil {
			fail(w, 503, "Chain unavailable")
			return
		}
		o, e := s.PrepareSettlement(r.Context(), "", "deploy", block, t)
		if e != nil {
			fail(w, 409, "Recover the existing deployment operation")
			return
		}
		writeJSON(w, 200, o)
	})
}
