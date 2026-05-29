# CRM Sync Dashboard

A production-style SaaS lead management app for a small agency. It captures public inquiries, stores them in PostgreSQL, syncs them to HubSpot as contacts and deals, and gives admins a retry-friendly dashboard for monitoring CRM sync health.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- HubSpot CRM API
- Zod validation
- Server Actions and API routes

## Features

- Public lead form with Zod validation
- Local lead storage with `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, and `LOST` statuses
- HubSpot contact upsert by email
- HubSpot deal creation linked to the contact
- Lead message note creation attempt
- Local HubSpot contact ID and deal ID tracking
- `PENDING`, `SYNCED`, and `FAILED` sync status tracking
- Retry sync button for failed leads
- Admin lead table, filters, detail page, and local status updates
- HubSpot webhook endpoint at `/api/webhooks/hubspot`
- Webhook event logging plus placeholder TODO for signature verification

## Getting Started

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Generate the Prisma client and apply the schema:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public lead form and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Environment Variables

```bash
DATABASE_URL="postgresql://crm_user:crm_password@127.0.0.1:5432/crm_sync_dashboard?schema=public"
HUBSPOT_ACCESS_TOKEN="pat-na1-..."
HUBSPOT_PIPELINE_ID="default"
HUBSPOT_DEALSTAGE_ID="appointmentscheduled"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not commit `.env`. Keep real HubSpot tokens local or in your deployment secret manager.

## HubSpot Private App Setup

1. Create or sign in to a free HubSpot account.
2. Go to Settings -> Integrations -> Private Apps.
3. Create a private app for this project.
4. Add CRM scopes for contacts and deals read/write. If your portal requires granular scopes, include contact object read/write, deal object read/write, and note/engagement write access.
5. Copy the private app access token.
6. Paste it into `HUBSPOT_ACCESS_TOKEN` in `.env`.

Optional: set `HUBSPOT_PIPELINE_ID` and `HUBSPOT_DEALSTAGE_ID` to match your HubSpot pipeline. The defaults are suitable for many fresh HubSpot portals, but production portals usually use custom IDs.

## Webhook Endpoint

HubSpot webhooks can post to:

```text
POST /api/webhooks/hubspot
```

The route stores incoming events in `HubspotWebhookEvent` and updates matching local leads when contact or deal object IDs match. Signature verification is intentionally left as a TODO placeholder in the route because production verification requires the HubSpot app secret and exact deployment URL behavior.

## Useful Commands

```bash
npm run lint
npm run build
npx prisma studio
npx prisma migrate dev
docker compose down
```

## Vercel Deployment

Set these environment variables in Vercel before deploying:

```bash
DATABASE_URL="your-neon-or-postgres-connection-string"
HUBSPOT_ACCESS_TOKEN="your-hubspot-private-app-token"
HUBSPOT_PIPELINE_ID="default"
HUBSPOT_DEALSTAGE_ID="appointmentscheduled"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
```

The build script runs `prisma generate` before `next build`, so Vercel can build the ignored generated Prisma client.

## Project Structure

```text
src/app
  page.tsx                    Public agency landing page and lead form
  admin/page.tsx              Admin dashboard
  admin/leads/[id]/page.tsx   Lead detail page
  api/webhooks/hubspot        HubSpot webhook endpoint
src/components
  leads                       Lead form, badges, status and retry controls
  ui                          shadcn/ui primitives
src/lib
  prisma.ts                   Prisma singleton
  validations                 Zod schemas
src/services
  hubspot.ts                  Isolated HubSpot CRM service layer
prisma/schema.prisma          Lead and webhook event models
```

## Notes for Production

- Add authentication before exposing `/admin`.
- Verify HubSpot webhook signatures before processing events.
- Move CRM sync into a queue for high-volume traffic.
- Add observability for failed sync attempts and webhook processing.
