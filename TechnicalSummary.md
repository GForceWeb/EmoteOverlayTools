# Technical Summary

## Overview

Emote Overlay Tools is a hybrid Electron and web overlay project for OBS and Streamer.Bot. It provides two primary delivery modes:

- A desktop application that runs a local HTTP server, serves an OBS browser-source overlay, exposes a React-based admin UI, stores settings locally, and offers testing, preview, logging, and update support.
- A hosted browser-source mode that can run directly from static hosting with URL-based configuration for users who do not want to install the desktop app.

At a high level, the project listens for Streamer.Bot WebSocket events, interprets relevant chat commands and stream events, converts them into animation invocations, and renders those animations in a browser-based overlay using DOM manipulation and GSAP.

## What the Project Does

The overlay supports chat-driven and event-driven effects such as:

- Direct animation commands through `!er ...`
- Randomized animation selection through `!k`
- Lurk, welcome/shoutout, cheers, choon, and hype train effects
- Avatar-based effects for Twitch users
- Manual preview and testing from the desktop app

The admin application exists to configure this behavior without editing URLs or config files manually. It loads settings, exposes feature and animation toggles, shows a live overlay preview, tests Streamer.Bot connectivity, and displays persisted logs.

## Main Runtime Pieces

### 1. Build and Packaging

The project uses Vite as the main build tool, with a combined configuration that builds:

- The Electron main and preload processes
- The React admin renderer
- The overlay HTML entry point used by OBS and the embedded preview
- Additional static pages for hosted/legacy overlay routes

The Vite config is set up with `root: "src"`, outputs renderer assets to `dist/renderer`, and outputs Electron bundles to `dist/electron`. Electron packaging is handled through `electron-builder`.

### 2. Electron Main Process

The Electron main process is the operational hub for the desktop app. It is responsible for:

- Creating the application window and tray integration
- Running a local Express server for the overlay and API endpoints
- Hosting a local WebSocket server used for internal message relay
- Persisting settings in the Electron user-data directory
- Providing log endpoints and cleanup behavior
- Providing avatar caching for Twitch avatar lookups
- Wiring auto-update events and updater IPC
- Exposing IPC handlers for the admin renderer

The local HTTP server serves both the overlay assets and a small JSON API. The current API surface includes settings retrieval, log ingestion, log retrieval, and avatar lookup.

### 3. Electron Preload Bridge

The preload script exposes a constrained `window.electronAPI` surface to the renderer. This isolates the React UI from direct Node.js access while still allowing it to:

- Save settings
- Trigger test animations
- Query the OBS URL
- Open external links
- Control quit/minimize flows
- Receive forwarded WebSocket messages
- Interact with the updater

This is the main security boundary between the privileged Electron main process and the React admin UI.

### 4. Admin Renderer

The admin application is a React UI mounted from `src/admin/admin-react.tsx`. Its core dashboard is responsible for:

- Fetching settings from the local HTTP API
- Editing feature-level and animation-level configuration
- Saving configuration via Electron IPC
- Displaying a connection test for Streamer.Bot
- Displaying the generated OBS URL
- Embedding a live preview of the overlay in an iframe
- Showing logs collected by the Electron-hosted API

The preview system is notable because it uses the real overlay page rather than a separate mock renderer. The admin UI embeds the overlay in an iframe, then sends synthetic preview messages into that iframe with `postMessage`. That means the preview path exercises the same command parsing and animation code used by the real overlay.

### 5. Overlay Runtime

The overlay itself is a browser application intended for OBS Browser Source or hosted use. It:

- Loads and merges settings
- Connects directly to a Streamer.Bot WebSocket server when running as a normal browser page, including OBS Browser Source usage
- Can listen for Electron-forwarded messages when running inside the Electron renderer context
- Parses incoming Streamer.Bot event payloads
- Maps those events to feature handlers and animation functions
- Renders animated DOM elements into a shared overlay container

The overlay entry point initializes the runtime, optionally shows a banner for hosted users, connects its event source, and exposes testing helpers on `window`.

### 6. Shared Configuration and Registry Layer

The shared layer provides:

- Cross-runtime TypeScript types
- Default settings
- Deep-merge behavior for persisted settings
- A central animation registry with metadata such as labels, defaults, grouping, and special requirements

The animation registry is a strong design choice in the current codebase. It reduces hardcoded logic by describing animation capabilities declaratively and is used to generate defaults and determine how commands should behave.

## How It Works End to End

## Desktop App Flow

