# Claude Builder Club — AOU Egypt
## Founding Team Recruitment Website

Production recruitment website for the Claude Builder Club — AOU Egypt founding team.

**Public site:** `https://mhmdwaelanwr.github.io/hiring-cbc/`

## System overview

```text
Applicant
   ↓
GitHub Pages static frontend
   ↓
resilient cross-origin submission transport
   ↓
Google Apps Script Web App
   ↓
Google Sheet recruitment database
```

The Google Apps Script `/exec` URL is a public form endpoint, not a password or secret.

## Repository structure

```text
.
├── index.html                 # document structure / page content
├── assets/
│   ├── brand/                 # canonical logos, images and licensed font assets
│   ├── css/                   # all website styles
│   │   └── site.css           # single production CSS entrypoint
│   └── js/                    # browser application code
├── api/                       # optional server/API endpoint
├── apps-script/               # Google Apps Script backend
├── docs/                      # architecture + launch documentation
├── .github/workflows/         # GitHub Pages deployment
├── .nojekyll
└── vercel.json
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the detailed module map and maintenance rules.

## Frontend

The page loads one stylesheet entrypoint: `assets/css/site.css`. That file owns the CSS cascade and imports foundation, legacy layout, Claude/Anthropic identity, form, and component modules in a deliberate order.

Browser code lives under `assets/js/` and loads in this order:

1. `config.js` — public runtime configuration
2. `app.js` — application data, validation and flow
3. `submission-hotfix.js` — resilient GitHub Pages submission transport
4. `revamp.js` — progressive UI/UX enhancements

Do not casually replace or reorder `submission-hotfix.js`; it protects the live form transport and draft behavior.

## Brand assets

All visual assets belong under `assets/brand/`.

- `assets/brand/logos/` — SVG marks and favicons
- `assets/brand/images/` — event/social/hero imagery
- `assets/brand/fonts/` — licensed self-hosted font assets only

See [`assets/brand/README.md`](./assets/brand/README.md) for asset rules.

## Included

- Responsive recruitment website
- 5-step multi-role application form
- Team-specific dynamic questions
- Required-field validation
- Local draft autosave
- Consent capture
- Honeypot spam field
- Duplicate-protection backend support
- Unique Application IDs
- Google Sheets applicant database
- Applicant confirmation flow
- GitHub Pages deployment workflow
- Light / dark / system appearance modes
- Claude / Anthropic-aligned visual system

## Backend

`apps-script/Code.gs` and `apps-script/appsscript.json` are the Google Apps Script backend. Frontend refactors must preserve form field names and submission payload compatibility unless a backend migration is intentional.

## Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — project structure and module boundaries
- [`docs/LAUNCH_GUIDE.md`](./docs/LAUNCH_GUIDE.md) — launch/setup notes

## Official club contact

`claudebuilder.aou@gmail.com`

## Security

Never commit passwords, OAuth tokens, recovery codes, private keys, or other private credentials. Public endpoint URLs and public social links are configuration, not secrets.
