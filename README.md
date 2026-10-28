# Erhan Karahan — Portfolio & Studio Dashboard

Personal website (portfolio, CV and journal) for a photographer & film maker, with a private dashboard to manage every piece of content on it.

- **Public site** — home (hero, about, selected works, journal, contact), about + resume, portfolio, blog and contact pages.
- **Dashboard** (`/dashboard`) — overview with stats, blog posts with a rich text editor, portfolio projects with galleries, resume, media library, contact inbox and website settings.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Actions, Turbopack) + TypeScript (strict) |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css`; two typefaces only: **Playfair Display** (display) and **Mulish** (UI/body) |
| Database | PostgreSQL 17 + Drizzle ORM (SQL migrations in `drizzle/`) |
| Auth | Better Auth (email + password, sign-up disabled, rate limited) |
| Rich text | Tiptap 3 (ProseMirror) — one schema shared by the editor and the server renderer |
| Storage | Any S3-compatible bucket; SeaweedFS in Docker by default |
| Media | sharp (images), ffmpeg/ffprobe (video), ClamAV (antivirus) |
| UI | Radix primitives, Motion (animations), Sonner (toasts), Lucide icons |
| Deploy | Docker Compose + Caddy (automatic HTTPS) on a VPS |

## Project structure

```
src/
  app/                    Routes only (thin): (site) public pages, (auth)/login, dashboard, api, media
  features/<feature>/     Domain modules: posts, projects, media, resume, messages, settings, overview, site
    queries.ts            Server-only reads (Data Access Layer)
    actions.ts            Server actions (all wrapped by adminAction → auth + validation + safe errors)
    schemas.ts            Zod schemas shared by client and server
    mappers.ts / types.ts Row → DTO mapping, serialisable types
    components/           Feature UI
  components/
    ui/                   Design-system primitives (Button, Field, Dialog, ConfirmDialog, …)
    dashboard/            Dashboard shell (sidebar, header, filters, pagination…)
    site/                 Public site chrome (header, footer, section heading…)
    content-editor/       Shared editing layout (title, publish card)
    rich-text-editor/     Tiptap editor, toolbar, dialogs
    charts/               Small accessible chart components
  hooks/                  Reusable client hooks (uploader queue, server action runner, …)
  lib/
    auth/                 Better Auth server/client + session DAL (requireAdmin, …)
    db/                   Drizzle client and schema
    uploads/              Secure upload pipeline (see below)
    rich-text/            Shared extensions, server renderer, sanitiser
    security/             CSP, rate limiting, client IP, same-origin checks
    storage/              S3 wrapper