1. Electron starts and loads saved settings from the user-data directory.
2. Electron starts a local Express server on the configured overlay port.
3. Electron creates a local WebSocket server for relaying internal messages.
4. The admin UI loads in a BrowserWindow and fetches settings from the local API.
5. The overlay is served from the same local server and can be used both in OBS and inside the admin preview iframe.
6. The admin UI can trigger preview actions by posting synthetic events into the embedded overlay iframe.
7. When the overlay is loaded in OBS as a browser source, it still connects directly to Streamer.Bot using the configured WebSocket URL.
8. Electron also exposes a separate internal message relay path for Electron-hosted overlay contexts and test commands, but that is not yet the single source of truth for live desktop-mode events.

## Hosted Overlay Flow

1. The overlay is served as static assets.
2. Configuration is supplied through URL parameters such as Streamer.Bot server location, username, and debug flags.
3. The overlay connects directly to Streamer.Bot from the browser.
4. Incoming events are parsed and routed to the same handlers and animation functions used by the desktop mode.

## Event and Command Processing

Incoming Streamer.Bot payloads are routed by event type. The current routing model supports at least:

- `ChatMessage` for command parsing
- `FirstWord` for welcome-style behavior
- Hype train lifecycle events
- `Custom` for coin flip behavior
- `Action` for custom action handling

For chat commands, the overlay does the following:

1. Extracts message text, username, user identifiers, and emotes.
2. Enforces subscription-only restrictions when enabled.
3. Checks feature toggles and animation enablement.
4. Resolves animation parameters from command text or saved defaults.
5. Fetches avatars for avatar-based effects when needed.
6. Invokes the appropriate animation function.

The `!er` command executes a specific animation, while `!k` builds a random pool from the animation registry and selects an enabled animation, including grouped animations such as falling or 3D shapes.

## Animation System

Animation modules are loaded dynamically from `src/overlay/animations`. These modules manipulate DOM elements within the overlay container and rely heavily on GSAP for timing and motion. The architecture here is intentionally flexible:

- Animation functions are imported dynamically
- Handler logic dispatches by animation name
- Special metadata such as `requiresAvatar` and `requiresText` changes how the animation is invoked

This makes it relatively easy to add new animations without rewriting the entire command parser.

## Settings and Persistence Model

The project uses a shared default settings object and a deep-merge strategy so that new animations or config fields can be added without breaking existing user settings.

In desktop mode:

- Settings are stored as JSON in Electron's user-data directory
- The admin UI reads settings through HTTP and saves through IPC
- The overlay reads settings from the local API

In hosted mode:

- Settings are mostly controlled by URL parameters and built-in defaults
- The overlay can still attempt to fetch `/api/settings`, but that only succeeds when a compatible server is present

## Logging and Support Services

The Electron app adds a small operational layer around the overlay:

- Avatar lookup is cached through a local API to reduce repeated external requests
- Logs are persisted as JSON Lines files grouped by date
- The admin UI can browse and filter those logs
- Auto-update hooks are wired into Electron and exposed to the renderer

This turns the desktop app into more than just a shell around a browser page. It acts as a lightweight local backend for the overlay runtime.

## Strengths in the Current Design

- The overlay and preview use the same rendering path, which reduces preview drift.
- The animation registry centralizes metadata and is a good base for future extensibility.
- The project supports both local-desktop and hosted delivery modes with mostly shared logic.
- The Electron preload keeps the renderer isolated from direct Node.js access.
- The deep-merge settings model is pragmatic and protects older settings files when new animations are added.

## Best-Practice Evaluation

The project is functional and pragmatic, but it still mixes concerns in ways that make long-term maintenance harder than necessary.

### Architecture Observations

- The Electron main process currently owns too many responsibilities: window lifecycle, tray behavior, Express hosting, WebSocket relay, settings persistence, avatar caching, logging, and updates. This works for a smaller app, but it makes testing and future refactoring harder.
- The admin renderer talks to both the Electron IPC bridge and the local HTTP API. That split is understandable, but it means the data ownership model is not fully consistent.
- The overlay runtime has two event input modes: direct Streamer.Bot WebSocket access and Electron-forwarded messages. Supporting both is useful, but the abstraction is informal rather than explicit.
- The project structure is partially organized by runtime (`electron`, `admin`, `overlay`, `shared`), which is good, but some important concerns remain spread across multiple places.

### Current Gaps Relative to Modern Best Practices

