# Smart Funds USA — Premium Green Template (July 2026)

A conversion-first rebuild of the Smart Funds USA single-loan vertical. Static site, **zero build step**: pure HTML5 + CSS3 + vanilla JS. Deploy by syncing this folder to S3/CloudFront (or any static host) as-is.

**Why this template exists:** the live production site buries its lead form *mid-page*. This template puts a **top-centered form above the fold** (the #1 conversion fix for paid traffic), on an ultra-light home page built for fast email opens.

## Pages
| URL | Purpose | Indexable |
|---|---|---|
| `/` | Conversion home — top-centered ZeroParallel form, inline critical CSS, no images (LCP < 1.5s target) | Yes (1.0) |
| `/how-it-works.html` | SEO/AEO money page — 3 steps, eligibility checklist, timing + Article/FAQ/Breadcrumb schema | Yes (0.9) |
| `/rates-fees.html` | Rates & fees, representative *illustrative* examples (dated July 2026 — refresh monthly) | Yes (0.8) |
| `/faq.html` | 10-question FAQ with FAQPage schema | Yes (0.8) |
| `/contact.html` | Contact + address, ContactPage + Breadcrumb schema | Yes (0.5) |
| `/advertising-disclosure.html` | How-we-earn (EEAT requirement) | Yes (0.5) |
| `/privacy.html` (incl. `#ccpa`), `/terms.html`, `/disclaimer.html`, `/e-consent.html` | Legal | noindex |
| `/404.html` | Custom error page | noindex |

## Form embed (home page only)
- **Head:** `<script src="https://cdn101.zeroparallel.com/resource/global/js/params_store.js"></script>`
- **Body (top-centered, in hero):** `<script src="https://cdn101.zeroparallel.com/form/run.php?p=5716685DED59419E86560997F1CD929D" data-pxl="_n70"></script>`
- ⚠️ **Before sending traffic:** in the ZeroParallel form config, populate `privacy_policy_link`, `terms_conditions_link`, and `e_consent_link` (they default to empty — an empty consent link is a TCPA/CCPA violation even though the pages exist here). A visible consent line already sits directly under the form and links to `/privacy.html`, `/terms.html`, `/e-consent.html`.

## Design system
- **Palette (client-provided emerald + navy, soft-light):** `--primary #059669`, `--primary-light #10b981`, `--primary-dark #047857`, `--accent #34d399`, `--navy #0d2137`, text `#0f2027 / #3b5268 / #6b8099`, `--off-white #f0faf6`, `--card-bg #f4faf8`, `--border #d1e8df`.
- **Type:** Bricolage Grotesque (display) + Plus Jakarta Sans (body) — Google Fonts w/ preconnect + `display=swap`. Deliberately not Inter/Roboto and distinct from the prior blue template.
- **Motion:** IntersectionObserver reveals, respects `prefers-reduced-motion`; sticky mobile CTA after 460px scroll. No JS libraries.
- **Icons:** inline SVG only (no emoji-as-UI). Favicon `.ico` + `.svg` + apple-touch-icon and a 1200×630 `og.png` are all present.
- Home page ships **inline critical CSS** (no external stylesheet, no images) for LCP; interior pages share `/assets/css/styles.css` + `/assets/js/site.js`.

## Compliance built in
- Footer on every page: **not-a-lender**, **availability & rates**, **tribal-lender**, **credit-impact** disclaimers; clickable **Privacy Policy** + **Do Not Sell My Info** (`/privacy.html#ccpa`) links.
- No fake testimonials, no invented stats/customer counts. Trust rests on process facts (range, timing*, encryption) and real compliance.
- All dollar/APR figures are labeled illustrative; funding-time `*` caveat is disclosed.

## Before go-live
1. **ZeroParallel:** confirm the form renders and all consent links are configured (see warning above).
2. **Domain:** verify canonical/OG/sitemap URLs (`https://smartfundsusa.com/`).
3. **OG image:** `assets/img/og.png` is a branded vector render. If you want a photographic card, connect the **Higgsfield MCP** (it was unauthenticated at build time) and swap it (keep 1200×630).
4. Smoke test `/robots.txt` and `/sitemap.xml` return 200.
5. Refresh the dated figures on `/rates-fees.html` monthly.

## Notes
- Built to the Notion **$10K Checklist** and **Affiliate Site Master Plan (SEO Playbook)**.
- This folder is the deploy artifact — sync it directly. Do **not** touch the live prod site (read-only reference for address/brand only).
