# Pixel motion infographic — September 10, 2026

Base: `2a54f77cdd94a87e4bd3b40456afb7df79cc0107`.
[Plan012](../plans/012-pixel-demo.md) records Victor's pixel-game / motion-infographic
revision and local boundary; [usage061](../ai-usage/061-pixel-demo.md) records
assistance and corrections. No push, deployment, signature or new chain operation.

Delivered: four pixel scenes, introductory trading hall, historical HTML Proof,
manual/180-second controls and flat Market depth bars. Original generated hall
and role/prop atlas have exact prompt sidecars and asset hashes. Critical words,
roles, amounts and evidence remain HTML. CSS only animates finite state changes;
no Canvas, WebGL or game loop. Three/R3F and13 exclusive lockfile entries are
removed; zero surviving package-version changes. Prior evidence050 is preserved.

`npm ci`,121 application +36 protobuf tests, typecheck, app build and showcase
build pass. [Browser results](051-pixel-browser.json) and
[reproducible harness](051-pixel-browser.mjs) cover dev/preview at1920×1080,
1440×900,390×844: all22 cues,48 settled captures, role/amount readability,
keyboard/native focus, after-idle animation, same-duration atomic routes, finite
motion, rapid jumps, reduced motion, URL/route/reload behavior, failed images,
clock-controlled180s/pause/resume/background pause. Market public fixtures cover
batch new matches, duplicates/reconnect/stale data, settlement labels, drafts,
selection, unknown records and cold Demo recovery notices. No horizontal overflow,
page errors or mutation requests were observed. Read-only RPC is blocked and
recorded separately. No fresh MetaMask/chain acceptance is claimed.

Examples: [desktop opening](051-pixel-5173-1440-cue0.png),
[desktop exchange](051-pixel-5173-1440-cue17.png),
[mobile opening](051-pixel-5173-390-cue0.png),
[mobile exchange](051-pixel-5173-390-cue17.png),
[Market](051-pixel-market-1440.png). The generated art is decorative fictional
scenery and props, not imported game IP or on-chain proof. Its failed alpha
attempt was rejected; the selected navy atlas is clipped at display time without
changing PNG pixels. [Attribution](../ATTRIBUTION.md) retains provenance.

The [real playback](051-pixel-playback.json) reached cue21 in181.278 wall-clock
seconds.120 rAF samples around the lock transition and idle tail give median
and p95 about16.7ms at1440 and390; this is Linux Chrome143 with GPU disabled,
not physical-device acceptance. The [playback harness](051-pixel-playback.mjs)
retains the measurement. Independent AI review initially found faded completed
rows and the missing acknowledgement; both were fixed and the bounded verdict
was **ship**. DESIGN.md was documented after those source fixes. A dev recapture
was replaced after file-watch state loss; a later browser closure during mobile
Market checks required a separate successful boundaries rerun. Raw
[full browser log](051-pixel-browser.log), [boundaries log](051-pixel-boundaries.log),
[test log](051-pixel-tests.log) and [build log](051-pixel-build.log) retain actual output.

Victor still performs narration rehearsal and human visual acceptance on the
recording device. Preview: `http://127.0.0.1:4173/?demo=1#overview`;
[English script](../DEMO.md). Next ticket and allowed files: none until authorized.
