# T01a upstream repair research — 2026-09-05

- Human request: [verbatim research instruction](../prompts/008-t01a-protobuf-research.md).
  Clean base `fbe9b9f3ca4d5982049c4ddec0fdb7b1606d644e`; documented `ecf219c`
  verified as ancestor. Active T01a remains blocked; T01b was not activated.
- Codex used primary-source web searches, public npm metadata, integrity-checked
  named tarball members and installed npm's pure override matcher. Ponytail
  guidance favored addressing generated code and matching scope directly.
  No additional agent/reviewer/mentor was consulted or claimed.
- Findings: current published proto 2.31.0 still lacks Key/KeyList depth checks;
  runtime-only/latest-version substitution is not a verified repair. CLI 1.3.3
  uses the runtime decoder generator; a compatible patched rebuild is a concrete
  proposal. Version-qualified child overrides avoided the gRPC declared range
  in eight pure matcher assertions, but the full tree remains untested.
- [Evidence](../evidence/006-t01a-protobuf-research.md) separates observed metadata,
  source checks, prior runtime results and proposed implementation. No fresh
  runtime exploit, installation, decoder generation, SDK integration or audit
  result is claimed. Some web-rendered pages failed; public registry fetches and
  integrity-checked source archives supplied exact package evidence.
- Affected files: research Markdown/JSON, request record, this entry, AI_USAGE
  index, HANDOFF and ATTRIBUTION. Application, package files, tests, prior evidence,
  plan/asset parameters and safety rules remain unchanged. No unchanged project
  or browser checks were repeated; scope/link/data consistency checks performed.
- No source vendored, script approval, secrets/.env/profile access, signer,
  wallet/chain/VC operation, external message, public deployment, push or merge.
  Licenses/primary sources are disclosed in ATTRIBUTION. No human review,
  upstream acceptance, project-license or event-eligibility decision is inferred.