scripts/                  migrate, seed, create-admin (CLI)
tests/                    Vitest unit tests
docker/                   Caddyfile, SeaweedFS entrypoint
```

## Security model

**Authentication & authorization**
- Public sign-up is disabled; the only account is created with `npm run admin:create`.
- Sessions are verified on the server *before* rendering: the dashboard layout redirects anonymous visitors, and `/login` redirects signed-in users — no flash of the wrong page. `src/proxy.ts` adds an optimistic cookie check on top.
- Every server action re-checks the session (`adminAction`) and validates input with Zod. Unexpected errors are logged and never leaked to the client.
- Login and password change are rate limited (5 attempts / 5 min); passwords are ≥ 12 characters and hashed by Better Auth (scrypt).

**Uploads** (`src/lib/uploads/`) — nothing is stored until every step passes:
1. **Receive**: multipart body is streamed to a private temp dir with the size limit enforced while streaming (images 25 MB, documents 25 MB, videos 2 GB — configurable).
2. **Detect**: the real type is read from the file's bytes (magic numbers). Only an allow-list is accepted (JPEG, PNG, WebP, GIF, AVIF, MP4/MOV/WebM, PDF, DOCX/XLSX/PPTX). SVG, HTML, archives and executables are rejected; the filename extension must match the content.
3. **Scan**: files are streamed to ClamAV (`clamd`). With `UPLOAD_REQUIRE_SCAN=true` uploads are refused if the scanner is down.
4. **Sanitise**:
   - Images are fully decoded and **re-encoded** with sharp — strips EXIF/GPS, destroys polyglot payloads, caps size to 3840 px, guards against decompression bombs.
   - Videos are validated with ffprobe and **remuxed** with ffmpeg (only the first video + audio stream kept, all metadata dropped, `-protocol_whitelist file` so crafted inputs can't reach the network or other files). A poster frame is generated.
   - PDFs are rejected if they contain JavaScript, launch actions, embedded files, XFA, etc. — including inside compressed object streams and hex-escaped names.
   - Office files are rejected if they contain macros, ActiveX, embedded OLE objects, remote template injection or look like zip bombs.
5. **Store** under a random server-generated key in a **private** bucket, then record metadata. Failures roll back.

Media is served only through `/media/*`: strict key format, `X-Content-Type-Options: nosniff`, a sandboxing CSP and `Content-Disposition: attachment` for documents. Range requests are supported for video seeking.

**Web hardening**
- Nonce-based Content-Security-Policy (`strict-dynamic`) per request, HSTS, `X-Frame-Options: DENY`, strict referrer and permissions policies.
- Rich text is rendered from the editor's JSON through the same schema (unknown nodes rejected), sanitised with an allow-list when saved **and** again when rendered. Images/videos may only point at our own `/media` files; links are limited to http(s)/mailto.
- Contact form: Zod validation, honeypot field, per-IP rate limiting (IPs stored only as HMAC hashes).
- Postgres, S3 and ClamAV are on an internal Docker network; only Caddy is exposed. Containers run as non-root with `no-new-privileges`; the app container is read-only.

## Local development

Requirements: Node.js ≥ 20.9, Docker (for Postgres/S3), ffmpeg (`brew install ffmpeg` / `apt install ffmpeg`) for video uploads.

```bash
cp .env.example .env.local
```

Generate secrets for `BETTER_AUTH_SECRET` and `IP_HASH_SECRET` (`openssl rand -hex 32`), and set `APP_URL=http://localhost:3000`.

```bash
docker compose -f docker-compose.dev.yml up -d
```

```bash
npm install
```

```bash
npm run db:migrate && npm run db:seed
```

```bash
npm run admin:create
```

```bash
npm run dev
```

Open http://localhost:3000 and sign in at http://localhost:3000/login. To scan uploads locally too, start ClamAV with `docker compose -f docker-compose.dev.yml --profile antivirus up -d` and set `CLAMAV_HOST=127.0.0.1`.

`npm run lint`, `npm run typecheck` and `npm test` run the checks. After changing `src/lib/db/schema`, run `npm run db:generate` to create a migration.

## Deploying to the VPS (erhankarahan.com)

Recommended VPS: 2 vCPU / 4 GB RAM (ClamAV alone uses ~1.5 GB), Ubuntu 24.04, Docker Engine with the Compose plugin.

1. **DNS** — create `A` (and `AAAA` if you have IPv6) records for `erhankarahan.com` and `www.erhankarahan.com` pointing to the VPS.
2. **Firewall** — allow only SSH, 80 and 443 (e.g. `ufw allow OpenSSH && ufw allow 80,443/tcp && ufw allow 443/udp && ufw enable`).
3. **Clone and configure**:

   ```bash
   git clone https://github.com/fyernald/erhankarahan-portfolio.git && cd erhankarahan-portfolio
   ```

   ```bash
   cp .env.example .env && chmod 600 .env
   ```

   Edit `.env`: set `APP_URL=https://erhankarahan.com`, strong random values for `BETTER_AUTH_SECRET`, `IP_HASH_SECRET`, `POSTGRES_PASSWORD`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, your `ACME_EMAIL`, and keep `UPLOAD_REQUIRE_SCAN=true`. (`DATABASE_URL`, `S3_ENDPOINT` and `CLAMAV_HOST` are set by Compose.)
4. **Start** — migrations and seed run automatically before the app starts; Caddy obtains TLS certificates:

   ```bash
   docker compose up -d --build
   ```

5. **Create the admin account**:

   ```bash
   docker compose run --rm migrate npx tsx scripts/create-admin.ts
   ```

6. Visit https://erhankarahan.com/login.

**Updating**: `git pull && docker compose up -d --build`.

**Backups** (run from cron):

```bash
docker compose exec -T postgres pg_dump -U portfolio portfolio | gzip > backup-$(date +%F).sql.gz
```

```bash
docker run --rm -v erhankarahan_storage-data:/data -v "$PWD":/backup alpine tar czf /backup/media-$(date +%F).tgz -C /data .
```

The first ClamAV start downloads virus definitions and can take a few minutes; uploads return "scanner unavailable" until it is ready.

## Content tips

- **Settings** controls the hero, about and contact copy and photos, social links, SEO texts and the downloadable CV.
- Mark projects as **Featured** to show them on the home page; drag projects to reorder the portfolio.
- In the editor you can drag & drop or paste images, videos and documents directly into the text; `Ctrl/⌘ + S` saves, `Ctrl/⌘ + K` adds a link.
