# CSS architecture

`site.css` is the only stylesheet that `index.html` should load directly.

## Layers

- `base/` — original structural foundation and global primitives.
- `legacy/` — older layout/polish layers kept isolated while the design system is consolidated. Do not add new files here.
- `claude/` — active Claude/Anthropic identity, typography, form and polish layers.
- `components/` — focused reusable UI components such as mobile navigation.

## Rules

1. Keep cascade order in `site.css` intentional.
2. New work belongs in `claude/` or `components/`, not `legacy/`.
3. Do not add root-level stylesheets.
4. Brand imagery must come from `assets/brand/`.
5. Preserve the official Anthropic palette variables when extending branded UI.

The legacy layer exists to avoid a risky all-at-once rewrite of the live recruitment form. It can be reduced over time as rules are absorbed into focused modules.
