# Reusable Toolsite SOP V2

Updated: 2026-05-22
Purpose: reusable process for building, launching, indexing, growing, and monetizing small tool sites.

## Principle

The goal is not to make a site exist. The goal is to create a real tool that can earn traffic, prove user value, and eventually make money.

This SOP has two stages:

- Stage 1: build a real tool, launch it correctly, and get it discoverable.
- Stage 2: measure behavior, grow qualified traffic, improve retention, and test monetization.

## Stage 1: Build And Launch

### 1. Intake

Use `toolsite-intake`.

Required outputs:

- Target user
- Primary search intent
- First useful workflow: input, processing, output, error states
- v1 exclusions
- 2-4 reference sites or inferred competitors
- Whether the project is deterministic, AI-backed, file-processing, API-backed, or SaaS

Rule:

- Keep v1 narrow. Move monetization, accounts, payments, dashboards, and large page batches to later stages unless required for the first workflow.

### 2. Workspace And Repo

Actions:

- Use one clean workspace per site.
- Initialize Git early.
- Create or connect GitHub before serious iteration when possible.
- Connect Vercel or the chosen host to the production branch early.
- Keep real secrets out of source, docs, screenshots, and final summaries.

Why this was added:

- Rowlabeler connected GitHub/Vercel later than ideal, which created extra manual deploy state to reconcile.

### 3. Site Shell

Use `shipany-quick-start`.

Required outputs:

- Brand and domain-ready app metadata
- Visitor-facing homepage
- Navigation and footer
- Legal pages
- Theme/assets
- Site icon set: `favicon.ico`, SVG/PNG logo, touch icon, and browser PNG icon
- Production URL placeholders
- Sitemap basics

Copy rule:

- Public pages speak to end visitors. Do not publish internal rationale such as "why this site", "v1 scope", "SOP next step", "launch target", "planned output", or "source pain point".

Brand asset rule:

- Replace all template branding before launch, not only visible homepage logos. Check favicon, `logo.svg`, `logo.png`, Apple touch icon, PNG app icons, admin/auth sidebar logos, OpenGraph preview image, and any environment variables such as `NEXT_PUBLIC_APP_LOGO`, `NEXT_PUBLIC_APP_FAVICON`, and `NEXT_PUBLIC_APP_PREVIEW_IMAGE`.
- Add a verifier so template favicon/logo assets cannot silently return after later template merges or rebrands.

### 4. Real Tool

Use `shipany-tool-builder`.

Required outputs:

- Actual working tool, not a fake landing page
- Pure logic where possible
- UI happy path
- Empty/invalid/error states
- Copy/download/share behavior where relevant
- Verification script for core logic

### 5. Seed SEO

Use:

- `shipany-page-builder`
- `shipany-content-seo`
- `shipany-longtail-growth`

Rules:

- Start with 2-4 high-quality pages.
- One page per distinct intent.
- Every page needs unique metadata, useful examples, FAQ, internal links, CTA, sitemap entry, and verifier coverage.
- Do not leave pages discoverable only through sitemap.

### 6. Launch

Use `shipany-deploy-launch`.

Verify:

- Production build path
- Host deployment status
- GitHub-to-host production branch
- Cloudflare DNS records when Cloudflare manages the domain
- Custom domain live HTML
- HTTPS
- Robots
- Sitemap
- Canonical URLs
- Hreflang
- JSON-LD when present
- Browser tab icon and touch icon use the product brand, not template defaults
- Search/social preview image is product-specific or intentionally neutral, not template branding
- Mobile and real tool first-screen behavior

Host notes:

- For Vercel-style local checks on Windows, use `VERCEL=1` if standalone symlink permissions fail.
- Do not run `next dev` and `next build` together when they share `.next`.

### 7. Indexing And Provider Ops

Use `shipany-postlaunch-ops`.

Required actions after sitemap changes:

- Submit IndexNow.
- Submit Google Search Console sitemap with the full URL for domain properties.
- Re-submit Bing Webmaster sitemap from the existing row when the add form is unreliable.
- Record provider status and date.
- Treat discovered URL lag as processing, not immediate failure.

### 8. Closeout

Use `neat-freak`.

Required docs:

- README
- Handoff
- Launch preflight
- Retrospective
- Next-stage growth plan

Required memory:

- Update skills when a lesson is reusable across sites.
- Keep real tokens out of docs and memory.

## Stage 2: Growth And Monetization

### 1. Growth Sprint

Use `toolsite-growth-sprint`.

Every sprint needs:

- One money hypothesis
- One measurable signal
- One SEO/product/monetization action
- One re-check date or follow-up decision

### 2. Analytics

Use `toolsite-growth-analytics`.

Track business events:

- Copy formula/result
- Download CSV/TXT/file
- Apply preset
- Scroll to generator
- Long-tail CTA click
- Template download click
- Affiliate click
- Feedback submit

Rule:

- No large SEO batch before measurement is in place.

### 3. Query Mining

Use `toolsite-query-mining`.

Inputs:

- Google Search Console queries
- Bing Webmaster queries
- Analytics landing pages and events
- Server logs or manual review

Outputs:

- Existing page improvement
- Commercial long-tail page
- Product feature or preset
- Template/download offer
- Deferred or consolidated intent

### 4. Commercial Long-Tail

Use `toolsite-commercial-longtail`.

Prioritize queries with:

- Business objects: invoice, SKU, barcode, inventory, batch, account, shipping
- Action words: generator, template, download, CSV, bulk, automate
- Clear output: spreadsheet, formula, CSV, TXT, PDF, printable labels

Rule:

- Each page needs a monetization hypothesis, not just a keyword.

### 5. Product Retention

Use `toolsite-product-retention-optimizer`.

Good early improvements:

- Presets
- Multi-column output
- Better downloads
- Shareable prefilled URLs
- Better invalid-state recovery
- Free template assets

Rule:

- Build features that increase copy, download, repeat use, sharing, lead capture, or purchase intent.

### 6. Monetization Lab

Use `toolsite-monetization-lab`.

Monetization ladder:

1. Ads readiness
2. Affiliate/referral
3. Free asset lead magnet
4. Paid template pack
5. Lightweight SaaS

Rule:

- Do not add login, payment, subscriptions, or credits until there is evidence of repeat use or purchase intent.

## Reusable Gates

- Gate A: Real tool works and has a verifier.
- Gate B: Public copy has no internal audience leak.
- Gate C: Sitemap only includes public, real, indexable URLs.
- Gate D: Custom domain renders current live HTML.
- Gate E: IndexNow, Google Search Console, and Bing Webmaster are handled after sitemap changes.
- Gate F: Analytics exists before large content expansion.
- Gate G: Monetization starts as an experiment, not infrastructure.
- Gate H: Browser favicon, logo PNG/SVG, touch icon, and preview image are product-branded and covered by verification.

## Current Rowlabeler Mapping

Completed:

- Stage 1 intake, shell, real tool, seed SEO, Vercel launch, Cloudflare domain, IndexNow, GSC, Bing, closeout docs, and template icon replacement.

Next:

- Stage 2 Sprint 1: use `toolsite-growth-analytics` to add measurement and event tracking.
- Then choose between multi-column output and the first commercial long-tail batch based on the event map.
