# JavaScript architecture

The browser scripts are deliberately kept as separate classic scripts because the live recruitment flow depends on their execution order.

## Load order

1. `config.js` — public runtime flags and submission endpoint.
2. `app.js` — teams, form flow, validation and application state.
3. `submission-hotfix.js` — resilient GitHub Pages submission transport and draft protection.
4. `revamp.js` — progressive UI enhancements such as mobile navigation, filtering and review polish.

## Rules

- Preserve this order unless a tested module migration is intentional.
- Do not casually replace `submission-hotfix.js`.
- Do not rename form fields without coordinating the Apps Script backend.
- New UI-only behavior should usually live in `revamp.js` or a future focused module.
- Secrets must never be added to browser JavaScript.
