# koda-fullstack-assessment

Client Project Tracker — a Laravel REST API (`backend/`) with a Next.js frontend (`frontend/`), built for the Full Stack Developer Technical Assessment.

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

1. SSH into the server and pull the repo.
2. Copy `backend/.env.production.example` → `backend/.env.production` and fill in real values — DB credentials, and R2 credentials under the `AWS_*` keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`, `AWS_ENDPOINT`).
3. Copy `frontend/.env.production.example` → `frontend/.env.production` and fill in real values.
4. Confirm the external Docker networks already exist on the host: `proxy`, `shared-postgres`, `shared-redis`.
5. Build and start: `docker compose -f docker-compose.prod.yml up -d --build`.
6. Generate the app key on first deploy if `APP_KEY` is empty: `docker compose -f docker-compose.prod.yml exec backend php artisan key:generate --force`.
7. Run migrations: `docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force`.
8. Create the Passport personal access client (required for login/register to issue tokens): `docker compose -f docker-compose.prod.yml exec backend php artisan passport:client --personal --no-interaction`.

Traefik picks up the new containers automatically via Docker labels — no manual proxy config needed.

## Technology Choices

- **Backend:** Laravel (PHP) — REST API only, PostgreSQL database
- **Frontend:** Next.js (React/TypeScript)
- **Auth:** Laravel Passport (Bearer tokens) — chosen over Sanctum for OAuth2 compliance; protects all `/projects` routes
- **Local dev:** Laravel Sail (Docker) for the backend

## Assumptions

- Status values: `Planning`, `In Progress`, `On Hold`, `Completed`. Priority values: `Low`, `Medium`, `High` — stored as backed PHP enums, matching the spec exactly.
- `status` and dates are independent fields — a project can be marked `Completed` with a `due_date` in the future (e.g. finished ahead of schedule). Only `due_date >= start_date` is enforced, per the spec.
- Authentication is required to access `/projects` endpoints, even though the spec lists it as optional — added as a bonus feature.
- `GET /projects` is paginated (`per_page` query param, default 10) rather than returning the full list unbounded.

## Technical Reflection

_TODO: answer the assessment's reflection questions (approach, tradeoffs, improvements, challenges, AI tool usage)._
