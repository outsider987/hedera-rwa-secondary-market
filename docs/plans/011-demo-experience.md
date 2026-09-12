# HoldBook complete 3D demo experience

September 10, 2026. `based_on_commit: 765c53c3f7c32eedbb84cb159bc256092b6c85db`.
The user supplied the complete implementation plan and requested implementation
in a fresh context. This activates the whole A–D presentation ticket, overriding
older no-animation/dependency and no-next-ticket restrictions within this scope.
The approved visual direction is specific; no separate design approval is needed.

## Delivery and narrative

Overview is a navy stage with 42% claim / 58% 3D overview, champagne NOVA,
white HBAR, purple/cyan system geometry and system typography. Preserve the
existing detailed story, role explanation and four recorded T08 cases below it.
Public claim: “Tokenized equity. Verifiable settlement.” Follow fictional NOVA
shares from issuance to atomic exchange on Hedera Testnet. Always disclose
“Fictional equity · Synthetic KYC · Hedera Testnet”. No real equity/identity claim.

Four scenes plus an overview composition and HTML Proof over completed Atomic:

1. Tokenization: illustrative existing certificate, finite fragments, NOVA marker;
   ATS creation with zero supply, whole shares/cap1000; separate issuance of100
   instances to Seller. Cite T02/T03 September7 evidence. The certificate is not
   an on-chain ownership right.
2. Compliance: Seller stops outside a closed eligibility gate. Admin-issued
   synthetic VC identifies issuer/subject. Credential verification leaves the
   gate closed; the recorded on-chain KYC grant opens it. No full signature,
   real personal data or present-day KYC validity claim.
3. Matching: recorded T07 September8 asks4@0.09 /5@0.10, bid6@0.10, matches
   4@0.09 then2@0.10; bid remaining0 / second ask remaining3. Resting order price,
   same-price server acceptance sequence. Final MATCHED / NOT SETTLED; no asset
   moves between accounts. Link the actual acceptance including its deviations.
4. Atomic: explicitly separate T05 fixed swap,10 NOVA/1 HBAR. Start94/6 held0;
   lock leaves Seller84/held10, Buyer6. Swap contract is ATS Hold escrow. Payment
   call is explanatory, never a separately completed payment. NOVA and HBAR
   deliver synchronously in one transaction; finite network pulse, then stop.
5. Proof: historical September8 settlement block40247134, final verification
   block40247352; Seller84, Buyer16, both held0, Seller principal1 HBAR. Fee
   0.33893288 HBAR is separate. Transaction/report/public download links. End
   HoldBook / Agreement → Settlement → Proof; Market, T08 cases and replay links.

Never splice issuance, T07 matches and T05 balances into one fictitious trade.
All key words, prices, quantities, states and links are HTML outside Canvas.
Explanatory motions take1–2s; the presenter controls pauses; no idle camera drift.

## Demo mode

`?demo=1#overview`: preserve brand/network/nav/exit and operational notices;
expand presentation, collapse details. Manual cues default. Previous/Next,
Replay scene, Restart demo; Space/Right next, Left previous, Escape exit.
Interactive elements keep native keys; ignore modified/repeated keys. Explicit
Play 3-minute sequence, Pause/Resume. Manual navigation stops timed playback.
Leaving Overview, backgrounding or exiting pauses with no catch-up. URL changes
without reload; Market retains normal controller/drafts/selection/unknown records;
return retains presentation position, reload starts opening. No signing shortcuts.

Timed script: overview0–15; tokenize15–35; verify35–60; match60–100;
atomic100–135; proof135–155; inspect proof155–175; closing175–180 seconds.
English narration is retained in DEMO.md.

## Market

Initially expanded, collapsible ~220px visual above existing book/ticket.
Use only existing orders/matches/settlement results/online/update state from
MarketPanel polling. Aggregate remaining quantities into top5 price levels per
side. BigInt arithmetic, normalize only geometry ratios. Keep full order tables.
Only new server match IDs can animate; suppress initial/history/reconnect/page
return replays, deduplicate, batch simultaneous matches with total count/quantity.
Offline retains stale data; empty means empty, never inject demo orders. Live
transitions <=250ms. Show current resolved settlement labels (including Locked,
Ready, Settled, Cancelled, Reclaimed/expiry), not permanent “not settled”. No
extra fetch, API write, algorithm, signature or settlement-handler changes.

## Implementation scope

Exact new pins: three0.185.0, @react-three/fiber9.7.0, @types/three0.185.4.
Existing toolchain/SDK/React pins and repairs remain. No drei, physics,
postprocessing, model/font downloads, shadows/bloom or infinite particle loops.
Lazy scene chunks, next-scene preload, one visible Canvas, demand rendering,
DPR<=1.5, shared geometry/materials and instancing. Reduced motion retains cue
endpoints. WebGL absence/loss or chunk failure falls back to DOM/SVG with controls
and evidence. Rapid navigation cancels obsolete animation work.

Allowed existing files: src/App.tsx, src/components/Header.tsx,
NovaAssetSummary.tsx, MarketPanel.tsx; src/pages/OverviewPage.tsx; src/styles.css;
package.json/package-lock.json. New files: src/presentation/DemoExperience.tsx,
DemoCanvas.tsx, DemoProof.tsx, MarketVisualization.tsx, demoState.ts, marketView.ts,
presentation.css, THIRD_PARTY_NOTICES.txt; scenes/{OverviewScene,TokenizationScene,ComplianceScene,
OrderMatchScene,AtomicSwapScene}.tsx; components/{AssetTokens,HederaNetwork,
ComplianceGate,SceneView}.tsx; src/data/presentation.json;
tests/presentation.test.mjs. SceneView keeps the lazy Canvas boundary small.
Documentation/evidence: this plan; docs/prompts/034-demo-experience.md;
docs/evidence/050-demo-experience.{md,json,mjs},050-demo-*.png and050-demo-*.log; docs/evidence/050-demo-performance.mjs;
docs/ai-usage/060-demo-experience.md; HANDOFF, AI_USAGE, DESIGN, PRODUCT,
ATTRIBUTION, DEMO and SUBMISSION. No backend/contract/wallet/core modifications.

## Acceptance and boundary

A skeleton, B all narratives, C Market integration, D timing/script/verification
are all required. npm ci/test/typecheck/build/build:showcase. Built-in Node tests
cover cue/replay/pause/resume/manual interruption/URL/keyboard, exact evidence,
BigInt depth and snapshot transitions. Browser dev and preview at1920×1080,
1440×900 and390×844: every cue start/transition/end captures; full180s playback;
keyboard/focus, accessible text, reduced motion, WebGL fallback/context loss,
chunk failure, background pause/rapid jumps, no overflow/page errors/hidden
Canvas or idle rendering. Check drafts/selection/unknown operation preservation
and no added signing/writes. Record actual frame timing, browser and emulated
viewport; desktop60fps/mobile30fps are targets, not fabricated device claims.

Finish docs with actual checks/limitations and one provenance entry; commit
locally together. No push, deployment or new chain operations. Victor performs
narration trial and human visual acceptance. Next ticket/allowed files: none.

## Direction contract

THESIS: Make the difference between matched intent and atomic exchange visible.
OWN-WORLD: User-pinned navy stage, champagne NOVA, white HBAR, purple/cyan system
geometry and system typography. Keep the flat trading workbench.
STORY: Explain separate records, then let judges inspect dated proof.
FIRST VIEWPORT: Claim and controls left42%; certificate/asset/hold/network right58%;
five selectable stages below. Demo expands to the available recording width.
FORM: User-specified explanatory3D scene; code-led extension, no direction lottery.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
