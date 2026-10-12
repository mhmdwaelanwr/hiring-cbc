# Project architecture

This repository is a static recruitment website with a Google Apps Script submission backend and an optional API route.

## Directory layout

```text
.
├── index.html
├── assets/
│   ├── brand/
│   │   ├── README.md
│   │   ├── logos/
│   │   │   ├── claude-spark.svg
│   │   │   └── claude-favicon.svg
│   │   ├── images/
│   │   │   └── README.md
│   │   └── fonts/
│   │       └── README.md
│   ├── css/
│   │   ├── site.css
│   │   ├── base/
│   │   │   └── styles.css
│   │   ├── legacy/
│   │   │   ├── polish.css
│   │   │   ├── hotfix.css
│   │   │   ├── brand.css
│   │   │   ├── community.css
│   │   │   └── revamp.css
│   │   ├── claude/
│   │   │   ├── theme.css
│   │   │   ├── typography.css
│   │   │   ├── polish.css
│   │   │   ├── official.css
│   │   │   ├── form.css
│   │   │   └── form-fix.css
│   │   └── components/
│   │       └── mobile-menu.css
│   └── js/
│       ├── config.js
│       ├── app.js
│       ├── submission-hotfix.js
│       └── revamp.js
├── api/
│   └── submit.js
├── apps-script/
│   ├── Code.gs
│   └── appsscript.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── LAUNCH_GUIDE.md
├── .github/workflows/pages.yml
├── .nojekyll
├── vercel.json
└── README.md
```

## Front-end loading order

`assets/css/site.css` is the only public CSS entrypoint. It imports the CSS layers in a deliberate cascade order: foundation → legacy layout → Claude/Anthropic identity → application experience → mobile component overrides.

JavaScript is loaded from `assets/js/` in this order:

1. `config.js`
2. `app.js`
3. `submission-hotfix.js`
4. `revamp.js`

`submission-hotfix.js` owns the resilient GitHub Pages form transport behavior and should not be casually replaced or reordered.

## Brand assets

All website-owned visual assets belong under `assets/brand/`. CSS should reference the canonical paths there instead of keeping copies next to stylesheets.

## Backend boundaries

- `apps-script/` contains the Google Apps Script backend and manifest.
- `api/` contains optional server/API endpoints.
- Front-end refactors must not change field names or transport payloads without coordinating backend changes.

## Maintenance rules

- Keep `index.html` focused on document structure and semantic content.
- Add new visual rules to the appropriate CSS module, not the repository root.
- Do not add new root-level CSS or JS files.
- Keep branding assets centralized under `assets/brand/`.
- Preserve form field names, submission endpoint compatibility and draft behavior unless a backend migration is intentional.
