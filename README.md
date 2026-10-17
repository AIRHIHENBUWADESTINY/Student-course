<div align="center">

![Deeplearn — app logo, wordmark, dashboard preview and favicon](docs/deeplearn-hero.jpg)

# Deeplearn

**A student course-registration and learning platform.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3FCF8E?logo=supabase&logoColor=white)

</div>

---

Deeplearn helps students browse an academic course catalogue, register courses
for a semester, read course lessons and track their learning progress — all in
one dashboard. It ships with a marketing landing page, an AI registration
assistant, and an administrator console. Authentication, data and file storage
are powered by [Supabase](https://supabase.com).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database & Security](#database--security)
- [Deployment](#deployment)

## Features

- **Landing page & authentication** — public marketing page with sign-in and
  registration; new accounts are auto-provisioned with a profile and settings.
- **Course catalogue** — browse and filter courses by faculty, department and
  level, with fees, credit units and faculty/department metadata.
- **Semester registration** — add or remove courses into a draft, review the
  total credit units and fees, and submit the registration.
- **Unlimited credit units** — students may register as many credit units as
  they need; there is no per-semester cap.
- **Post-submission tracking** — courses added after a submission are tagged
  **NEW** and highlighted, and their fee is calculated separately from the
  previously submitted course list.
- **Lessons & progress** — lesson content is served through a gated API and
  learning progress is tracked per lesson, per course.
- **Course materials** — a generated material catalogue that keeps every
  registered course readable.
- **AI registration assistant** — a chat assistant (Google Gemini) that helps
  students find and register catalogue courses in natural language.
- **Administrator console** — manage courses, departments, portal windows and
  students, and promote or review accounts.
- **Profile & settings** — maintain academic details and application
  preferences.
- **Brand-themed, responsive UI** — blue→teal gradient design system built on
  Tailwind CSS.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [lucide-react](https://lucide.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Backend | Next.js Route Handlers under `src/app/api/*` |
| Auth & data | [Supabase](https://supabase.com) — Auth, Postgres (Row Level Security), Storage |
| AI | Google Gemini (`GEMINI_API_KEY`) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- A **Supabase** project (free tier is fine)

### 1. Install dependencies

```bash
git clone https://github.com/AIRHIHENBUWADESTINY/Student-course.git
cd Student-course
npm install
```

### 2. Configure the environment

Copy the example file and fill in your Supabase project values
(**Project Settings → API**):

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

See [Environment Variables](#environment-variables) for the full list.

### 3. Create the database schema

Run every file in [`supabase/migrations`](supabase/migrations) in numeric order
using the Supabase SQL editor, or with the Supabase CLI:

```bash
supabase db push
```

The `20260101000000_init.sql` migration creates the `courses`, `lessons`,
`profiles`, `user_settings` and `lesson_progress` tables, enables Row Level
Security, and installs a trigger that provisions a profile and settings row for
every new auth user. Later migrations add course codes, pricing, faculty and
department columns, the course-registration domain (`registrations`,
`portal_settings`, `departments`), material progress, lesson storage and the
default course accent.

### 4. Seed the data

Run [`supabase/seed.sql`](supabase/seed.sql) in the SQL editor to insert the
sample courses and lessons, and
[`supabase/seed_academic_catalogue.sql`](supabase/seed_academic_catalogue.sql)
for the full academic catalogue. Both files are generated — regenerate them
after editing the source data:

```bash
npm run seed:generate    # course + lesson sample data
npm run seed:catalogue   # academic catalogue
npm run seed:materials   # course material files
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Tip:** the app auto-signs-in a new user after registration. To enable that
> flow, disable **Authentication → Providers → Email → Confirm email** in
> Supabase.

### 6. Promote an administrator

New accounts are students. To open the admin console, grant a signed-up user
the `admin` role. This uses the server-only service-role key:

```bash
npm run promote:admin -- you@example.com
npm run promote:admin -- --id 00000000-0000-0000-0000-000000000000
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server at `http://localhost:3000`. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from `src/lib/data.ts`. |
| `npm run seed:catalogue` | Regenerate `supabase/seed_academic_catalogue.sql`. |
| `npm run seed:materials` | Generate course material files into `content/course-materials`. |
| `npm run promote:admin -- <email\|--id>` | Grant a user the `admin` role (requires the service-role key). |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base path for API calls. Keep as `/api` to use the built-in Route Handlers. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable (anon) key. Safe to expose to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin only | Server-only secret used by `promote:admin`. **Never expose or commit it.** |
| `GEMINI_API_KEY` | AI assistant | Server-only key for the AI registration assistant. |
| `GEMINI_MODEL` | Optional | Gemini model id. Defaults to `gemini-flash-lite-latest`. |
| `LESSON_STORAGE_BUCKET` | Optional | Private Storage bucket holding lesson bodies. Defaults to `course-lessons`. |
| `MATERIALS_SOURCE_URL` | Optional | Fallback material catalogue used when a course has no committed material file. |

Variables prefixed with `NEXT_PUBLIC_` are bundled into the browser. All other
variables are server-only and must never appear in client code.

## Project Structure

```text
src/app                 App Router pages and API route handlers
src/components          UI primitives, layout, dashboard, auth and landing components
src/lib                 Domain logic (academics, data, format, theme) and server helpers
src/types               Shared TypeScript types
content/course-materials  Generated course material files
scripts                 Data generators and admin tooling
supabase                Migrations, schema and seed SQL
docs                    Documentation assets (README banner)
```

## Architecture

- The front-end talks to Next.js Route Handlers under `src/app/api/*`.
- Route handlers authenticate the Supabase access token from the
  `Authorization: Bearer` header (`src/lib/supabase/server.ts`) and query
  Postgres through clients configured with that token, so Row Level Security
  scopes every read and write to the signed-in user.
- On `401` the API client refreshes the access token using the stored refresh
  token and retries the request once (`src/lib/api/client.ts`).
- Lesson bodies are streamed through a gated route handler
  (`src/app/api/lessons/[lessonId]`) rather than exposed for direct public
  reads.

## Database & Security

- **Row Level Security** is enabled on every table; policies scope rows to the
  authenticated user (and to administrators where appropriate).
- **Server-only secrets** — the Supabase service-role key and the Gemini API
  key are read exclusively in server code and are never sent to the browser.
- **Private storage** — lesson bodies live in a private Supabase Storage
  bucket with policies that require authentication; content is returned only
  through the API.
- **Admin actions** are re-checked server-side; the `admin` role is required
  for the console and its endpoints.

## Deployment

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com) (or any Node host).
3. Add the environment variables from
   [Environment Variables](#environment-variables) in the hosting dashboard.
4. Apply the migrations in `supabase/migrations` to your production Supabase
   project and run the seed files.
5. Deploy. Set `NEXT_PUBLIC_API_BASE_URL` to `/api` unless the API is hosted
   elsewhere.
