# Planning provenance / user prompts

Recorded 2026-09-05. This is a disclosure of the task inputs actually available
to the implementation agent, not a claim about when the original idea arose.

## Earlier user-supplied handoff

The user supplied a previous agent's plan headed **HoldBook — ATS-first 計畫與
Context 交接** and asked for implementation in fresh context. It specified:

- HoldBook / fictional NOVA; public `outsider987/hedera-rwa-secondary-market`.
- T00-min → ATS initialization → Equity → KYC/Issue → Hold lifecycle → Go CLOB.
- Git-held `AGENTS.md`, `AI_USAGE.md`, plan and handoff; actual tests and public
  transaction evidence; clean commits at context boundaries.
- React 19.2.8, Vite 8.2.2, TypeScript 7.0.2, ATS SDK 8.0.0.
- MetaMask, Hedera Testnet 296, Resolver 0.0.9212226, Factory 0.0.9213391,
  latest on-chain Equity config resolution with no old-address fallback.
- Nova Private Equity Common Shares / NOVA / USNOVA000016; decimals 0,
  authorized shares 1000; internal KYC / controllable enabled, clearing /
  multi-partition / protected partitions disabled.
- Seller KYC / issue 100; rejection for a non-KYC Buyer; Hold 10, execute 6,
  release 4; human MetaMask approval for all mutations.
- A prohibition on copying a **pre-event master-plan file** into the repository.
  That file was not supplied or read. Its date, contents, and eligibility remain
  unverified. Its absence must not be used to conceal prior project work.

This section is an explicitly labeled summary, not a verbatim archive of that
long imported handoff. The approved replacement spec is saved completely in
`../plans/001-ats-first.md`, including the implementation clarifications.

## Review / planning prompts

User messages, verbatim:

> 我換模型了你看這樣計畫有沒有問題?

> 這樣呢

> 那我們計畫下吧

The review identified missing Equity fields, account/role/VC prerequisites,
Hold negative-test placement, SDK browser validation, self-referential HEAD
recording, and event-provenance disclosure. Source inspections were read-only;
there was no initial implementation to inherit.

## Confirmed decision rounds

| Question | User-selected answer |
| --- | --- |
| 這次計畫要詳細定案到哪裡？ | 先完成 ATS 驗證：CLOB / payment settlement only a later entry point |
| 第一階段的 MetaMask demo 使用哪種帳戶配置？ | 三帳戶：Admin also Escrow, separate Seller and Buyer |
| 第一階段是否定位成 Victor 操作、mentor／評審觀看的英文單頁驗證台，而不是投資人交易介面？ | 本機驗證台：localhost English UI, Chinese handoff |
| KYC 是否維持原計畫的合成測試資料，由 Admin 用 MetaMask 簽署測試 VC，再走 ATS SDK 的驗證與 grant？ | 合成測試 VC: no personal data or real KYC provider |

The replacement plan subsequently fixed the remaining technical defaults,
T00–T04 boundaries and tests. It is the active implementation specification.

## Implementation authorization

User message, verbatim:

> Implement the proposed plan.

The approved plan says to implement only the active ticket and stop at its
boundary. That initial ticket is T00-min. Permission to build the web console
does not authorize signing any transaction or running later tickets.

## Future records

Append subsequent task prompts / decisions as they arrive. Preserve complete
new specs and material implementation prompts, never keys, tokens, wallet
files or unrelated conversation. Victor should supply any additional original
project-specific planning artifacts needed for honest event disclosure.
