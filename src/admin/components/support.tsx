import React from "react";
import { Button } from "@/admin/components/ui/button";

export function Support() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">About the Project</h2>
        <p className="text-sm text-muted-foreground">
            Emote Overlay Tools is a passion project that grew out of my love for streaming and a spark of inspiration from VRFlad’s excellent EmoteRain overlay. His original concept showed me what was possible and set me on this journey.
        </p>

        <p className="text-sm text-muted-foreground">
            Back when I started streaming, Twitch had just begun rolling out animated emote support. At the time, I was a heavy StreamElements user — and I was frustrated that animated emotes weren’t supported in their emote and Kappagen animations. That gap, combined with the creativity I saw in EmoteRain, lit the fire that eventually became this project.
        </p>

        <p className="text-sm text-muted-foreground">
            Since then, I’ve been continuously refining Emote Overlay Tools — experimenting with new animations, adding features, trying new things and just generally building things I want to use. What started as a personal solution for my own channel has grown into a tool I’m excited to share with other streamers.
        </p>

        <p className="text-sm text-muted-foreground">
            This project has been a rewarding creative outlet outside of my professional career, pushing me to learn new skills and explore a completely different side of development. It’s been an amazing journey so far — and I can’t wait to see how other creators use it to bring their streams to life.
        </p>

      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">About Me</h2>
        <p className="text-sm text-muted-foreground">
          I’m G-Force. I'm a DJ, streamer and web developer based in Australia. I’ve been DJing a full spectrum of hard, underground dance music for 
          over 17 years and have been streaming on Twitch since 2020. Day to day I work as a website developer building websites and custom 
          web projects for a range of clients.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Questions or Suggestions?</h2>
        <p className="text-sm text-muted-foreground">
          The best place to get support, report issues, or chat about ideas is the Discord. New ideas and feedback are
          both welcome and encouraged — jump in and say hi!
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => window.electronAPI.openExternal("https://discord.gg/rHMTR46mtb")}
          >
            Discord (Support)
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.electronAPI.openExternal("https://github.com/gforceweb/EmoteOverlayTools")}
          >
            GitHub
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Socials</h2>
        <p className="text-sm text-muted-foreground">
          Keep up with what I’m building (and drop by to hang out) on Twitch or Instagram. I stream Wednesday and
          Sunday evenings (GMT+8).
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => window.electronAPI.openExternal("https://www.twitch.tv/gforce_aus")}
          >
            Twitch
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.electronAPI.openExternal("https://instagram.com/gforce_aus")}
          >
            Instagram
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Feeling Generous?</h2>
        <p className="text-sm text-muted-foreground">
          Donations are never required or expected. But if you enjoy the tool and have the means, supporting me with a
          donation would mean the world and helps me dedicate more time to building new features and improvements.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.electronAPI.openExternal("https://ko-fi.com/S6S81JS0P3")}>
            Support on Ko‑fi
          </Button>
        </div>
      </div>
    </div>
  );
}


