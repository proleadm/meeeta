# MeetEta

MeetEta helps teams compare time zones, convert time quickly, and find fair overlap windows.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure Google OAuth callback URLs:

- `http://localhost:3000/api/auth/callback/google`
- `https://<your-preview-or-prod-domain>/api/auth/callback/google`

4. Initialize Prisma schema in your database:

```bash
npx prisma db push
npx prisma generate
```

5. Start the app:

```bash
npm run dev
```

## Auth V1 behavior

- `Clocks`, `Convert`, and `Overlap` stay public.
- `Planner` is login-gated with Google OAuth (Auth.js/NextAuth + Prisma adapter).
- Sessions persist via Prisma-backed session records.
- Password gate (`MEETETA_PASSWORD`) remains active and still protects staging access.

## Deploy notes

Set these env vars in Vercel for Preview/Production:

- `MEETETA_PASSWORD` (optional)
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
