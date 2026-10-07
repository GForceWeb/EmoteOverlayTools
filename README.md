## G-Force's Emote Overlay Tools

Initially forked from [VRFlad's](https://vrflad.com) work on [EmoteRain](https://codepen.io/vrflad/pen/VwMYaYo). I couldn't have built this without his code as an inspiration and building block.

My desire to work on this project came from the lack of Twitch Animated emote support in StreamElements. Now I have more animation variation than before and Twitch animated emotes work great!

## Prerequisites

- Desktop users can choose **Connect directly to Twitch** or **Use Streamer.Bot** in Setup.
   - Direct Twitch mode opens Twitch login in your browser. Log in as the broadcaster and authorize access to your channel. Keep Emote Overlay Tools running while streaming.
   - Streamer.Bot mode requires its WebSocket server to be enabled and running (Servers/Clients -> WebSocket Server -> Start Server).
- The hosted browser source currently uses Streamer.Bot. Direct Twitch login is available in the desktop application.

## Installation Options

### Option 1: Desktop Application (Recommended)

- Benefits: Most customizable experience, includes a built-in tester/preview, and runs a local self-contained web server for your OBS Browser Source.
- Download and install the latest release of Emote Overlay Tools from the [releases page](https://github.com/gforceweb/EmoteOverlayTools/releases)
- Launch the application
- Open Setup and choose direct Twitch login or your existing Streamer.Bot connection
- Copy the provided OBS Browser Source URL and add it as a Browser Source in OBS
- Configure your settings in the app interface
- Test animations directly from the app

### Option 2: Hosted Browser Source (no separate app install)

- Benefits: Works without installing a separate desktop application; quick to try and easy to share.
- Head to [https://gforceweb.github.io/EmoteOverlayTools/config](https://gforceweb.github.io/EmoteOverlayTools/config) and select your settings
- Copy the URL from the address bar and add it as a Browser Source in OBS
- Enjoy!

## Desktop Application Overview

The desktop application provides several benefits:

- Built-in animation testing and preview
- Easy configuration through a user-friendly interface
- Highly customizable settings
- Self-contained local web server for OBS browser source

### Application Tabs

1. **Settings**: Configure all aspects of the overlay including:

   - Server port for the local web server
   - Feature toggles
   - Maximum emote counts
   - Subscriber-only mode options

2. **Test Animations**: Preview and test all animations directly:

   - Select animation types
   - Set emote counts
   - Use specific usernames for avatar-based animations
   - View real-time previews

3. **Logs**: Monitor activity and debug issues:
   - Track WebSocket connections
   - View animation trigger events
   - Identify any potential errors

## Settings Breakdown

- Enable All Features: Enable all features.
- Enable Specific Features: If All Features if disabled, you can select the specific features you wish to activate
- Maximum Emotes Per Action: Sets a hard cap on the number of emotes that can be included in a single action. Can help prevent lag if your setup struggles with too many emotes.
- Restrict Commands to Subs Only: If enabled, only users with a Twitch Subscriber role can use the !k and !er commands.
- SB Server Address: Leave as `localhost:8080` unless you run Streamer.Bot on a different machine to OBS
- Connection mode: Select Streamer.Bot or direct Twitch. Mode changes apply immediately; the OBS Browser Source URL stays the same.

```
    welcome
    lurk
    emoterain
    kappagen
    subonly
    maxemotes=X
    all
```

# Features

## EmoteRain

A set of specific animation commands that accept emotes along with optional quantity and interval values

- !er rain
- !er rise
- !er volcano
- !er firework
- !er explode
- !er lefttwave
- !er rightwave
- !er carousel
- !er spiral
- !er dvd
- !er cube
- !er cyclone
- !er tetris
- !er text TEXT_TO_WRITE

All animations have default values for quantity and interval so there's never a need to specify them. But you can get creative and add values like so:

```
//format
!er %command% %emotes% %quantity% %interval%
//example
!er rain gforce_hype 250 50
```

This would trigger the rain animation with the gforce_hype emote, raining 250 emotes with a 50ms interval between emotes.

## Visual Lurk

When a user types !lurk in chat their twitch avatar will peek out form a random side of the screen. It will repeat this twice more from random locations.

## Welcome & Shoutout Rain

When a user types their first message for that stream emote rain is triggered with their twitch avatar.

When !so is used the targetted user's Twitch avatar will rain down

## Kappagen

This serves to replace the !k command from StreamElements. If you're using this option, you'll likely want to disable the !k command in StreamElements.

This will pick a random animation from the list mentioned above and invoke it with the emotes sent. The same quantity and interval values can also be used for !k commands

## Choon & Cheers

When a user types `!choon` in chat their twitch avatar will pop in from the side and sing along to the music.

When a user types `!cheers @username` in chat both theirs and their targets avatar will be dropped into a glass of beer. Cheers!

## Hype Train

A Visual Train effect that drives along the top of the screen. The train will be made up of the avatars of the users who have contributed to the hype train.

# Developer Information

## Project Structure

The repository is structured as follows (key folders only):

- `/overlay` — Overlay runtime used in OBS (and by the desktop app)
   - `index.html` — Overlay entry point loaded by OBS Browser Source
   - `handlers.ts` — How chat messages get passed to actions
   - `animations/` — Individual overlay animations (rain, rise, spiral, etc.)

- `/src/admin` — Desktop application admin UI (React)
   - `admin.html` and `admin-react.tsx` — Entry for the admin interface used by the desktop app
   - `components/` — Settings panels, preview, UI components
   - `styles/`, `css/`, `hooks/`, `lib/` — Styling and utilities for the admin UI

- `/electron` — Electron main process and preload bridge
   - `main.ts` — Window management and local server wiring
   - `preload.ts` — Secure IPC bridge between renderer and main

- `/src/shared` and `/types` — Shared types and configuration used across overlay and app
   - `src/shared` — Shared runtime utilities and default config
   - `types/` — Type definitions (e.g., `settings.ts`)

- `/assets` — Static assets (images, etc.)

## Development Setup

### Twitch Developer application

Register an application in the [Twitch Developer Console](https://dev.twitch.tv/console/apps) with **Client Type: Public**. Use a desktop/application integration category appropriate for the app. Copy its Client ID into the repository-root `.env`:

```dotenv
TWITCH_CLIENT_ID="your_twitch_application_client_id"
```

This is the only Twitch application credential required. The desktop app uses Twitch's [device code grant flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#device-code-grant-flow), which supports public clients and refresh tokens without a Client Secret. This flow does not use an OAuth redirect URI. If the registration form asks for one, `http://localhost` can be entered as an unused registration value. Do not add `TWITCH_CLIENT_SECRET` or any user access/refresh tokens to `.env`.

Vite reads `.env` from the repository root and embeds the public Client ID into the Electron main process. Restart development or rebuild the desktop release after changing it. Builds without a Client ID still support Streamer.Bot and explain why Twitch login is unavailable.

The broadcaster grants these read scopes during login:

| Scope | Used for |
| --- | --- |
| `user:read:chat` | Chat messages, Twitch emotes, subscriber/founder badges, and overlay commands |
| `channel:read:subscriptions` | Subscriptions, resubs, and subscription gifts |
| `bits:read` | Bits contributions and Gigantify Power-ups |
| `channel:read:hype_train` | Hype Train start, progress, levels, and end |
| `channel:read:redemptions` | Automatic reward redemptions |

The app uses one [EventSub WebSocket connection](https://dev.twitch.tv/docs/eventsub/handling-websocket-events/) in its main process and relays events to all local overlays and previews. It also retrieves avatars through the Twitch API in direct mode. Access and refresh tokens are encrypted with Electron `safeStorage` in `twitch-credentials.bin` under the app's user-data directory. Tokens are never put in settings, renderer state, OBS URLs, or logs. Linux requires a working system keyring. Disconnect removes local credentials and attempts to revoke the access token; switching to Streamer.Bot retains the encrypted login for later use.

Direct mode covers the Twitch events consumed by the overlay, rather than every event type Twitch offers. Some event types require an Affiliate/Partner channel or the corresponding permission. Failed optional subscriptions are shown in Setup while chat remains connected. Streamer.Bot custom actions/events, including externally generated coin-flip results and MaxOutMultiply, remain specific to Streamer.Bot mode.

First-message welcomes are tracked from messages received while the app is running and reset on `stream.online`. Restarting the app or changing modes resets that local tracking. Temporary connection loss does not reset it. Twitch does not replay events missed during a disconnected session.

After configuring the Client ID, verify real login and consent, chat and emotes, raids, eligible channel rewards and Hype Trains, restarting with saved credentials, and disconnecting. Automated tests cover these flows with mocked Twitch responses; they do not replace a live Twitch check.

1. Install dependencies:

```
pnpm install
```

2. Run in development mode:

```
pnpm electron:dev
```

3. Build for distribution:

```
pnpm electron:build
```

# Feedback

I'm always open to feedback on potential improvements and new animations. If you have any suggestions or feedback, please let me know! I stream on Twitch Wednesdays and Sundays at [twitch.tv/gforce_aus](https://www.twitch.tv/gforce_aus)
