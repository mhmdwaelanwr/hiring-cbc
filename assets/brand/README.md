# Brand assets

Canonical location for Claude Builder Club — AOU Egypt visual assets used by this website.

## Structure

- `logos/` — approved SVG marks, favicons and club logo variants.
- `images/` — campaign, event and social imagery. Add web-optimized files here.
- `fonts/` — documentation/placeholders for licensed font assets only. Do not commit proprietary Anthropic font binaries without explicit permission.

## Current assets

- `logos/claude-spark.svg` — spark mark used by the website UI.
- `logos/claude-favicon.svg` — browser favicon.

## Brand rules

The site follows Anthropic's published brand guideline source at `anthropics/skills/skills/brand-guidelines/SKILL.md` for palette and typography fallback behavior. Keep the official palette values centralized in CSS and avoid introducing arbitrary brand colors.

If new official/approved assets are supplied later, place them in this directory and update references through `assets/css/site.css` rather than scattering asset paths across components.
