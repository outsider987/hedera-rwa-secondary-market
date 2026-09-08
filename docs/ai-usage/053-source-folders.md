# Source folder organization

September 9, 2026. Base791efe615531fa72669c92c3f2422602113ffedf.
User:「我想把src 分類下 util componetn 或你覺得更好的命名folder」
Codex used Ponytail to relocate existing modules without adding abstractions.
[Plan007](../plans/007-source-folders.md) records this bounded authorization.

Three pages now live in src/pages; eleven UI components in src/components;
fourteen named logic modules in src/lib; three JSON files in src/data.
App, entrypoints, styles and existing compat shims stay in place. Direct relative
imports remain; no aliases, barrel files or new dependencies. Tests, artifact
build scripts and executable evidence harnesses follow the new paths.
Architecture and design source links and the architecture folder guide are current. Dated narrative and
recorded JSON evidence retain their original paths and history.

Compared all37 source files with the base: contents match after normalizing
relative path literals; JSON files are byte-identical. No transaction behavior,
asset parameters, wallet storage keys or pinned versions changed.

Validation: npm ci --prefer-offline --no-audit,114 application+36 protobuf tests,
typecheck, application/showcase builds and both contract artifact --check scripts
passed. All four dev/preview1440/390 browser cases passed navigation, sticky Header,
role changes, original selection and draft retention, legacy links, skip link,
inactive polling and no overflow. Overview desktop and Market mobile captures
were visually inspected. [Raw browser results](../evidence/044-source-folders.json)
record actual checks. Existing dependency/install, eval/chunk and Solidity lint
warnings remain; no dependency repair or live chain acceptance was attempted.
Browser harness:
[044-source-folders.mjs](../evidence/044-source-folders.mjs), adapted from042
with current source paths, a selector for the original certificate (the later
animation extension added a second image) and separate output names. Browser
fixtures use isolated read-only accounts and mocked APIs, not actual MetaMask.
No signing, chain write, push, merge or public deployment. Stop at local review;
no next ticket or additional files authorized.
