# Changelog

## v1.5 — Fluid Animations & Interface Refinements

### Added
- **Global fluid animations**: page fade-in on navigate (`fadeIn` keyframe — 0.35s ease-out), smooth scroll (`scroll-behavior: smooth`), prefers-reduced-motion support
- **Enhanced transitions**: cards, buttons, inputs, tags, sidebar links, footer links — all using `cubic-bezier(0.4, 0, 0.2, 1)` easing
- **Input focus ring**: soft orange glow (`box-shadow: 0 0 0 3px rgba(255,107,0,0.12)`)
- **Kids badge**: purple (`#401f7f`) badge matching Senior toggle, visible on profile, annuaire, and admin edit
- **Kids column**: `kids` boolean field on `users` table (migration #024)
- **Admin EditUserModal**: redesigned profile-style modal with sections (Informations / Préférences / Bio), toggle switches, character counters
- **Calendar event creation**: `POST /api/events` endpoint + `/calendrier/nouveau` form page
- **Calendar CTA**: "Proposer un événement" CTA at bottom of calendar when events exist
- **Events API**: new endpoint for residents to propose events
- **Pie chart on sondages detail**: SVG donut chart with colored slices, percentage labels, total in center
- **Laurel badge**: per-option `IconLaurel` badge when count ≥ 25, plus `IconScale` banner for 25+ total
- **Card grid view**: sondages list changed to `aspect-ratio: 1/1` card grid
- **New icons**: `IconScale` (balance), `IconLaurel` (laurel wreath)

### Changed
- **Profile save API**: converted to try-catch with auto-retry on missing column; empty strings → `null` for nullable fields
- **Listings API**: added try-catch wrapper for proper error responses
- **Annuaire list view**: photo 80→64px, tighter padding/gap, `card-hover` class, smaller message button
- **Annuaire grid view**: `card-hover` class, message button right-aligned
- **Verified badge on annuaire**: discreet grey SVG checkmark instead of green tag
- **Article detail image**: `aspect-ratio: 5/4`, constrained to 720px content width
- **Prehome featured article**: image in 5:4 format
- **Forum cards**: hover effects via `a.card:hover` / `button.card:hover` CSS
- **Sondages detail**: bigger pie chart (240×240), no progress bar, bold black text
- **RGPD banner**: black background, white text, larger `1.125rem` body

### Fixed
- **Profile save error**: missing `show_full_name` column in Turso DB (migration #023 + auto-retry)
- **Admin EditButton boolean toggle**: `false` was converted to string `"false"` (truthy), now preserves booleans natively
- **Admin boolean handling**: `senior`, `kids`, `showFullName` explicitly converted to `0`/`1` in API
- **Missing profile fields**: `tagline` was sent by client but never processed by server

### Technical
- Drizzle ORM schema: added `kids` column to `users`
- Migrations #023 (`show_full_name`) and #024 (`kids`)
- All API routes now have try-catch error boundaries
