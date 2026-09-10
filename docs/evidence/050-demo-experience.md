# Recorded 3D demo acceptance — September 10, 2026

Base: `765c53c3f7c32eedbb84cb159bc256092b6c85db`. [Plan011](../plans/011-demo-experience.md)
is the effective presentation-only authorization; [usage060](../ai-usage/060-demo-experience.md)
records assistance and corrections. No new chain operation or public deployment.

Delivered: Overview, all four narrative scenes, historical HTML Proof, manual
and three-minute Demo Mode, and read-only Market depth/match/status visualization.
T02/T03 issuance, T07 matching and T05 atomic exchange remain separate dated
records. The original story, T08 cases, forms and transaction controllers remain.
The [public snapshot](../../src/data/presentation.json) links each historical source;
Node checks compare it with original evidence, including T05 blocks and principal.

Validation: `npm ci`, `npm test` (121 application +36 protobuf), typecheck,
app build and showcase build pass with the pinned toolchain. Existing package
versions are unchanged; the approved three packages add13 lockfile locations.
Original install/eval/chunk and62 audit findings remain, with current licenses
and runtime notices documented in [ATTRIBUTION](../ATTRIBUTION.md).

The [raw browser results](050-demo-experience.json), [browser harness](050-demo-experience.mjs)
and [frame/context-loss harness](050-demo-performance.mjs) cover dev and preview
at1920×1080,1440×900,390×844. Every cue is exercised, with90 captures across
scene starts/transitions/endpoints. Checks cover keyboard/native control behavior,
focus, HTML information, reduced motion, rapid navigation, idle rendering,
route/reload behavior, WebGL/chunk fallback, visibility pause, and terminal controls.
Market fixtures cover initial/repeated/reconnected snapshots, new-match batches,
stale/empty states, settlement labels, preserved drafts/selection and unresolved
records, including cold Demo recovery notices. No mutation requests or page errors
are accepted. Fixtures use an unsigned public-account double; external reads are
blocked and read-only JSON-RPC is distinguished from writes. No real MetaMask or
new chain verification is claimed.

Representative final captures: [desktop opening](050-demo-final-overview-1440.png),
[desktop Proof](050-demo-final-proof-1440.png), [mobile opening](050-demo-final-overview-390.png),
[mobile Proof](050-demo-final-proof-390.png), [Market desktop](050-demo-market-1440.png)
and [Market mobile](050-demo-market-390.png). Captures are browser evidence, not
new illustration assets. The independent AI finish review approved its inspected
source/capture scope after correcting Compliance and Proof labels/positions; it
was not an independent device or chain audit.

The real sequence reached its final cue after181.222 wall-clock seconds. The
final controls rerun passed after allowing the remounted renderer to initialize
before fault injection; native `WEBGL_lose_context` also passes at all three sizes.
At DPR0.75,120 rAF samples during the lock transition and idle tail give median
16.7ms throughout; p95 is50ms (1920),33.4ms (1440),33.4ms (390). This is Linux
Chrome143/SwiftShader, not sustained GPU throughput: desktop60fps is not established.
The draw-call regression confirms manual movement continues after an idle pause.
[Build log](050-demo-build.log), [test log](050-demo-tests.log),
[full browser log](050-demo-browser-final.log) and [final controls log](050-demo-controls-final.log)
retain actual output, including the corrected harness race.

Victor still performs the narration trial and human visual acceptance on the
actual recording device. Local preview: `http://127.0.0.1:4173/?demo=1#overview`;
[English script and controls](../DEMO.md). Next ticket and allowed files: none.
