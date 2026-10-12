# Brand assets

Canonical location for Claude Builder Club — AOU Egypt visual assets used by this website.

## Structure

- `Claude logos/` — source package uploaded to the repository. Keep this directory intact as the original asset bundle.
- `logos/` — canonical web aliases used by the site so CSS/HTML paths stay clean and stable.
- `images/` — campaign, event and social imagery. Add web-optimized files here.
- `fonts/` — documentation/placeholders for licensed font assets only. Do not commit proprietary Anthropic font binaries without explicit permission.

## Canonical Claude assets now in use

- `logos/claude-icon-rounded.svg` — official rounded Claude app icon used by navbar, mobile drawer and application header.
- `logos/claude-icon-square.svg` — square Claude app icon variant.
- `logos/claude-spark.svg` — Clay Spark used for identity accents.
- `logos/claude-wordmark-slate.svg` — light-theme Claude wordmark.
- `logos/claude-wordmark-ivory.svg` — dark-theme Claude wordmark.
- `logos/claude-wordmark-one-color.svg` — one-color wordmark variant.
- `logos/claude-code-wordmark-slate.svg` and `logos/claude-code-wordmark-ivory.svg` — Claude Code variants reserved for relevant technical content.
- `logos/claude-favicon.svg` — browser favicon sourced from the rounded Claude icon.

The aliases above point to the exact SVG blobs from the uploaded package; they are not redrawn approximations.

## Brand rules

The site follows Anthropic's published brand guideline source at `anthropics/skills/skills/brand-guidelines/SKILL.md` for palette and typography fallback behavior. Keep the official palette values centralized in CSS and avoid introducing arbitrary brand colors.

`assets/css/claude/brand-assets.css` is the integration layer for the uploaded logo package. Keep source assets in `Claude logos/` and change site usage through the canonical aliases rather than scattering paths to the source package across components.
