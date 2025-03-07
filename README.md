## G-Force's Emote Overlay Tools

Forked from [VRFlad's](https://vrflad.com) amazing work on [EmoteRain](https://codepen.io/vrflad/pen/VwMYaYo). I couldn't have built this without his code as a building block.

Inspiration to work on this came from the lack of Twitch Animated emote support in StreamElements. Now I have more animation variation than before and Twitch animated emotes work great!

## Installation Options

### Option 1: Desktop Application (Recommended)

- Download and install the latest release of Emote Overlay Tools from the [releases page](https://github.com/gforceweb/EmoteOverlayTools/releases)
- Launch the application
- Copy the provided OBS Browser Source URL and add it as a Browser Source in OBS
- Configure your settings in the app interface
- Test animations directly from the app

### Option 2: Browser Source (Streamer.Bot Required)

- Ensure you have Streamer.Bot installed and running with the WebSocket server enabled (Servers/Clients -> WebSocket Server -> Start Server)
- Head to [https://gforceweb.github.io/EmoteOverlayTools/dist/config.html](https://gforceweb.github.io/EmoteOverlayTools/dist/config.html) and select your settings
- Copy the URL from the address bar and add it as a Browser Source in OBS
- Enjoy!

## Desktop Application Overview

The desktop application provides several benefits:

- No need for Streamer.Bot (though still compatible if you want to use both)
- Built-in animation testing and preview
- Easy configuration through a user-friendly interface
- Self-contained web server for OBS browser source

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

The application is structured as follows:

- `/src` - Main animation and frontend code

  - `/animations` - Individual animation modules
  - `/css` - Styling for the application
  - `/lib` - Utility libraries and helpers
  - `index.html` - Main animation display (used in OBS)
  - `admin.html` - Desktop application UI
  - `config.html` - Configuration for browser source mode
  - Various TypeScript files for handling animations, websockets, etc.

- `/electron` - Electron-specific code

  - `main.ts` - Main process for Electron (window management and Express server)
  - `preload.ts` - Secure bridge between renderer and main processes

- `/assets` - Static assets (images, sounds, etc.)

## Development Setup

1. Install dependencies:

```
npm install
```

2. Run in development mode:

```
npm run electron:dev
```

3. Build for distribution:

```
npm run electron:build
```

# Feedback

I'm always open to feedback on potential improvements and new animations. If you have any suggestions or feedback, please let me know! I stream on Twitch Wednesdays and Sundays at [twitch.tv/gforce_aus](https://www.twitch.tv/gforce_aus)
