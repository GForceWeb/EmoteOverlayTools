# Changelog

All notable changes to Emote Overlay Tools are documented in this file.

## [2.2.0] - 2026-08-07

### New Animations

- **Bubbles** — Floating bubble animation with alternative Burst behaviours
- **Ripple** — Ripple animation across the overlay
- **Raids** — Incoming Raid Animation

### Improvements

- **Admin Dashboard Revamp** — Tabbed layout (Features, Animations, Setup, Logs, Support), sticky header, updated typography and styling
- Connection status pills for Streamer.Bot and overlay (click to retest); overlay presence tracking so live preview is excluded from “connected”
- Floating, draggable live preview pane with minimize/expand and position persistence
- Setup guide consolidated into the Setup tab, with first-run routing when Twitch username is unset
- **Snow** - Snow builds up on the ground before melting at the end of the animation
- **Orbit** - Orbit paths and transparency movements improved
- Gigantify implementation cleanup
- Black background for Preview/Debug Overlay
- Heartbeat to detect when the overlay is running
- Hardened Streamer.Bot WebSocket connect and reconnect
- New Icon/Branding

### Fixes

- Streamer.Bot chat payload normalisation (Fixes issue introduced by Streamer.Bot 1.0.5)
- Styling fixes

---

## [2.1.3] - 2026-04-29

### New Animations

- **Trampoline** — Emotes jump on a trampoline
- **UFO** — UFO flies around and drops down emotes
- **Orbit** — Carousel alternative with spinning emotes
- **Equalizer** — Emotes pulse like an EQ
- **Snow** — Snowfall animation as a rain variation
- **Gigantify** — Preliminary support for Gigantify emote redeems

### Improvements

- Firework / Volcano / Carousel / Explode animation improvements
- Styling / sizing improvements for non-1920px streams
- Emote picker for animation previews
- `&` character added to emote text
- Admin UI fixes
- Cheers position settings

---

## [2.1.1] - 2025-12-31

### Improvements

- Auto Update System: Refactored for better reliability
- UI/UX: Improved the look and feel of the app, dialogs, and menus

### Bug Fixes

- Additional minor bug fixes for stability

---

## [2.1.0] - 2025-12-30

### New Animations

- **Snake** — The classic phone game, now with emotes
- **Solitaire** — Inspired by the iconic card game victory screen
- **Dodecahedron** — Cube animation cranked up into a dodecahedron

### Improvements

- Animation Settings UI overhauled
- Avatar lookup caching
- Logs from overlay reported back to the application
- Improved default settings

### Bug Fixes

- Text animation now uses capitalisation from the original message
- Assorted minor bug fixes

---

## [2.0.0] - 2025-10-20

First release of the desktop app version of Emote Overlay Tools.
