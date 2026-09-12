# Architecture diagrams

Date: September 9, 2026. Base: `385a753881cbdde5d6debf13ce35c02ec998f5ac`.
User asked how ATS SDK, Go, contracts and frontend interact, then requested saving
the diagrams. Codex translated the explanation to English Mermaid in
ARCHITECTURE.md and updated HANDOFF/AI_USAGE. No source code changed.

Checked the order signature path in src/market.ts, SDK/direct wallet paths in
src/settlement.ts, configuration reads in src/ats.ts and the atomic delivery/payment
path in contracts/NovaSettlement.sol. Diagrams distinguish SDK location, backend
read-only verification, local intent persistence and manual approvals. HBAR payment
is drawn to the seller account explicitly. Source-link existence and whitespace
checks passed; no Mermaid rendering test or runtime suite was run for this prose
change. No chain action, push or publication occurred.
