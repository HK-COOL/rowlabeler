# Rowlabeler

Rowlabeler is a deterministic Excel sequence label generator built from ShipAny Template Two. It helps visitors generate copyable Excel formulas, fixed text values, CSV previews, and TXT output for large row-labeling jobs such as account IDs, SKU labels, invoice numbers, and batch codes.

Live site: `https://rowlabeler.com`

Repository: `https://github.com/HK-COOL/rowlabeler`

## Project Notes

- Framework: Next.js `15.5.7`, React `19.2.1`, ShipAny Template Two `1.8.2`
- Main branch: `main`
- Deployment: Vercel project `hk123s-projects/rowlabeler`
- Domain: Cloudflare-managed `rowlabeler.com`
- Current v1 scope: public deterministic toolsite, no login, no payment, no credits, no file upload, no AI workflow

## Key Files

- Tool logic: `src/shared/lib/excel-sequence-generator.ts`
- Tool UI block: `src/themes/default/blocks/excel-sequence-generator.tsx`
- Homepage content: `src/config/locale/messages/{en,zh}/pages/index.json`
- Long-tail page content: `src/config/locale/messages/{en,zh}/pages/*.json`
- Locale page registration: `src/config/locale/index.ts`
- Sitemap: `public/sitemap.xml`
- Robots route: `src/app/robots.ts`
- Structured data helpers: `src/shared/lib/structured-data.ts`
- SEO helpers: `src/shared/lib/seo.ts`

## Local Development

```powershell
pnpm install --frozen-lockfile
pnpm run db:push
pnpm exec next dev -p 3001
```

Open `http://localhost:3001`.

Avoid running `next dev` and `next build` at the same time in this repo because both touch `.next`.

## Verification

```powershell
pnpm exec tsx scripts/verify-excel-sequence-generator.ts
pnpm exec tsx scripts/verify-site-quality.ts
pnpm exec tsc --noEmit
```

For a Vercel-style local production build on Windows:

```powershell
$env:VERCEL='1'
$env:CI='1'
$env:NEXT_TELEMETRY_DISABLED='1'
pnpm exec next build
```

Plain local standalone builds can fail on Windows symlink permissions. Use the Vercel build path above to separate application build health from local packaging permissions.

## Launch And Growth Workflow

1. Keep public page copy written for visitors, not for the site owner or implementation plan.
2. Add or update tests/verifiers before expanding long-tail pages.
3. Register every locale JSON page in `localeMessagesPaths`.
4. Add sitemap entries only for real, reachable, indexable public URLs.
5. Link new pages from footer, related pages, or relevant homepage sections so they are not orphaned.
6. After production deploy, verify the live custom domain HTML, canonical URLs, hreflang alternates, JSON-LD, robots, and sitemap.
7. After sitemap changes, submit IndexNow and refresh Google Search Console and Bing Webmaster sitemap entries.

## Documentation

- Launch preflight: `docs/launch-preflight-2026-05-20.md`
- Current handoff: `docs/handoff-2026-05-20.md`
- Post-launch retrospective: `docs/postlaunch-retrospective-2026-05-21.md`