- There is no clean application service layer between Electron main and infrastructure concerns. Most backend-like behavior is effectively embedded in `electron/main.ts`.
- The overlay state model is mutable and singleton-based. That makes initialization order matter more than it should.
- The overlay creates its Streamer.Bot WebSocket using settings available at import time, before async settings fetch completes. That can produce configuration drift if the saved WebSocket URL differs from the default.
- The admin settings form and runtime side effects are not fully normalized. For example, the code distinguishes between saved settings, fetched settings, and live preview state, but these concerns are not clearly separated.
- Some settings plumbing appears inconsistent, such as the port field naming between admin form state and the shared settings shape, which increases the chance of silent configuration bugs.
- The desktop app uses both a local HTTP server and a separate local WebSocket server to coordinate internal behavior. That is workable, but the protocol boundary is looser than it should be.
- Hosted mode and Electron mode share code, but some assumptions still leak between them, especially around `/api/settings`, local avatar caching, and environment detection.

## Suggested Project Structure Improvements

A stronger structure would keep the runtime separation but introduce clearer boundaries inside each runtime.

### Recommended Top-Level Organization

Consider moving toward a layout like this:

```text
src/
  admin/
    app/
    components/
    features/
    services/
  overlay/
    app/
    animations/
    commands/
    event-sources/
    services/
    state/
  electron/
    main/
      windows/
      tray/
      ipc/
      server/
      services/
    preload/
  shared/
    config/
    contracts/
    registry/
    types/
```

### Specific Refactors Worth Doing

- Split `electron/main.ts` into modules for window management, tray integration, settings persistence, API server setup, WebSocket relay, and updater wiring.
- Move overlay command parsing into a dedicated command layer so chat parsing is independent from transport details.
- Introduce a small event-source abstraction in the overlay such as `StreamerBotEventSource`, `ElectronRelayEventSource`, and `PreviewEventSource`.
- Move settings loading and reloading into an explicit settings service rather than relying on mutable singleton state.
- Keep animation metadata in the registry, but formalize animation function signatures so handler code does not need as many ad hoc special cases.
- Add a contract layer for shared event payloads so admin preview messages, Electron relay messages, and Streamer.Bot-derived messages are normalized into one internal event type.

## Suggested Improvements for Electron and OBS Integration

The current approach serves the overlay locally and lets OBS load it through a browser source. That is a sound model and should remain the default, but the integration can be made cleaner.

### Recommended Interaction Model

Electron should act as the single local control plane for OBS overlays:

- Electron owns the local settings store.
- Electron owns the local HTTP server that serves overlay assets and read-only runtime configuration.
- Electron owns the Streamer.Bot connection in desktop mode.
- OBS overlays connect only to the Electron-hosted local server, not directly to Streamer.Bot.
- The overlay should receive already-normalized event messages from Electron through a single channel.

This has several advantages:

- Only one process needs to manage Streamer.Bot authentication, reconnection, and subscription logic.
- Multiple OBS overlays can share the same event stream without each opening its own Streamer.Bot WebSocket.
- The overlay becomes a thinner rendering client and is easier to reason about.
- Preview, test, and production traffic can use the same normalized event contract.

### Practical Evolution Path

1. Move Streamer.Bot connectivity entirely into Electron for desktop mode.
2. Define a typed local event protocol such as `OverlayEvent` with explicit event kinds.
3. Have the overlay subscribe only to Electron-served events in desktop mode.
4. Keep direct Streamer.Bot browser connectivity only for hosted mode.
5. Serve settings and event streams from one coherent local API layer.

### Better OBS Overlay Patterns

- Generate a per-overlay session token or signed local URL so OBS overlays can connect to the local app intentionally rather than implicitly.
- Add a lightweight health endpoint so the admin UI and overlay can verify that the local server is reachable.
- Add a versioned runtime contract between Electron and the overlay so updates can be validated more safely.
- Consider using Server-Sent Events or a single structured WebSocket channel for overlay events instead of combining HTTP config fetches, iframe `postMessage`, Electron IPC, and a second local WebSocket relay.
- Separate preview events from production events at the protocol level so preview state cannot accidentally bleed into live overlay behavior.

## Most Important Near-Term Improvements

If the goal is to improve maintainability without rewriting the project, the highest-value changes are:

1. Split the Electron main process into testable service modules.
2. Normalize all overlay inputs into one internal event model.
3. Make overlay settings initialization explicit and reconnect transports when settings change.
4. Move desktop-mode Streamer.Bot connectivity into Electron rather than the overlay page.
5. Define a clear contract for preview traffic versus live OBS traffic.

## Bottom Line

This project is already more than a simple overlay page. It is a small desktop-managed overlay platform with a browser renderer, local control server, settings system, preview system, and operational tooling.

The core design is sound: one overlay runtime, one admin UI, shared config, and a desktop wrapper that improves usability. The main opportunity is to modernize the boundaries between transport, state, and rendering so the Electron app becomes the clear orchestrator for desktop use and the overlay becomes a cleaner, smaller rendering client for OBS.