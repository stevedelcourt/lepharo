<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

Two projects sharing this repo:

### 1. Le Pharo Communauté
Community website for Résidence du Pharo (75 boulevard Charles Livon, 13007 Marseille — 105 logements, 19 étages, Patrimoine du XXe siècle).
- **Goal**: Private, verified-access community platform for residents: entraide, forum, document archive, calendar, messaging.
- **Spec**: `docs/pharo-communaute-site-structure.md`
- **Status**: Live at https://lepharo.vercel.app/

### 2. MentivisOS Homepage & Visual Library
Marketing site for Mentivis (cabinet d'ingénierie pédagogique et de stratégie éducative, Marseille).
- **Homepage spec**: `docs/MentivisOS-homepage-design.md` — 11-section Next.js page, Inter font only, left-aligned, bilingue FR/EN, no Tailwind, no serif.
- **Visual library**: `visuals-library/` — 20+ HTML/CSS/JS prototypes for gradients, geometric SVGs, canvas animations (tesseract, icosahedron, flow fields), logomark motion studies, chart components, blog components (React TSX), impact sections.

### Git
- **User**: stevedelcourt
- **Email**: steven.delcourt@mentivis.com
- **Remote**: https://github.com/stevedelcourt/lepharo

### Deployment
- **Vercel**: https://lepharo.vercel.app/
- **Manual deploy** (no GitHub auto-deploy): `vercel deploy --prod` from `site/`

## Tech Conventions
- No Tailwind or utility CSS frameworks
- Inter font (sans-serif), no serif fonts
- All text left-aligned, never centered
- Next.js with Webpack (no Turbopack)
- CSS custom properties for tokens
- French primary, bilingual FR/EN where needed
- `aspect-ratio: 1/1` on all cards
- Global fluid animations: page fade-in (`fadeIn` keyframe, 0.35s), smooth scroll, `cubic-bezier(0.4, 0, 0.2, 1)` easing on interactive elements
- `prefers-reduced-motion` respected (disables all animations/transitions)

## Database
- **Production**: Turso (libSQL) via `@libsql/client/web`
- **Local dev**: Turso when `TURSO_DB_URL` + `TURSO_DB_TOKEN` are set in `.env.local`; fallback to `better-sqlite3` if not
- **Auto-migration** on `getDb()` init via Drizzle push (24 migrations as of v1.5)
- **Backup**: `npm run backup` from `site/` — dumps all 15 user tables to `backups/turso-YYYY-MM-DDThh-mm-ss.sql` (SQL) + `.json` (raw data). Requires Turso credentials in `.env.local`
- **Credentials**: TURSO_DB_URL and TURSO_DB_TOKEN set on Vercel (Production, encrypted) and in local `.env.local`

## Mobile Responsive
- `.page-padding` class (globals.css): 40px/24px top/bottom with media query — replaces inline paddings on 24 pages
- Sidebar: burger menu slides from right, close (X) button, text logo in `.sidebar-mobile-header`, overlay `rgba(0,0,0,0.5)` + `backdrop-filter: blur(4px)`, Escape key dismiss, touch targets 10px padding
- `.sidebar-mobile-header` is sibling of `.sidebar-logo` (not child) — avoids `display:none` inheritance
- `.form-card` padding: 32px → 20px 16px on mobile
- `.form-row-2` grid: 1fr 1fr → 1fr on mobile
- `.dashboard-grid`: 1fr 320px → 1fr on mobile
- `.messagerie-layout` / `.messagerie-show-list` / `.messagerie-show-chat`: mobile stack toggle (list OR chat + back button)
- `.annuaire-search`: max-width 320px → 100% on mobile
- Notif bell dropdown: width 360 → max-width calc(100vw-32px); right: 8px
- Admin: horizontal scroll sidebar, table overflow-x, header wrap on mobile

## Image Upload
- Images (avatars, listings, articles) stored on Vercel Blob (`@vercel/blob`)
- Article upload endpoint: `src/app/api/upload/image/route.ts`

## Key Gotchas
- `better-sqlite3` doesn't compile on Vercel — Turso via `@libsql/client/web` for production
- `migrateLibsql()` runs on `getDb()` init but is NOT awaited — race condition on first request after deployment
- `@libsql/client` returns rows as arrays (index-based access), not objects
- Vercel CLI for deploy, no GitHub auto-deploy
- Login resilience: `compareSync` wrapped in `try/catch` — prevents crash 500 when stored password hash is invalid (e.g. seed placeholder hashes)
- Turso API token (for `turso db shell`, `turso db tokens create`): export `TURSO_API_TOKEN`

## Admin Roles & Permissions

Three roles: **superadmin** (3), **moderator** (2), **editor** (1). Defined in `site/src/app/admin/(protected)/layout.tsx`.

### Page access

| Page | superadmin | moderator | editor |
|------|:----------:|:---------:|:------:|
| Utilisateurs, Rubriques | ✅ | — | — |
| Forum, Entraide, Signalements | ✅ | ✅ | — |
| Documents, Événements, Sondages, Alertes, Articles | ✅ | ✅ | ✅ |

### Actions per page

| Page | superadmin | moderator | editor |
|------|:----------:|:---------:|:------:|
| **Utilisateurs** | full CRUD, promote, warn, reset password, create user | — | — |
| **Forum** | edit, pin/lock toggle, delete | edit, pin/lock toggle, delete | — |
| **Entraide** | edit, open/close, delete | edit, open/close, delete | — |
| **Signalements** | view, ignore, delete content | view, ignore, delete content | — |
| **Rubriques** | edit, delete | — | — |
| **Documents** | edit, upload, delete | edit, upload, delete | edit, upload, delete |
| **Événements** | edit, delete | edit, delete | edit, delete |
| **Sondages** | edit question, delete (cascade) | edit question, delete (cascade) | edit question, delete (cascade) |
| **Alertes** | edit, activate/deactivate, delete | edit, activate/deactivate, delete | edit, activate/deactivate, delete |
| **Articles** | create, edit, publish/draft, delete | create, edit, publish/draft, delete | create, edit, publish/draft, delete |

### Delete cascade for polls
`DELETE /api/delete?table=polls&id=X` deletes `poll_votes` → `poll_options` → `polls`
