# T01 manual acceptance — September 6, 2026

Victor exercised the local desktop app with real MetaMask on dev (5173) and production preview (4173). **Core wallet and public-read flows passed; full T01 remains incomplete.** Results distinguish visible screenshots from operator reports in the [structured record](011-t01-manual.json).

| Observed behavior | Evidence |
| --- | --- |
| Three distinct roles verified | Screenshots on both origins; Admin `0.0.10389090`, Seller `0.0.10389111`, Buyer `0.0.10389098` |
| Clear and duplicate prevention | Seller cannot fill the cleared Buyer role; switching to Buyer enables assignment; all roles restored in preview |
| Account and network changes | Active account updates; chain 1 clears verification; chain 296 restores it. Victor confirmed no reconnect/reload was needed |
| Reload requires manual Connect | Explicit Victor report with reconnected screenshot; preview flow reported normal |
| Disconnect/reconnect; reject/retry | Victor explicitly reported both normal; intermediate screenshots were not supplied |
| Deployment and config | Both origins show Resolver 2,115 bytes, Factory 390 bytes and Equity config version **1** |
| Mirror recovery | Buyer initially returned 404, then the same address became verified during guided testing |

MetaMask's asset-view network and site-connection network differed during testing. Selecting Hedera Testnet for the site restored the app automatically; no app defect was established. Role labels do not prove chain permissions. Version 1 is an observation, not a permanent setting.

## Remaining acceptance

Pending human observations: duplicate clicks during a pending connection; independent comparison of all three raw Mirror records; deployment check while disconnected, reload reset and absence of forbidden prompts; mobile layout. Browser/MetaMask versions and the single-wallet environment were not independently recorded. Existing [automated evidence](010-t01b-3-config.md) is retained, not relabeled as human testing.

T01a protobuf, Terminal3/BBS/tar, ATS SDK official-entry/config integration and synthetic VC verification remain unresolved. No NOVA creation or chain transaction is demonstrated. Screenshots remain conversation attachments; unrelated browser UI was not copied into public evidence.

This update changes documentation only. Prior application checks are not presented as rerun results. [Prompts](../prompts/013-t01-manual.md) · [Work record](../ai-usage/017-t01-manual.md).
