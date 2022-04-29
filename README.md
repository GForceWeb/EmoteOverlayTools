Streamer.Bot EmoteOverlayTools
-----------------------

Forked from [VRFlad's](https://vrflad.com) amazing work on [EmoteRain](https://codepen.io/vrflad/pen/VwMYaYo). I couldn't have built this without his code as a building block.

This fork is also available on [CodePen](https://codepen.io/gforceweb/pen/OJzamgO)

Inspiration to work on this came from the lack of Twitch Animated emote support in StreamElements. Now I have more animation variation than before and Twitch animated emotes work great!

## Installation

 - Ensure you have Streamer.Bot installed and running with the WebSocket server enabled (Servers/Clients -> WebSocket Server -> Start Server)
 - Download the repository from GitHub (Code -> Download Zip) and extract the content to your local machine.
 - Open the `index.html` file in your browser and copy its path
 ```
    example: file:///C:/Users/gforce/OBS_Assets/EmoteOverlayTools/index.html
 ```
-  Append the options you wish to use to the end of the URL as parameters (start with a ? then use & to separate options)
```
    welcome
    lurk
    emoterain
    kappagen
    subonly
    maxemotes=X
    all
```
 - So if we wanted to turn on lurk and kappagen with a maximum number of emotes of 300 we'd end up with:
 ```
    file:///C:/Users/gforce/OBS_Assets/EmoteOverlayTools/index.html?lurk&kappagen&maxemotes=300
 ```
 - If you want to turn on all features you can just use the all option
 ```
    file:///C:/Users/gforce/OBS_Assets/EmoteOverlayTools/index.html?all
 ```
 - With your full URL you can simply add this to OBS as a browser source

# Features

## EmoteRain

A set of specific animation commands that accept emotes along with optional quantity and interval values

 - !er rain
 - !er rise
 - !er volcano
 - !er firework
 - !er explode
 - !er rightwave
 - !er carousel
 - !er spiral

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

## Options

There's some additional customization options available including:

- subonly - only allow users with a Twitch Subscriber role to use the !k and !er commands
- maxemotes - specifies the maximum number of emotes to be included in a single animation. Default is 200. You can adjust this value to find something that allows users to have fun, without lagging your stream too badly.

# Feedback

I'm always open to feedback on potential improvements and new animations. If you have any suggestions or feedback, please let me know! I stream on Twitch Wednesdays and Sundays at [twitch.tv/gforce_aus](https://www.twitch.tv/gforce_aus)