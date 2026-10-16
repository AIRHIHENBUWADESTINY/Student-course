# LearnHub | Student Learning Dashboard

A student course-registration and learning dashboard with a course catalogue,
semester registration, lessons and progress tracking, backed by
[Supabase](https://supabase.com) for authentication and data.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- Tailwind CSS
- [Supabase](https://supabase.com) — Auth, Postgres (RLS), publishable key

## Setup

### 1. Install and configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase project values
(Project Settings → API):

```bash
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Create the database schema

Run every file in [`supabase/migrations`](supabase/migrations) in numeric order
in the Supabase SQL editor, or with `supabase db push` using the CLI. The
`20260101000000_init.sql` migration creates the `courses`, `lessons`,
`profiles`, `user_settings` and `lesson_progress` tables, enables Row Level
Security, and installs a trigger that provisions a profile and settings row for
every new auth user. The later migrations add course codes, and the
course-registration domain (`registrations`, `portal_settings`, `departments`
and the academic profile/course columns).

### 3. Seed the course catalog

Run [`supabase/seed.sql`](supabase/seed.sql) in the SQL editor. It inserts the
6 courses and 48 lessons. The file is generated from `src/lib/data.ts` — to
regenerate it after editing the catalog:

```bash
npm run seed:generate
```

### 4. Email confirmation (optional, recommended disabled for demos)

The app auto-signs-in a new user after registration. If your Supabase project
has email confirmation enabled, new users are told to confirm their email
before signing in. To get the auto-login flow, disable it under
Authentication → Providers → Email.

### 5. Promote an administrator

New accounts are students. To open the Admin dashboard, a signed-up user must
be given the `admin` role. Add the server-only service role key
(Project Settings → API) to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then promote the user by email (or user id):

```bash
npm run promote:admin -- you@example.com
npm run promote:admin -- --id 00000000-0000-0000-0000-000000000000
```

The `SUPABASE_SERVICE_ROLE_KEY` is a secret — keep it out of browser-exposed
(`NEXT_PUBLIC_`) variables and never commit it.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- The front-end talks to Next.js Route Handlers under `src/app/api/*`.
- Route handlers authenticate the Supabase access token from the
  `Authorization: Bearer` header (`src/lib/supabase/server.ts`) and query
  Postgres through clients configured with that token, so RLS scopes every
  write to the signed-in user.
- On `401` the API client refreshes the access token using the stored refresh
  token and retries the request once (`src/lib/api/client.ts`).