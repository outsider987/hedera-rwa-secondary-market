# Submission readiness and authorized integration

September 12, 2026. Base `7f5eb8ecd97aebd8a5a90edd27c7d660cd38b82f`.

Victor requested resolving the audited missing items, then explicitly approved
pushing/merging into main and publicly verifying existing contract source.
[Plan018](../plans/018-submission-readiness.md) records the exact scope and
safety boundaries. There is no ETHGlobal final-submission authorization.

AI assistance: cross-checking repository and public deployment evidence;
correcting stale README/submission/demo/architecture summaries; drafting English
form and Hedera feedback copy; preparing source-hash/runtime-gated public
verification tooling and tests; adding the existing showcase build to Pages;
running checks and preparing CI-gated integration. No application trading,
contract or dependency behavior is changed. No private signer or wallet action.

Victor supplied a dated correction about earlier GPT discussion versus a draft,
preserved in [evidence057](../evidence/057-submission-readiness.md). The complete
earlier chat has not been independently inspected. Project-wide licensing and
organizer decisions remain human responsibilities.

The separate video-editing work used Victor's footage/voice, local transcription
and FFmpeg. Original English subtitles, the added ending, the sentence-aligned
46-second jump and labels on six accelerated silent waits follow his directions.
File identity and actual checks are in [VIDEO](../VIDEO.md); no AI voiceover,
new transaction footage, hosted URL or platform upload is fabricated.

Actual local validation passed: pinned npm ci; 132 application and 36 protobuf
tests; typecheck; main/showcase builds; original swap/settlement artifact checks;
31 Foundry tests; five read-only dev/preview browser cases; 81 local document
links; git diff --check. Existing 62 dependency audit findings and build warnings
remain disclosed rather than silently fixed or presented as an audit.

Public source verification completed for all three existing targets: both
custom contracts returned creation/runtime match, and the ATS NOVA ResolverProxy
returned exact_match using Sourcify's official similarity verification. No
missing ATS metadata was invented. See [source evidence](../evidence/057-contract-verification.json).
The current commit prepares authorized CI-gated PR integration; its actual
publication outcome will be recorded separately after GitHub returns it.
Original dated evidence is unchanged. Next implementation ticket: none.
