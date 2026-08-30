# Memory Atlas

A personal 3D memory atlas and travel diary — record visited countries, photos, stories, and journeys on an interactive globe and map.

Built with React 19, Vite, Tailwind, and `react-globe.gl`. It is a fully static site — accounts, travel data, photos, and the AI features all live in [Supabase](https://supabase.com), so there is no server to run or pay for.

---

## Architecture

| Concern | Where it lives |
| --- | --- |
| Accounts and passwords | Supabase Auth (passwords are hashed by Supabase, never seen by this app) |
| Trips, bucket list, pins | Supabase Postgres, one row per item, row level security scoped to the owner |
| Photos | Supabase Storage, private bucket, served through short-lived signed URLs |
| Map theme, feature toggles | `localStorage` — per-device display preferences only |
| AI story polishing and quotes | Supabase Edge Function calling Gemini; Supabase verifies the caller's session before it runs |

Every table has row level security keyed to `auth.uid()`, so one user can never read or write another's data — this is what makes it safe to ship the Supabase publishable key in the browser bundle.

The Gemini API key is the one credential that must never reach a browser. It lives in the Edge Function's secrets, which is why the AI features run there rather than in the client.

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

The Gemini key does **not** go in this file any more — it belongs to the Edge Function (`supabase secrets set GEMINI_API_KEY=...`). Without it the AI features fall back to canned text and everything else works normally.

`GEMINI_MODEL` is an optional Edge Function secret and defaults to `gemini-3.6-flash`. Google withdraws model ids over time — `gemini-2.5-flash` is already refused for newly created keys — and because the AI routes fall back to canned text on any error, a withdrawn model looks like the feature quietly doing nothing rather than an error. If the AI output ever goes generic, check the server logs for a `Using graceful fallback` warning and list what your key can reach:

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
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # typecheck with tsc
```

The AI features call the deployed Edge Function even in local development, so they need the function deployed (see below) and an internet connection. Everything else works against your Supabase project directly.

---

## Deploying to GitHub Pages

The site is static, so GitHub Pages hosts it for free with no cold starts. A workflow in `.github/workflows/deploy.yml` builds and publishes on every push.

**One-time setup:**

1. **Deploy the Edge Function.** Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then from the repo root:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy ai
   supabase secrets set GEMINI_API_KEY=your-key-here
   ```

   `<your-project-ref>` is the subdomain of your Supabase URL. You can also create the function and set the secret from the dashboard under **Edge Functions**, if you would rather not install the CLI.

2. **Add the build secrets.** In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

   These are needed because Vite inlines them at build time. Do **not** add the Gemini key here — it belongs only in the Edge Function's secrets.

3. **Turn Pages on.** **Settings → Pages → Source: GitHub Actions**.

4. Push, or run the workflow manually from the **Actions** tab. The site lands at `https://<your-username>.github.io/memory-atlas/`.

5. **Point Supabase at it.** **Authentication → URL Configuration** → set **Site URL** and add a **Redirect URL** matching your Pages address, so password-reset links come back to the right place.

The workflow fails the build if the bundle comes out with no Supabase URL in it, which is what happens if you deploy before adding the secrets in step 2.

## Installing it on a phone

The site is a progressive web app, so it installs to the home screen on both iOS and Android with no app store involved.

- **iOS/iPadOS (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** the browser offers **Install app**, or ⋮ → **Add to home screen**.

Installed, it opens full screen with its own icon and no browser chrome. Once a page has been visited online, the app shell and its assets are served from a cache, so it opens offline too — but the trips, photos and AI features all come from Supabase, so they need a connection. Offline is graceful degradation, not an offline mode.

The pieces: `public/manifest.webmanifest` (name, icons, colours), `public/icons/`, and `src/service-worker.js`, which Vite emits to the site root as `sw.js` — a worker only controls the directory it is served from and below, so it cannot live in `assets/`. The manifest's paths are relative, so the same build works from a domain root and from `/<repo>/` on Pages.

The worker caches the HTML document network-first (a deploy is picked up on the next online load) and content-hashed build assets cache-first (a deploy re-downloads only what changed). Supabase requests and signed photo URLs are never intercepted.

---

## Backups

**Settings → Export JSON Backup** downloads all trips, bucket list entries, and pins as a JSON file. **Restore from JSON File** reads one back into your account.

Photos are not included in the export — it references them by storage path rather than embedding them. Supabase takes its own daily database backups on paid plans; on the free tier, the JSON export is your backup, so take one periodically if the data matters.

---

## Notes

- **Photos are downscaled in the browser** to 2048px on the long edge and re-encoded as JPEG before upload, which turns a typical 4 MB phone photo into roughly 300–600 KB. A 1 GB free tier holds a couple of thousand photos at that size.
- **Signed photo URLs last 8 hours** and are re-minted each time the app loads, so a URL copied out of the page will stop working. That is deliberate: the bucket is private.
- **The globe loads on demand.** `three` and `react-globe.gl` are around 1.9 MB of the build — more than twice everything else combined — so `GlobeView` is behind `React.lazy`. Visitors get the app shell and sign-in screen without waiting for it, and the 2D map stays reachable while it downloads. Keep the import dynamic: a static `import` of `GlobeView` anywhere puts three.js back into the initial bundle.
- **The AI routes require a signed-in user.** Without that check the deployed URL would be an open proxy to your Gemini key.
