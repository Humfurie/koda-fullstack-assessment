# koda-fullstack-assessment

Client Project Tracker — a Laravel REST API (`backend/`) with a Next.js frontend (`frontend/`), built for the Full Stack Developer Technical Assessment.

## Features Implemented

- Full REST API for `projects` — all 5 `Route::apiResource` endpoints (list, create, show, update, delete)
- `projects` schema and validation matching the spec: name, description, status, priority, start/due dates
- Status (`Planning`, `In Progress`, `On Hold`, `Completed`) and priority (`Low`, `Medium`, `High`) as backed PHP enums
- Pagination on `GET /projects` (`per_page` query param, default 10)
- Token-based authentication via Laravel Passport (register, login, logout, Bearer tokens); all `/projects` routes protected behind `auth:api`
- OpenAPI spec (`apidog.openapi.json`) covering both auth and project endpoints, with bearer token security scheme, for API testing via Apidog
- Seeder with 12 sample projects
- Next.js frontend — project list, card view, status/priority badges
- Local development environment via Laravel Sail (PHP, PostgreSQL)
- Production deployment setup: Docker Compose (multi-stage builds for backend/frontend) behind an existing Traefik reverse proxy, with shared external Postgres/Redis services

## Development Log

- Scaffolded Laravel API structure (model, migration, controller, form requests, resource, factory, seeder)
- Defined `projects` table schema and validation rules per spec
- Added status/priority as backed PHP enums
- Wired up `Route::apiResource` for all 5 REST endpoints
- Seeded the 12 sample projects
- Added an OpenAPI spec (`apidog.openapi.json`) for API testing via Apidog
- Set up Laravel Sail for local Docker development (PHP, PostgreSQL)
- Added Laravel Passport for OAuth2-based API authentication (register/login/logout, Bearer tokens)
- Protected all `projects` routes behind `auth:api` middleware
- Updated OpenAPI spec with Auth endpoints and bearer token security scheme
- Added pagination support to `GET /projects` (`per_page` query param)
- Fixed `ProjectFactory` to keep `due_date` after `start_date`
- Scaffolded Next.js frontend (project list, card view, status/priority badges)
- Added production deployment setup (Docker Compose + Traefik)

## Setup Instructions

### Backend (Laravel + Sail)

```bash
cd backend
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan passport:client --personal --no-interaction
```

