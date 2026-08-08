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

**Why did you choose this implementation approach?**
Mainly familiarity. Laravel + Next.js was the easiest stack of the realistic options for me to build well in the time available — building the backend from scratch in plain Node while hand-rolling everything would have been considerably harder, and I'm not adept with Django, ASP.NET, Spring Boot, or Node as backend frameworks. Next.js was the frontend pick for the same reason: I know React/Next well; Vue is workable but less familiar, so it would have cost more time for a worse result.

**What tradeoffs did you make?**
The main one was Passport over Sanctum for authentication. Passport is the heavier, more OAuth2-compliant option — full client/token tables, RSA key pairs — versus Sanctum's simpler personal-access-token model. That bought OAuth2 compliance but cost real time: the Passport encryption keys and personal access client have to be generated and owned correctly on every environment, and that requirement is exactly what caused the production permission bugs during deployment (see Challenges). A simpler Sanctum setup likely would have avoided that class of problem entirely.

**What would you improve if given additional time?**
The Passport implementation. Given more time I'd either harden it properly — bake correct file ownership into the deploy process so it can't regress — or reconsider whether Sanctum would have been the better default for a project this size in the first place.

**What was the most challenging part of this assessment?**
Deployment, by a wide margin. I'd forgotten how difficult deploying a Laravel app gets once a reasonable number of packages are involved — the permission errors in particular were worse than expected: Postgres 15+ leaving the `public` schema un-owned by the app's DB user after `CREATE DATABASE`, and then Passport's own keys and Laravel's log file ending up owned by `root` (from running `artisan` commands via `docker compose exec`, which defaults to root) while PHP-FPM's actual worker processes run as `www-data`. That second one was especially rough to track down, since it produced a 500 on every login with literally no error output anywhere — Laravel's own attempt to log the exception was failing silently for the same ownership reason.

**Did you use AI tools during development?**
Yes — Claude and Gemini, for general development support. Claude specifically for plan generation, frontend design decisions, and integrating the API against the Apidog OpenAPI spec. I typed the actual setup commands myself rather than having AI run them, partly to keep the sequence of what I was doing in my own head rather than outsourcing it entirely.

**AI tool usage.** Used Claude and Gemini for brainstorming and as a sounding board throughout, but typed the setup commands manually rather than letting AI run them — partly to keep the sequence in my own head rather than outsourcing it entirely. Leaned on AI more heavily for the frontend UI (styling, component layout) since that's less central to what this assessment is evaluating, and for live debugging during the production deploy — walking through the Postgres ownership issue and the Passport permissions issue together, verifying each hypothesis against actual container/log output rather than accepting a guess.
