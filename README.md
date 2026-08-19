# Orbital Dashboard Prototype

Interactive HTML prototype of the Orbital dashboard: a brand-facing control plane that connects Meta ads to tailored Shopify landing experiences.

This is a client-side click-through. Auth, integrations, sync, and publishing are simulated in the browser. There is no backend.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

Then visit the URL printed in the terminal (typically `http://localhost:3000`).

## Prototype flow

1. **Create workspace** — email/password or simulated Google sign-in
2. **Business details** — company, site, platform, industry
3. **Data sources** — Shopify is required; Meta Ads and others are optional
4. **Ad campaigns** — imported Meta ads with search (`⌘K` / `Ctrl+K`)
5. **Personas** — choose a method, add up to four personas, review
6. **Loading** — simulated crawl and experience generation
7. **Brand system** — colors, logos, imagery, type, voice, buttons
8. **Campaign dashboard** — persona performance and test log
9. **Experience review** — default vs Orbital landing page, tagged-field editing
10. **Launch** — confirm experiences and go live
11. **Overview** — KPI snapshot and optimization recommendations

State lives in memory for the session. Reloading the page returns to Create workspace.

## Project structure

```
index.html    Screens and markup
script.js     Navigation, forms, and in-memory state
styles.css    Layout and visual system
assets/       Icons, logos, fonts, and imagery
```

## Notes

- Shopify cannot be disconnected; other sources can be toggled.
- Landing-page editing is limited to tagged fields (header, benefits, social proof). Nav stays locked to the template.
- Auth, Meta resync, password reset, and “Apply recommendation” are mocked.