API is available at `http://localhost/api`.

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000` by default; point it at the backend API URL via its `.env.local`.

## Production Deployment

Deployed to a self-hosted server (`koda.humfurie.org`). Production runs as three containers defined in `docker-compose.prod.yml` (repo root): `backend` (Laravel API, php-fpm + nginx), `backend-worker` (queue worker, same image as `backend`), and `frontend` (Next.js, `next start` on standalone output). Traefik was already running on the host as a reverse proxy before this project — it's not provisioned by this repo, just attached to via the external `proxy` network and labels on each container. `/api/*` routes to `backend`, everything else to `frontend`. Postgres and Redis are shared external services (`shared-postgres`, `shared-redis` networks) already running on the host, not provisioned by this compose file. File storage uses Cloudflare R2 (S3-compatible, via Laravel's `s3` driver).

**Deploy steps:**

1. SSH into the server and clone the repo (or `git pull` if it's already there):
   ```bash
   git clone <repo-url> koda-fullstack-assessment
   cd koda-fullstack-assessment
   ```
2. Copy `backend/.env.production.example` → `backend/.env.production` and fill in real values — DB credentials, and R2 credentials under the `AWS_*` keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`, `AWS_ENDPOINT`).
3. Copy `frontend/.env.production.example` → `frontend/.env.production` and fill in real values.
4. Confirm the external Docker networks already exist on the host: `proxy`, `shared-postgres`, `shared-redis`. `shared-postgres` is a single Postgres server shared across multiple projects on the host — this repo doesn't provision or own it, so the app's database has to be created there manually the first time:
   ```bash
   docker exec -it shared-postgres psql -U postgres -d postgres -c "CREATE DATABASE koda;"
   docker exec -it shared-postgres psql -U postgres -d koda -c "ALTER DATABASE koda OWNER TO <db_user>;"
   ```
   The `ALTER DATABASE ... OWNER TO` step matters on Postgres 15+: `CREATE DATABASE` alone leaves the `public` schema owned by `pg_database_owner`, and the app's non-superuser DB user won't have `CREATE` rights on it until it's made the database owner — otherwise migrations fail with `permission denied for schema public`.
5. Build and start all services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
6. Shell into the backend container as `www-data` (not root — see the Passport caveat below) and run first-deploy setup from inside:
   ```bash
   docker compose -f docker-compose.prod.yml exec -u www-data backend sh
   ```
   Then, inside that shell:
   ```sh
   php artisan key:generate --force      # only if APP_KEY is empty
   php artisan migrate
   php artisan db:seed                   # optional, see Faker caveat below
   php artisan passport:keys
   php artisan passport:client --personal --name="koda Personal Access Client"
   exit
   ```

Traefik picks up the new containers automatically via Docker labels — no manual proxy config needed.

For subsequent deploys (code already migrated/seeded once), steps 5 and a plain `php artisan migrate --force` for any new migrations are usually all that's needed — skip `db:seed` and the Passport key/client steps unless the database or `storage/oauth-*.key` files were reset.

### Troubleshooting: login/register return a silent 500

**Symptom:** `/api/login` and `/api/register` return `{"message":"Server Error"}` (500) with valid credentials, but nothing appears in `storage/logs/laravel.log` — even though the exact same request succeeds when run in-process via `artisan tinker`.

**Cause:** `php artisan passport:keys` (and `passport:client`) were run via `docker compose exec`, which runs as `root` inside the container by default. That leaves `storage/oauth-private.key` and `storage/oauth-public.key` owned by `root`. PHP-FPM's actual worker processes run as `www-data`, so real HTTP requests can't read the private key to sign a token — `createToken()` throws, and because the failure happens while Laravel is also trying (and failing) to write the exception to `laravel.log` — which was *also* root-owned from the same `docker compose exec` sessions — the error gets swallowed silently instead of logged.

**Fix applied:**
```bash
docker compose -f docker-compose.prod.yml exec backend chown www-data:www-data \
  storage/oauth-private.key storage/oauth-public.key storage/logs/laravel.log
```

**Prevention:** run `passport:keys`, `passport:client`, and any other `artisan` command that writes to `storage/` as the `www-data` user, not root — e.g. `docker compose exec -u www-data backend php artisan passport:keys`. Step 8/9 above already reflect this.

### Known caveat: `db:seed` requires Faker in production

`fakerphp/faker` is currently listed under `require` (not `require-dev`) in `backend/composer.json` so that `php artisan db:seed` works in production for this assessment/demo deployment (production builds run `composer install --no-dev`, which skips `require-dev` packages). This is only a stopgap — Faker is a dev/testing tool and shouldn't ship in a real production `vendor/` directory. Before this app leaves the assessment/demo stage: move `fakerphp/faker` back to `require-dev`, drop `php artisan db:seed` from the deploy process, and seed any needed reference data via a dedicated, non-Faker seeder or a one-time SQL import instead.

## Technology Choices

- **Backend:** Laravel (PHP) — REST API only, PostgreSQL database
- **Frontend:** Next.js (React/TypeScript)
- **Auth:** Laravel Passport (Bearer tokens) — chosen over Sanctum for OAuth2 compliance; protects all `/projects` routes
- **Local dev:** Laravel Sail (Docker) for the backend

## Assumptions Made

- Status values: `Planning`, `In Progress`, `On Hold`, `Completed`. Priority values: `Low`, `Medium`, `High` — stored as backed PHP enums, matching the spec exactly.
- `status` and dates are independent fields — a project can be marked `Completed` with a `due_date` in the future (e.g. finished ahead of schedule). Only `due_date >= start_date` is enforced, per the spec.
- Authentication is required to access `/projects` endpoints, even though the spec lists it as optional — added as a bonus feature.
- `GET /projects` is paginated (`per_page` query param, default 10) rather than returning the full list unbounded.

## Technical Reflection

**Approach.** Built the API first: model, migration, controller, form requests, resource, factory, and seeder for `projects`, scaffolded with `artisan make:*` rather than hand-written, then `Route::apiResource` for all 5 REST endpoints. Status and priority went in as backed PHP enums to match the spec exactly. Auth came next — `php artisan install:api` plus Laravel Passport, chosen over a simpler token approach for OAuth2 compliance, with all `/projects` routes protected behind `auth:api`. Local development ran on Laravel Sail (Docker) rather than a bare PHP install, so the dev environment stays close to how production would run. The frontend is Next.js rather than my usual React + Inertia, since Next paired better with a plain REST API and matches the assessment's stated stack. Production deployment reused Docker Compose + Traefik patterns from two of my other self-hosted projects, attaching to an already-running Traefik instance and shared external Postgres/Redis rather than provisioning new ones.

**Tradeoffs.** Skipped a `ProjectPolicy`-based authorization layer — I generated one (`make:policy ProjectPolicy`) but backed out once I realized doing it properly (the way I've done it before, with wildcard permissions) would need a full roles-and-permissions system, which felt like more scope than this assessment calls for. Skipped implementing a second Passport OAuth grant type (password grant) for the same reason: not worth adding without an actual case for it. `GET /projects` is paginated (`per_page`, default 10) instead of returning everything unbounded, since that's the safer default for a list endpoint even though the spec didn't require it.

**Challenges.** Production deployment surfaced most of the real problems, almost all permissions-related in one way or another:
- Postgres 15+'s ownership model: creating the `koda` database as the `postgres` superuser left the `public` schema owned by `pg_database_owner`, so the app's own DB user had no rights on it until the database was explicitly re-owned to that user (`ALTER DATABASE koda OWNER TO <user>`) — running `ALTER SCHEMA public OWNER TO <user>` alone wasn't enough on its own the first time, since the app user still wasn't a member of `pg_database_owner`.
- Passport's `passport:keys` and `passport:client` were run via `docker compose exec`, which defaults to `root` — leaving `storage/oauth-*.key` (and, incidentally, `storage/logs/laravel.log`) owned by `root` while PHP-FPM's actual worker processes run as `www-data`. The result was a 500 on every login/register with zero error output anywhere, since Laravel's own attempt to log the exception failed silently too. Root-caused by comparing an in-process `tinker` run (worked, ran as root) against the real HTTP path (failed, ran as `www-data`) with identical input.
- PHP 8.4 vs 8.3: `composer.lock` had been resolved against PHP 8.4, but the production Dockerfile was still pinned to `php:8.3-fpm-alpine`, so the container refused to boot at all until the base image was bumped.
- Traefik routing: the app's routers only referenced the `websecure` (443) entrypoint, so I added `web` (80) explicitly alongside it.
- More generally: shared infrastructure (one Postgres, one Redis, one Traefik instance serving several unrelated projects on the same host) means fixes in this app can't assume they're the only workload — the DB and schema-ownership commands especially had to be scoped narrowly to avoid touching other projects' data.

**Improvements, given more time.** Move `fakerphp/faker` back to `require-dev` and replace the demo `db:seed` step with a non-Faker way to load reference data — it's currently in `require` purely so seeding works in a `--no-dev` production build, which isn't something that should ship long-term. Add a real roles/permissions layer if multi-user access control ever becomes a requirement, rather than the current single-tier `auth:api` gate. Bake the `www-data` ownership fix into `startup.sh` so a fresh `passport:keys` run can't silently regress into the same root-owned-file bug. Self-hosting on my own hardware is also a real risk noted in `Thoughts.md` — a power outage takes the whole thing down, which wouldn't be true on managed infrastructure.

**AI tool usage.** Used Claude and Gemini for brainstorming and as a sounding board throughout, but typed the setup commands manually rather than letting AI run them — partly to keep the sequence in my own head rather than outsourcing it entirely. Leaned on AI more heavily for the frontend UI (styling, component layout) since that's less central to what this assessment is evaluating, and for live debugging during the production deploy — walking through the Postgres ownership issue and the Passport permissions issue together, verifying each hypothesis against actual container/log output rather than accepting a guess.
