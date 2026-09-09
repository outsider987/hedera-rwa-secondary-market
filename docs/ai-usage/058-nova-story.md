# NOVA recorded story — September 10, 2026

Base: f5573a699da1c687d9b4388a8c54639c96a308c5. User approved both interactive
certificate and transaction animation after design discussion and web research:
「好go」. [Prompt033](../prompts/033-nova-story.md) and
[plan010](../plans/010-nova-story.md) retain authorization and exact scope.
Codex used impeccable, animate and ponytail; an AI design agent contributed the
prior read-only discussion. No human design/code acceptance is claimed.

Delivered: Overview has two manually stepped chapters using the existing
certificate and native CSS/SVG. T02/T03 creation, synthetic VC, KYC grant and
issuance are distinct. The T08 normal/reverse/cancel/reclaim snapshot supplies
amounts, before/after balances and transaction proofs. Expiry remains in Hold;
no transaction is invented for a match, VC signature or expiry. All controls
only change explanatory state, with keyboard and reduced-motion support.

Affected source: NovaStory, NovaAssetSummary, AssetLifecycle, NovaFlow and
styles.css. NovaFlow's live settlement renderer is preserved; its unused generic
illustration is removed. Documentation: plan010/prompt033, PRODUCT/DESIGN,
ATTRIBUTION, AI_USAGE/HANDOFF, this entry and evidence048 harness/JSON/screenshots.

Validation and raw evidence: [browser harness](../evidence/048-nova-story.mjs),
[results](../evidence/048-nova-story.json). npm ci --prefer-offline --no-audit
passed with unchanged lockfile and pinned Node24.19.0/npm11.17.0. Initial shell
test detected a changed expected heading; the established heading was restored.
Initial server launches found occupied dev/preview ports; existing servers were
reused. Initial element captures included sticky-header artifacts; final captures
use full-page screenshots at scroll top. Detector reported54 advisory palette/
type-ramp entries, zero blocking entries; new styles reuse the incumbent palette.
Existing upstream install-script/eval/chunk-size warnings remain.

Local browser checks block external services and mutation requests. They verify
presentation of saved evidence, not fresh wallet/chain execution or current KYC.
No signer, backend, contract, asset parameter, dependency, push or deployment change.
Stop at local review; no next ticket or further allowed implementation files.

Final checks:116 application +36 protobuf tests passed; typecheck, application
and standalone showcase builds passed. All four dev/preview1440/390 browser
cases pass all issuance/trade steps, exact proof URLs and balances, expiry
retention, keyboard focus/activation, reduced-motion and rapid interruption.
Zero page errors, horizontal overflow or mutation requests. Final desktop/mobile
issuance and settlement captures inspected after the credential/stack refinement.
Screenshots and JSON are retained under evidence048. Working tree was clean
before this ticket; all ticket source/docs/evidence are committed together.
