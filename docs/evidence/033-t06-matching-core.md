# T06 matching core — passed

September 8, 2026. Deterministic in-memory NOVA/HBAR limit-order core delivered.
Price/FIFO priority, resting price, partial/multiple fills, remainder cancellation,
self-trade prevention, inclusive expiry, idempotency and checked int64 notional
are covered by runnable Go tests. This is an unfunded allocation algorithm.

Go 1.27.1: `go test ./...`, `go test -race ./...`, `go vet ./...`, and
`go test -fuzz=FuzzConservation -fuzztime=3s` passed. Fuzz ran 67,221 executions.
The six-command replay produces two initial matches totaling 56,000,000 tinybars
and preserves two matched shares when the remaining three are cancelled.
[Structured evidence](033-t06-matching-core.json). No signer, network or chain
mutation exists in the core. Concurrent callers must serialize it; T07 supplies
the database market-row lock. Authentication and durable recovery are T07 work.

The user explicitly authorized continuing T07 after this independent commit;
its exact files and acceptance remain in [spec 003](../plans/003-matching-engine.md).
Manual signatures are pending. No push, merge, T08 or completed exchange claim.
