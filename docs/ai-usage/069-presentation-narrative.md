# Presentation narrative refinement and authorized push — September 12, 2026

Base: `21572a8fe74f07e54c000f0ea58a69e3a6cbe702`.
Victor requested compressing the initial slides, removing Slide 3 ("From certificate to digital share") to prevent misinterpreting the artwork as tokenized ownership, restructuring Verify so 100 NOVA issuance follows the on-chain KYC grant, and unifying Match and Settle using the verified T08 normal case (Match 15-1: 2 NOVA @ 0.10 HBAR = 0.20 HBAR, Block 40258355) instead of the disconnected T05 swap. Victor also requested displaying "Recorded Demo · Wallet not required" in the Header when disconnected on Overview to reduce distraction, and then explicitly authorized “推送吧”.

Affected files:
- `src/App.tsx`: Passes `isDemo` to Header on overview/demo.
- `src/components/Header.tsx`: Displays `Recorded Demo · Wallet not required` when disconnected in demo/overview mode.
- `src/data/presentation.json`: Switches `swap` section from T05 to verified T08 normal case (`038-t08-manual.json`).
- `src/presentation/DemoExperience.tsx`: Links Settle/Prove to `038-t08-manual` report and updates case labels.
- `src/presentation/DemoProof.tsx`: Displays verified 2 NOVA / 0.20 HBAR outcome and links to `038-t08-manual.md`.
- `src/presentation/components/SceneView.tsx`: Adapts pixel animation steps and item amounts to 2 NOVA / 0.20 HBAR and moves issuance to Verify.
- `src/presentation/demoState.ts`: Updates cues with Victor's exact titles, subtitles, and narrative sequence.
- `tests/presentation.test.mjs`: Updates cue titles, timestamps, and T08 snapshot assertions.
- `AI_USAGE.md`, `docs/HANDOFF.md`, and this record.

Validation performed:
- `npm test`: 128 application tests + 36 protobuf decoder tests passed.
- `npm run typecheck`: 0 TypeScript errors.
- `npm run build` and `npm run build:showcase`: Production bundles generated cleanly.
- Dev server tested and verified live at `http://127.0.0.1:5173/`.
No new chain mutation or private key used; Victor confirmed and authorized the push to `origin/feat/t08-settlement`.
