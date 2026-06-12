# Kashish Birthday Memory Capsule — Project Context

## What this is
A premium digital birthday gift website for Kashish, built by her boyfriend.
It is NOT a generic app. It should feel like a physical memory capsule —
a sealed box of notes, photos, and words from everyone who loves her,
opening together on her birthday morning (July 5).

## Current state
The app is functionally built (11 pages, Supabase backend, Google Drive
storage, access-code system) but the UI is broken:
- No centered layout — content sits left-aligned with massive empty
  space on the right of every page
- No card components anywhere — flat text floating on backgrounds
- No design system applied — colors, fonts, spacing are inconsistent
  per page
- Buttons look like unstyled browser defaults or broken pill shapes
- Headings overlap body content
- Photos have no frame/treatment, inconsistent sizing, cropping issues

## Tech stack
- React + TypeScript + Vite
- TailwindCSS (custom config required — NOT default theme)
- Framer Motion (used sparingly — see animation rules)
- Supabase (database, edge functions)
- Google Drive (file storage, Supabase stores only metadata)
- Vercel (hosting)

## Design system (MANDATORY — see strict prompt below for enforcement)

### Color palette (Crimson theme — Kashish wears bright crimson on the day)
--ink:       #1C1410
--parchment: #F7EFE6
--crimson:   #C3232B
--ember:     #8C4A3A
--dust:      #9C8A7C
--cream:     #FBF6EF
--gold:      #C9A45C

### Typography
- Display/headings: 'Cormorant Garamond' (serif, italic for emotional moments)
- Body/UI: 'DM Sans' (sans-serif)
- Display size: clamp(3rem, 8vw, 7rem) for hero only, smaller scale for
  section headings (clamp(2rem, 5vw, 3.5rem))

### Layout
- Default page container: max-width 860px, margin: 0 auto, centered
- Full-bleed exceptions: hero section, locked HerPage/CapsulePage states,
  MessagesPage journal mode, OneWordPage fullscreen input
- Spacing scale (use ONLY these values): 8px 16px 24px 40px 64px 96px

### Card component (shared, used everywhere)
background: var(--cream)
border: 1px solid var(--dust)
border-radius: 4px
padding: 24px
NO box-shadow

### Button component (shared, two variants only)
Primary: background var(--crimson), text var(--cream), no border
Ghost: transparent background, 1px var(--dust) border, text var(--ink)
Both: border-radius 4px, padding 12px 24px, min-height 44px

## Pages (11 total, quiz removed)
1. LandingPage (/) — hero + asymmetric timeline + countdown
2. HerPage (/her) — Kashish's locked/unlocked view
3. GuestDashboardPage (/guest) — hub of 4 action tiles
4. MessagesPage (/messages) — journal note submission/viewer
5. OneWordPage (/one-word) — fullscreen word input/cloud viewer
6. CameraPage (/camera) — photo/video upload + gallery
7. GuestbookPage (/guestbook) — signature registry
8. GamesPage (/games) — 3 games (Dumb Charades, Never Have I Ever, Meet Someone New)
9. CapsulePage (/capsule) — full unlock reveal
10. AdminPage (/admin) — moderation panel

## Non-negotiable rules
- No colors outside the 7-color palette above
- No fonts outside Cormorant Garamond + DM Sans
- Every page's content must render inside the shared PageContainer
- Every card-like element must use the shared Card component
- Every button must use the shared Button component
- No emoji in nav, headings, or labels
- No "Submit" on any button — specific action verbs only