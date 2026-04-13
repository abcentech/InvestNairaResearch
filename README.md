# InvestNaira Research Website

Static GitHub Pages SPA for the public InvestNaira website.

## Stack

- `index.html`
- `app.js`
- `config.js` generated at deploy time
- GitHub Pages deployment via GitHub Actions

## Routes

- `#/`
- `#/research`
- `#/research/:slug`
- `#/reports`
- `#/report/:slug`
- `#/subscribe`
- `#/about`
- `#/faq`

## Runtime config

Do not commit `config.js`.

Use `config.example.js` for local setup, then create `config.js` locally or let the GitHub Actions deployment generate it from repository variables/secrets.

Required values:

- `SUPABASE_URL`
- `SUPABASE_ANON`
- `GHOST_URL`
- `GHOST_KEY`
- `PAY_PREMIUM`
- `PAY_PROFESSIONAL`
- `PAY_BUSINESS`

## Data flow

- Ticker tape: `ticker.json` first, then Supabase fallback
- Public reports: Ghost Content API first, then Supabase fallback
- Premium CTAs: Korapay checkout links

## Deploy

Push to the configured branch and let `.github/workflows/deploy-pages.yml` deploy the site.
