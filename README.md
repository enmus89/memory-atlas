# Memory Atlas

A personal 3D memory atlas and travel diary — record visited countries, photos, stories, and journeys on an interactive globe and map.

Built with React 19, Vite, Tailwind, and `react-globe.gl`, with an Express server for the AI features. Accounts, travel data, and photos live in [Supabase](https://supabase.com).

---

## Architecture

| Concern | Where it lives |
| --- | --- |
| Accounts and passwords | Supabase Auth (passwords are hashed by Supabase, never seen by this app) |
| Trips, bucket list, pins | Supabase Postgres, one row per item, row level security scoped to the owner |
| Photos | Supabase Storage, private bucket, served through short-lived signed URLs |
| Map theme, feature toggles | `localStorage` — per-device display preferences only |
| AI story polishing and quotes | Express server calling Gemini, behind a signed-in-user check |

Every table has row level security keyed to `auth.uid()`, so one user can never read or write another's data — this is what makes it safe to ship the Supabase publishable key in the browser bundle.

---

## Setup

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a project. The free tier (500 MB database, 1 GB file storage) comfortably covers a handful of users.

### 2. Apply the schema

In the Supabase dashboard, open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the tables, the row level security policies, the signup trigger, and the private `memory-photos` storage bucket.

The script is safe to re-run if you need to apply it again.

### 3. Configure signup

Under **Authentication → Sign In / Providers**, make sure **Email** is enabled.

Under **Authentication → Sign In / Providers → Email**, decide on **Confirm email**:

- **Off** — new users can sign in immediately after registering. Simplest for a small, trusted group. The app handles this path.
- **On** — users must click a link in a confirmation email first. The app detects this and tells them to check their inbox. Note that Supabase's built-in email service is rate-limited (a few messages per hour) and is not meant for production volume; for anything beyond testing, configure your own SMTP provider under **Project Settings → Auth → SMTP Settings**.

Anyone who reaches the app can register. If you want to limit it to specific people, the simplest approach is to turn off public signups under **Authentication → Sign In / Providers** and invite users directly from **Authentication → Users → Invite**.

### 4. Set environment variables

```bash
cp .env.example .env.local
```

Fill in from **Supabase dashboard → Project Settings → API**:

- `VITE_SUPABASE_URL` — your project URL, from **Settings → Data API** (or the **Connect** button in the top bar)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — from **Settings → API Keys**

  Newer projects show a **publishable key** starting with `sb_publishable_`; older ones show an **anon public** key that looks like a JWT. Either works — `VITE_SUPABASE_ANON_KEY` is still accepted as an alias if you have the older kind.

Optionally add `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey) to enable the AI writing features. Without it, those features fall back to canned text and everything else works normally.

`GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. Google withdraws model ids over time — `gemini-2.5-flash` is already refused for newly created keys — and because the AI routes fall back to canned text on any error, a withdrawn model looks like the feature quietly doing nothing rather than an error. If the AI output ever goes generic, check the server logs for a `Using graceful fallback` warning and list what your key can reach:

```bash
curl -s https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: $GEMINI_API_KEY"
```

> **Never** put the Supabase **secret** key (`sb_secret_...`, or the legacy `service_role`) in this project. It bypasses row level security entirely, so it would void every access rule in `schema.sql`. Only the publishable/anon key belongs here.

### 5. Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production client bundle + server
npm start        # run the production build
npm run lint     # typecheck with tsc
```

---

## Deploying

The app is one Node process that serves both the API and the built client, so any host that runs a Node web service works. [Render](https://render.com) and [Railway](https://railway.app) are the least fuss; both deploy straight from a GitHub repo.

**Settings:**

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Environment | `NODE_ENV=production` |

Then add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and (optionally) `GEMINI_API_KEY` as environment variables in the host's dashboard.

**Two things that catch people out:**

1. **`VITE_*` variables are read at build time, not run time.** Vite inlines them into the bundle during `npm run build`. If you add or change one, you must trigger a fresh build — restarting the service is not enough.

2. **The port comes from the host.** The server reads `process.env.PORT` and falls back to 3000. Don't hardcode a port in your host's config.

After the first deploy, add your deployed URL to Supabase under **Authentication → URL Configuration → Site URL** and **Redirect URLs**, so password reset and email confirmation links point back to the right place.

---

## Backups

**Settings → Export JSON Backup** downloads all trips, bucket list entries, and pins as a JSON file. **Restore from JSON File** reads one back into your account.

Photos are not included in the export — it references them by storage path rather than embedding them. Supabase takes its own daily database backups on paid plans; on the free tier, the JSON export is your backup, so take one periodically if the data matters.

---

## Notes

- **Photos are downscaled in the browser** to 2048px on the long edge and re-encoded as JPEG before upload, which turns a typical 4 MB phone photo into roughly 300–600 KB. A 1 GB free tier holds a couple of thousand photos at that size.
- **Signed photo URLs last 8 hours** and are re-minted each time the app loads, so a URL copied out of the page will stop working. That is deliberate: the bucket is private.
- **The AI routes require a signed-in user.** Without that check the deployed URL would be an open proxy to your Gemini key.
