# Rowlabeler Post-Launch Retrospective

Date: 2026-05-21  
Site: `https://rowlabeler.com`  
Repo: `https://github.com/HK-COOL/rowlabeler`

## What Went Well

- The core tool stayed deterministic and small. That kept v1 launchable without auth, payment, AI, uploads, or database work.
- GitHub plus Vercel auto-deploy now makes future changes much easier to ship.
- Cloudflare DNS, Vercel domain aliases, HTTPS, robots, sitemap, canonical URLs, hreflang, JSON-LD, IndexNow, Google Search Console, and Bing Webmaster are all part of the launch record.
- A dedicated verifier now checks the highest-risk SEO wiring: long-tail registration, sitemap entries, metadata, hero, FAQ, canonical URLs, hreflang, JSON-LD, and TXT generation.
- Brand assets are part of launch quality. Replacing homepage copy is not enough: favicon, `logo.svg`, `logo.png`, touch icons, browser PNG icons, preview images, and app-logo env vars must be checked so the site does not keep ShipAny/template identity in tabs, bookmarks, or search previews.

## What Went Wrong

- Some early public copy spoke as if Codex was explaining the strategy to the site owner. That leaked internal planning language into the visitor experience.
- The original handoff document suffered encoding damage, which made it unreliable as a future memory source.
- GitHub/Vercel connection came later than ideal, so early deploy work had more manual state to reconcile.
- Search engine submission required provider-specific details that were not yet in the skills: full sitemap URL for Google domain properties, Bing row re-submit behavior, and IndexNow after sitemap updates.
- Long-tail growth needed stronger guardrails. New pages must be registered, linked, rendered, indexed, and verified, not just written.
- The ShipAny favicon and PNG logo survived the first launch because the visible homepage logo was checked, but browser/search icon assets were not treated as a launch gate.

## Rules For Future Toolsites

Public copy:

- Write visible website copy only for the end visitor.
- Keep owner-facing rationale, SOP notes, launch plan, "why this site", and "v1 scope" in docs.
- Before deploy, scan the live page for audience leaks and rewrite them as current benefits, capabilities, safety notes, or workflow guidance.

Build and deploy:

- Create the GitHub repo and connect Vercel before serious iteration.
- Verify both preview deploy and custom domain.
- Replace and verify product-specific favicon, SVG/PNG logo, touch icon, browser PNG icon, and preview image before calling the site launched.
- Keep real tokens out of source, docs, screenshots, and final summaries.
- Record provider state in docs using variable names or masked values only.

SEO operations:

- Keep one canonical URL per intent.
- Keep sitemap limited to real public indexable URLs.
- Use `src/app/robots.ts` when the template already owns robots.
- Submit IndexNow after sitemap changes.
- In Google Search Console, submit the full sitemap URL.
- In Bing Webmaster, re-submit the existing sitemap row when the UI input is unreliable.
- Expect discovered URL counts to lag; record submission state and date instead of treating lag as failure.

Long-tail growth:

- Start with 2-4 high-intent pages per batch.
- Require unique intent, metadata, examples, FAQ, internal links, and CTA for every page.
- Update `scripts/verify-site-quality.ts` whenever adding a new page pattern.
- Do not leave new pages discoverable only through sitemap; link them from footer, related pages, or relevant homepage sections.

Local verification:

- Stop dev servers before production builds when `.next` might be shared.
- Use `VERCEL=1` for local Vercel-style builds on Windows if standalone symlinks fail.
- Restart `next start` after a new build before checking rendered HTML.

## Updated Skills

This closeout updated the ShipAny skills that own these lessons:

- `shipany-quick-start`: public copy audience boundary and preflight scan.
- `shipany-deploy-launch`: custom-domain live verification and auto-deploy expectations.
- `shipany-content-seo`: IndexNow, GSC/Bing sitemap refresh, canonical/hreflang checks, audience leak scan.
- `shipany-longtail-growth`: small high-intent batches and verifier-first expansion.
- `shipany-page-builder`: page registration, sitemap, internal links, and verifier updates as completion criteria.
- `shipany-postlaunch-ops`: GSC/Bing operational steps and provider-state lag.

## Minimal Next-Site SOP

1. Intake: define user job, domain, locale, first tool behavior, and first 2-4 long-tail intents.
2. Quick start: brand, metadata, public copy, legal pages, sitemap, and visitor-facing homepage.
3. Tool builder: implement the real interactive tool and a focused verifier.
4. Page builder and SEO: add only high-intent pages, register them, link them, and update the quality verifier.
5. Brand asset gate: replace favicon, logo PNG/SVG, touch icon, browser PNG icon, and preview image; verify local files, production HTML, and live static asset URLs.
6. Deploy launch: GitHub, Vercel, domain, HTTPS, live HTML, robots, sitemap, canonical, hreflang, JSON-LD.
7. Post-launch ops: IndexNow, Google Search Console, Bing Webmaster, analytics decision, and recorded provider status.
8. Neat closeout: update docs and skills before starting the next site.
