# Source folder organization

September 9, 2026. Base791efe615531fa72669c92c3f2422602113ffedf.
User requested organizing src into sensible folders. Scope: relocate existing
source into pages, components, lib and data; keep app entrypoints and compat.
No behavior, dependency, wallet or contract change. No barrel exports or aliases.
Allowed: src paths and imports; tests/*.mjs, scripts/*.mjs and executable
 docs/evidence/*.mjs source references; docs/ARCHITECTURE.md and DESIGN.md source links;
this plan, docs/HANDOFF.md, AI_USAGE.md, docs/ai-usage/053-source-folders.md;
docs/evidence/044-source-folders.mjs/.json and 044-source-*.png.
Preserve dated prose and recorded evidence; document old → new folder mapping.
Acceptance: exact source relocation comparison, npm ci/test/typecheck/build and
showcase build; dev/preview desktop/mobile navigation and preserved trading state
using isolated read-only fixtures. Stop at local commit, no subsequent ticket.
