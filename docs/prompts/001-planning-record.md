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

This section is an explicitly labeled summary. The original imported task is
preserved below. The approved replacement spec is saved in
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

## Original imported task (body text; inner code fences expanded)

The following is user-supplied historical input, superseded by the approved
replacement plan where they differ. Its instructions are not a second active
specification. No referenced pre-event file was retrieved.

```text
A previous agent produced the plan below to accomplish the user's task. Implement the plan in a fresh context. Treat the plan as the source of user intent, re-read files as needed, and carry the work through implementation and verification.

# HoldBook — ATS-first 計畫與 Context 交接

## 摘要

- 平台：**HoldBook**；虛構股權：**NOVA**。
- Repo：`outsider987/hedera-rwa-secondary-market`。
- 順序：T00-min → ATS 初始化 → Equity → KYC/Issue → Hold lifecycle → Go CLOB。
- 所有決策、進度與證據落在 Git；聊天 context 不作為唯一記憶。

## Context 交接機制

首次執行便建立三層文件：

- `AGENTS.md`：永久規則，包括 ETHGlobal、secrets、測試、MetaMask、AI attribution。
- `docs/plans/001-ats-first.md`：本計畫的定案版本。
- `docs/HANDOFF.md`：目前進度，每個 ticket 結束時更新。

`docs/HANDOFF.md` 固定記錄：

- Current objective 與 Git HEAD。
- 已完成 commits／功能。
- 已鎖定的技術決策與外部地址。
- 執行過的測試及結果。
- Testnet transaction IDs／HashScan links；絕不記錄秘密。
- 未完成項目、阻塞原因、需要 Victor 執行的 MetaMask 操作。
- 下一張 ticket 的精確目標、allowed files、acceptance tests。
- 明確禁止提早加入的功能。

OpenAI 官方長 context 指引也建議在 compaction／handoff 保存 completed actions、active assumptions、IDs、tool results、blockers 與 next goal。[OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.5)

清除 context 前：

1. 完成或停在明確 ticket boundary。
2. 更新 `docs/HANDOFF.md`。
3. 執行測試並記錄結果。
4. Commit 並確認 `git status` clean。
5. 不在未提交且未記錄狀態下清除 context。

新 context 的固定開場 prompt：

Continue the HoldBook ETHOnline 2026 project from the repository state.

Before changing anything:
1. Read AGENTS.md completely.
2. Read docs/HANDOFF.md and the active plan/spec/ADR files it references.
3. Run git status, git log --oneline -10, and inspect the current tree.
4. Verify that the documented HEAD and actual repository state agree.
5. Summarize completed work, current blockers, and the exact next ticket.
6. Implement only that next ticket and its acceptance tests.
7. Update AI_USAGE.md and docs/HANDOFF.md before the final commit.

Never request or expose private keys, seed phrases, or local wallet files.
All chain mutations require Victor to approve them manually in MetaMask.
Do not rely on prior chat context when repository evidence disagrees.

若在 repo 尚未建立前立即清除 context，下一個 context 額外提供：

Bootstrap decisions:
- Product: HoldBook
- Asset: Nova Private Equity Common Shares
- Symbol: NOVA
- ISIN: USNOVA000016
- GitHub: outsider987/hedera-rwa-secondary-market
- First slice: T00-min, then ATS-first
- ATS SDK: exact 8.0.0
- Hedera Testnet chain ID: 296
- Resolver: 0.0.9212226
- Factory: 0.0.9213391
- Resolve Equity config version on-chain before creation
- Do not copy the pre-event master-plan file into the repository

## 實作順序

### 1. T00-min

- 建立 public repo、`main` 分支與自然 commit 歷史。
- 寫入 `AGENTS.md`、`AI_USAGE.md`、plan、handoff、README、`.gitignore`。
- `AGENTS.md` 包含 From Scratch、開源素材揭露、AI attribution、spec/prompt 保存與技術安全規則。
- 建立最小 React/Vite/TypeScript shell 與 CI。
- 鎖定 React `19.2.8`、Vite `8.2.2`、TypeScript `7.0.2`、ATS SDK `8.0.0`。
- 不複製活動前的研究草案。

### 2. ATS v8 初始化

- 使用 MetaMask、Chain ID `296`、Hashio RPC 與 Mirror Node。
- 使用目前 v8 Web App 的 Resolver `0.0.9212226`、Factory `0.0.9213391`。[ATS Web 設定](https://github.com/hashgraph/asset-tokenization-studio/blob/main/apps/ats/web/.env.example)
- 呼叫 `Management.resolveLatestConfigVersion()`；回傳值必須 `>=1`。
- 若解析失敗，停止 mutation 並向 Hedera mentor 確認，不回退舊地址。

### 3. NOVA Equity

- Name：`Nova Private Equity Common Shares`
- Symbol：`NOVA`
- ISIN：`USNOVA000016`
- Decimals：`0`
- Authorized shares：`1,000`
- Internal KYC／Controllable：enabled
- Clearing／multi-partition／protected partitions：disabled
- Equity creation 由 Victor 在 MetaMask 核准。
- 保存 security ID、EVM address、transaction ID、consensus timestamp 與 HashScan URL。

### 4. KYC、Issue 與 Hold

- 依序設定 SSI Manager、加入 Test VC issuer、grant Seller KYC。
- Issue `100 NOVA` 給 Seller。
- 保存未 KYC Buyer 被拒絕的證據，再 grant Buyer KYC。
- 建立 zero-target Hold `10 NOVA`。
- Execute `6 NOVA` 給 Buyer，驗證 remaining `4`。
- Release remaining `4`。
- Hold lifecycle 通過後才開始 Go、PostgreSQL 與 CLOB。

## 驗收與 commits

- 自動：`npm ci`、typecheck、production build。
- 手動：MetaMask network/account guard、config resolve、Equity、KYC、Issue、Hold/execute/release。
- 每筆鏈上操作立即保存 evidence。
- 建議 commits：
  1. `chore: initialize HoldBook guardrails`
  2. `feat(web): add HoldBook testnet shell`
  3. `feat(ats): initialize ATS v8 testnet`
  4. `feat(ats): create NOVA equity`
  5. `feat(ats): prove KYC and issuance`
  6. `feat(ats): prove hold lifecycle`
- 每個 commit 後更新 handoff，確保任何新 context 都能僅靠 repo 接手。
```
