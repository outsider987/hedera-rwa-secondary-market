# Seller VC implementation — September 6, 2026

- User authorized implementation through T02 in Prompt 023. Victor remains the
  only approver of each MetaMask signature/transaction; no human acceptance is
  inferred from automated results. Positive dev/preview VC results were requested
  asynchronously and remain Pending until actually reported.
- Codex used Ponytail, existing wagmi/ATS boundaries and genuine published
  Terminal3 APIs. The ECDSA proof fields and UTF-8 hash semantics are adaptations
  of published MIT code; no key-based issuer or verifier modification was used.
- Impeccable context/craft guidance and a separate read-only UI reviewer checked
  the existing console extension. Reviewer found contradictory static pending
  copy, which was corrected. No new visual world, dependencies or assets.
- Files: credentials/evidence, wallet/guards/ats, App/styles; credentials/guards/
  evidence and existing ATS/shell Node tests; evidence 022 harness, JSON, summary
  and offline gallery; this entry, HANDOFF, plan, ATTRIBUTION and AI_USAGE.
- Checks and limits are in evidence 022. TDD started with three failing feature
  tests. Genuine Terminal3 receives no valid synthetic signature. First browser
  attempt revealed duplicate React keys and a dev optimizer reload; keys were
  fixed and browser cases passed. No secrets, transactions, KYC or issuance.
- Next already-authorized stage: NOVA UI, guarded managed SDK wallet patch,
  one preview creation and readback/recovery, exact files in Prompt 023. The
  actual transaction remains gated on the retained human T01 requirements.
- Final verification: 93 Node tests, typecheck/build, 20 existing wallet cases,
  20 SDK cases, 28 VC cases and four final-copy smoke cases passed. The UI
  reviewer scored its sole static-copy finding resolved; no human signing claim.
