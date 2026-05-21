# Excel Sequence Generator Launch Preflight

Date: 2026-05-20
Project path: `D:\toolsites\excel-sequence-generator`
Target domain: `https://rowlabeler.com`
Target host: Vercel

## Current Status

Status: deployed to Vercel production and custom domain cutover is complete.

The application code builds, public routes render on Vercel, and the production config points at `https://rowlabeler.com`.

Production deployment:

- Vercel project: `hk123s-projects/rowlabeler`
- Initial production deployment: `https://rowlabeler-9tn4kebof-hk123s-projects.vercel.app`
- Vercel alias: `https://rowlabeler.vercel.app`
- Deployment id: `dpl_3nEBKjAGsBHLbye6DFFBEeUXSRgF`
- Current deploy source: GitHub `HK-COOL/rowlabeler`, branch `main`
- Latest documented main commit at closeout: `601d18f feat: add SKU and invoice long-tail pages`
- Custom domains added and aliased in Vercel:
  - `rowlabeler.com`
  - `www.rowlabeler.com`
- Cloudflare DNS:
  - `A rowlabeler.com 76.76.21.21`
  - `A www.rowlabeler.com 76.76.21.21`
  - both records are DNS-only
- Vercel certificates:
  - `rowlabeler.com`: issued
  - `www.rowlabeler.com`: issued

## Verified Locally

- Tool logic: `pnpm exec tsx scripts/verify-excel-sequence-generator.ts`
- Site quality: `pnpm exec tsx scripts/verify-site-quality.ts`
- TypeScript: `pnpm exec tsc --noEmit`
- Production build path: `$env:VERCEL='1'; $env:CI='1'; $env:NEXT_TELEMETRY_DISABLED='1'; pnpm exec next build`
- Local browser checks on `http://localhost:3001`:
  - homepage
  - `/#generator`
  - `/blog`
  - `/zh/blog`
  - `/blog/generate-400000-account-labels-without-dragging`
  - `/zh/blog/generate-400000-account-labels-without-dragging`

## Launch Blockers

No public launch blocker remains for the deterministic v1 tool.

Before enabling auth/admin/payment features, confirm production database strategy.
   Current production env uses local SQLite:
   `DATABASE_URL = "file:data/local.db"`
   This is fine for a static/deterministic v1 only if the chosen host supports persistent local storage or the DB-backed features remain unused. For Vercel, prefer a hosted database or explicitly keep auth/admin/payment features disabled and unlinked.

## SEO And Crawlability Notes

- `src/app/robots.ts` is the active robots route. Do not add `public/robots.txt`.
- `public/sitemap.xml` should include only public, canonical, indexable URLs.
- Legal pages exist but are disallowed in robots, so they are intentionally excluded from sitemap.
- Private/auth/admin/settings/activity/API routes are blocked, including localized variants.

## Known Non-Blocking Caveats

- Local Windows standalone builds may fail on symlink permissions. Use `VERCEL=1` locally to verify application build health for Vercel-style deployment.
- During Vercel static generation, the template logs `get configs from db failed: no such table: config`. The deploy still completes because the public deterministic v1 tool does not depend on DB-backed config. Clean this up before turning on auth, admin, payments, or database-backed runtime settings.

## Final Cutover Checklist

- Confirmed Cloudflare DNS records exist through the Cloudflare API.
- Confirmed public DoH resolves `rowlabeler.com` and `www.rowlabeler.com` to `76.76.21.21`.
- Confirmed Vercel certificates and aliases for both custom domains.
- Confirmed HTTPS `200 OK` for `https://rowlabeler.com/` and `https://www.rowlabeler.com/`.
- Confirmed `200` responses on `https://rowlabeler.com` for `/`, `/zh`, `/blog/generate-400000-account-labels-without-dragging`, `/robots.txt`, and `/sitemap.xml`.

## Post-Launch Search Submission

Recorded on 2026-05-21:

- `public/sitemap.xml` contains 18 public, canonical, indexable URLs.
- IndexNow was submitted for all 18 sitemap URLs and returned `200`.
- Google Search Console domain property for `rowlabeler.com` is accessible.
- Google sitemap was re-submitted with the full URL `https://rowlabeler.com/sitemap.xml`; Search Console showed 18 URLs.
- Bing Webmaster has `rowlabeler.com` verified.
- Bing sitemap was re-submitted from the existing sitemap row; status changed to `Processing`. Discovered URL counts can lag after a successful re-submit.

Provider-operation lessons:

- For Google domain properties, submit the full sitemap URL rather than only `sitemap.xml`.
- For Bing Webmaster, use the row action to re-submit an existing sitemap when the add-sitemap input is unreliable.
- After every sitemap change, run IndexNow again and refresh GSC/Bing sitemap status.
