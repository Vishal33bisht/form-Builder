# FormCraft

FormCraft is a Typeform-inspired form builder built with the required hackathon stack: Turborepo, tRPC, Zod, Drizzle ORM, PostgreSQL, Next.js, Express, and Scalar API docs.

Creators can build themed forms, publish or unpublish them, collect public responses, and review response analytics. Public users can submit published forms without logging in.

## Demo

- Frontend demo: add deployed frontend URL before final submission
- API documentation: add deployed API `/docs` URL before final submission
- Local frontend: http://localhost:3000
- Local API docs: http://localhost:8000/docs
- Local OpenAPI JSON: http://localhost:8000/openapi.json

Demo creator credentials:

```text
Email: demo@formcraft.io
Password: Demo@1234
```

## Requirements Coverage

- Turborepo monorepo with separate frontend and backend apps
- tRPC API with type-safe client usage
- Zod validation for auth, form inputs, field schemas, and dynamic response validation
- Drizzle ORM schema and migrations for users, forms, fields, responses, and themes
- Scalar API documentation at `/docs`
- Creator authentication with JWT, email/password auth, Google OAuth, and protected dashboard routes
- Create, edit, publish, unpublish, clone, archive, and manage forms
- Dynamic fields: short text, long text, email, number, single select, multi select, checkbox, dropdown, rating, and date
- Required and optional field configuration with validation rules
- Public submission flow for published forms
- Public and unlisted visibility modes
- Explore page shows only public, published forms
- Unlisted forms are accessible only by direct link
- Unpublished, expired, limited, invalid, or unavailable forms do not accept responses
- Response management, pagination, CSV export, and analytics dashboards
- Seeded demo data with 5 themed forms, 8 themes, and 210 responses
- Email notification flow for creators and respondents through SMTP
- Rate limiting for public response submissions
- Landing page and pricing page

## Tech Stack

- `apps/web`: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- `apps/api`: Express, tRPC, Scalar, OpenAPI bridge
- `packages/trpc`: shared API router
- `packages/services`: business logic, auth, email, rate limiting
- `packages/database`: Drizzle ORM schema, migrations, seed script
- `packages/eslint-config`: shared lint configs
- `packages/typescript-config`: shared TypeScript configs

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create `.env` from `.env.example` and fill in:

```text
DATABASE_URL=
JWT_SECRET=
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
NEXT_PUBLIC_API_DOCS_URL=http://localhost:8000/docs
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Run migrations and seed data:

```bash
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:seed
```

Start both apps:

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev          # run web and API apps
pnpm build        # production build
pnpm lint         # lint all apps/packages
pnpm check-types  # TypeScript checks
```

## Google OAuth

Create a Google OAuth web client and add this authorized redirect URI:

```text
http://localhost:3000/auth/google/callback
```

For production, add your deployed callback URL:

```text
<deployed-frontend-url>/auth/google/callback
```

Then set `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI`.

## Email Notifications

SMTP is used when these variables are configured:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

When a response is submitted successfully, FormCraft sends:

- a creator notification to the form owner
- a respondent confirmation when `respondentEmail` is provided

For Gmail, use an app password for `SMTP_PASS`.

## API Docs

Scalar is mounted by the API app:

- Local docs: http://localhost:8000/docs
- Local OpenAPI spec: http://localhost:8000/openapi.json

Protected endpoints require:

```text
Authorization: Bearer <token>
```

You can get a token by calling `POST /api/auth/login` with the demo credentials.

## Seeded Forms

The seed script creates:

- Hogwarts Enrollment Form: public, published, 50 responses
- Startup Pitch Application: public, published, 35 responses
- Anime Character Survey: public, published, 60 responses
- Game Dev Feedback Form: unlisted, published, 25 responses
- Linux Distro Preference Poll: public, published, 40 responses

This gives judges immediate data for explore, public form submission, response management, CSV export, and analytics.


Production environment variables should include:

```text
NODE_ENV=prod
BASE_URL=<deployed-api-url>
FRONTEND_URL=<deployed-frontend-url>
CORS_ORIGINS=<deployed-frontend-url>
NEXT_PUBLIC_API_URL=<deployed-api-url>/trpc
NEXT_PUBLIC_API_DOCS_URL=<deployed-api-url>/docs
```
