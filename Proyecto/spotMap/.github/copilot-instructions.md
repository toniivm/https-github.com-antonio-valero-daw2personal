# Copilot Instructions for SpotMap

## Big picture architecture
- Monorepo with **legacy frontend** in `frontend/`, **incremental Vue migration** in `frontend-vue/`, and PHP API in `backend/`.
- Main API entrypoint is `backend/public/index.php` (manual requires + route handling), not a framework router.
- Request flow is: `index.php` → security/CORS/rate limit/logging → controller method in `backend/src/Controllers/` → `DatabaseAdapter`.
- Data backend switches automatically between local MySQL PDO and Supabase based on env keys in `backend/src/DatabaseAdapter.php`.
- Response shape for list endpoints is standardized through `ApiResponse::success(...)`; `GET /spots` returns `data.spots` + `data.pagination` (see `SpotController::index`).

## Service boundaries and integration points
- Keep backend API contracts stable for both frontends (`frontend/` and `frontend-vue/`).
- Vue app builds runtime API base URL from current pathname in `frontend-vue/src/config/runtime.js` and calls `backend/public/index.php/*`.
- Vue network layer is centralized in `frontend-vue/src/services/api.js`; reuse it instead of ad-hoc `fetch` calls.
- Legacy frontend has its own tooling/tests in `frontend/package.json` (Jest + Playwright + production obfuscation scripts).
- Monitoring/admin CLI lives in `backend/cli-logs.php` and `backend/health-check.php` (documented in `backend/CLI_TOOLS.md`).

## Project-specific conventions
- Preserve API prefix style already used by clients: routes appended after `.../backend/public/index.php` (example: `/spots?page=1&limit=24`).
- Keep spot normalization compatible with both schemas (`lat/lng` vs `latitude/longitude`) as done in `DatabaseAdapter` and `frontend-vue/src/stores/spots.js`.
- For new backend endpoints, follow the same pattern as `index.php`: explicit method/path checks and direct controller invocation.
- Use `Config::get(...)` for env access; defaults and `.env` loading are centralized in `backend/src/Config.php`.
- Respect dual-run migration strategy from `docs/VUE_MIGRATION_PLAN.md`: do not replace `frontend/` production entrypoint during feature work.

## Critical local workflows
- Backend setup: copy `backend/.env.example` to `backend/.env`, then run `php backend/init-database.php`.
- Backend tests: from `backend/`, run `composer install` then `php vendor/bin/phpunit` (config in `backend/phpunit.xml.dist`).
- Legacy frontend tests: from `frontend/`, run `npm install` and `npm run test`; e2e via `npm run e2e`.
- Vue migration app: from `frontend-vue/`, run `npm install`, `npm run dev`, `npm run build`.
- DB migrations: `php backend/migrate.php up|status|down`.

## Parallel-agent coordination (important)
- Before editing, check active scope and avoid overlapping files with other agents.
- Prefer splitting work by area: one agent in `frontend-vue/`, another in `backend/src/Controllers/`, another in docs.
- Use the task packs in `docs/COPILOT_PARALLEL_TASKS_VUE.md` for safe delegation and small PR-sized changes.
- If unsure about ownership of a file, add/update documentation or tests first instead of refactoring shared runtime paths.

## Anteproyecto baseline (must follow)
- Treat `docs/ANTEPROYECTO_BASELINE_Y_ROADMAP.md` as product baseline and task-priority source.
- Prioritize Vue migration (`frontend-vue/`) while preserving legacy frontend behavior until cutover.
- Do not propose large stack rewrites (e.g., Laravel/Mongo migration) before MVP parity + quality gates are complete.