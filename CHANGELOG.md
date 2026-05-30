# Changelog

## v2.0 — Modération système, Avatars, Card views & Signalements

### Added
- **Moderation engine**: `src/lib/moderation/` — normalization pipeline (lowercase, NFKD, accents, leet speak, punctuation), scoring engine (3-tier: low/medium/high/critical), merged `french-badwords-list` (2432 words) + supplemental profanity (56 words) + curated hate lists (racism, antisemitism, xenophobia, homophobia, sexism, religion — ~120 patterns) + extremism list (~20 phrases)
- **Auto-flagging**: `checkAndFlag()` runs fire-and-forget on all content creation — forum topics, replies, listings, listing messages, private messages. **Never suppresses content**, only creates auto-flagged reports
- **Moderation queue**: new `moderation_flags` table (migration #026) without FK constraints — auto-flagged content appears in `/admin/signalements` and dashboard
- **Admin signalements page** rewriten: tabs (Non traités / Tous / Auto / Signalés), score badges, category tags, expandable matched rules, Ignorer / Supprimer actions
- **Admin dashboard**: unresolved signalements listed directly below stat cards
- **User dashboard** (`/mes-activites`): tabs for Sujets forum, Commentaires, Sondages, Événements — edit/delete own content with ownership verification
- **API endpoints**: `GET /api/user/content`, `PATCH /api/user/content`, `DELETE /api/user/content`, `GET /api/redirect` (resolves forum_reply → parent topic)
- **Avatars on all contributions**: `UserAvatar` component (initials fallback, adjustable size), added to forum topics list, rubrique list, topic detail, replies, sondages list + detail, entraide list + detail, dashboard
- **Discreet flag icon**: `IconFlag` SVG on all user content for reporting — small (14px, opacity 0.4), icon-only
- **Reports table**: created with all moderation columns (migration #024b + #025a-g), merged with `moderation_flags` in `/api/reports` GET
- **Migration retry logic**: `migrateLibsql()` now resets `migrated=false` and `db=null` on failure for auto-retry
- **Entraide card view**: grid layout with `aspect-ratio:1/1`, photo takes 2/3 of card, description preview text, grid/list toggle
- **New icons**: `IconFlag`, `IconScale`, `IconLaurel`

### Changed
- **Calendar `parseDate`**: fixed case-sensitivity bug (months with capital letters vs lowercase input), events now display correctly
- **Entraide list page**: added `description` to query + card display, added grid/list view toggle with `IconGrid`/`IconList`
- **ReportButton**: simplified to icon-only (flag SVG), smaller popup form, used `IconFlag` instead of `IconWarning` + text
- **Forum detail**: author line shows avatar + name inline, each reply has avatar + flag button
- **Admin cards**: all stat cards now clickable `<Link>` with hover effect
- **Sondages UI**: bigger pie chart (240×240), bold black text, no progress bar, author avatar

### Fixed
- **Signalements resolve/delete**: properly targets `reports` vs `moderation_flags` via `entityType` field
- **Calendar events not showing**: `parseDate` `indexOf` → `findIndex` with case-insensitive comparison
- **Moderation auto-flags**: previously silently failed due to `reporterId:0` FK constraint — now uses dedicated `moderation_flags` table
- **Dashboard crash**: `moderationFlags` and `reports` queries wrapped in try-catch; missing table migration no longer crashes admin page
- **Missing `reports` table in Turso**: added migration #024b to create it
- **BigInt serialization**: `lastInsertRowid` converted with `Number()` across all API routes
- **Forum replies `.returning()` issue**: replaced with `.run()` + `lastInsertRowid`
- **All APIs with moderation hooks**: added try-catch for proper error responses

### Technical
- Database: 24+ migrations, `moderation_flags` table, `reports` table with full moderation columns
- Drizzle ORM schema: `moderationFlags` table definition
- New component: `UserAvatar`, `ReportButton` redesign, `IconFlag`
- Admin API: `resolve-report` with `type` selector, `delete-content` with `entityType`
- Moderation engine fully offline (no AI), all word lists in `src/lib/moderation/lists/`
