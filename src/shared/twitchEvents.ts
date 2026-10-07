import type { EmoteData, WSData } from "./types";

interface Fragment {
  type: string;
  text: string;
  emote?: { id: string };
}

export function twitchEmote(id: string, name = ""): EmoteData {
  return { id, name, imageUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(id)}/default/dark/3.0` };
}

function emotesFromFragments(fragments: Fragment[] = []): EmoteData[] {
  let offset = 0;
  return fragments.flatMap(fragment => {
    const begin = offset;
    offset += fragment.text.length;
    return fragment.type === "emote" && fragment.emote?.id
      ? [{ ...twitchEmote(fragment.emote.id, fragment.text), begin, end: offset - 1 }]
      : [];
  });
}

/** Translate Twitch's events into the format consumed by existing animations. */
export class TwitchEventMapper {
  private seenChatters = new Set<string>();
  private trainId = "";
  private trainLevel = 0;
  private contributors = new Map<string, number>();

  reset(): void {
    this.seenChatters.clear();
    this.trainId = "";
    this.trainLevel = 0;
    this.contributors.clear();
  }

  map(type: string, event: any): WSData[] {
    const wrap = (eventType: string, data: WSData["data"] = event): WSData => ({
      event: { source: "Twitch", type: eventType }, data,
    });
    if (type === "stream.online") {
      this.seenChatters.clear();
      return [];
    }
    if (type === "channel.chat.message") {
      // Shared-chat messages from another channel should not trigger this overlay.
      if (event.source_broadcaster_user_id && event.source_broadcaster_user_id !== event.broadcaster_user_id) return [];
      const badges = event.badges ?? [];
      const data: WSData["data"] = {
        text: event.message.text,
        user: {
          id: event.chatter_user_id,
          login: event.chatter_user_login,
          name: event.chatter_user_name,
          subscribed: badges.some((badge: { set_id: string }) => ["subscriber", "founder", "broadcaster"].includes(badge.set_id)),
        },
        emotes: emotesFromFragments(event.message.fragments),
      };
      const first = !this.seenChatters.has(event.chatter_user_id);
      this.seenChatters.add(event.chatter_user_id);
      return [...(first ? [wrap("FirstWord", data)] : []), wrap("ChatMessage", data)];
    }
    if (type === "channel.raid") return [wrap("Raid")];
    const subscriptionTypes = {
      "channel.subscribe": "Sub",
      "channel.subscription.message": "Resub",
      "channel.subscription.gift": "GiftBomb",
    };
    if (subscriptionTypes[type]) {
      // Gift recipients and anonymous users should not become train contributors.
      if (event.is_anonymous || (type === "channel.subscribe" && event.is_gift)) return [];
      return [
        wrap(subscriptionTypes[type], { ...event, userName: event.user_login || event.user_name }),
        ...(this.trainId ? [wrap("HypeTrainUpdate", { last_contribution: { user_id: event.user_login || event.user_id } })] : []),
      ];
    }
    if (type === "channel.bits.use") {
      const result: WSData[] = event.user_login ? [wrap("Cheer", { ...event, userName: event.user_login })] : [];
      if (this.trainId && event.user_login) result.push(wrap("HypeTrainUpdate", { last_contribution: { user_id: event.user_login } }));
      if (event.power_up?.type === "gigantify_an_emote" && event.power_up.emote?.id) {
        result.push(wrap("PowerUpRedemption", {
          type: "gigantify_an_emote", emote: twitchEmote(event.power_up.emote.id),
        }));
      }
      return result;
    }
    if (type === "channel.channel_points_automatic_reward_redemption.add") {
      if (event.reward?.type !== "gigantify_an_emote" || !event.reward.emote?.id) return [];
      return [wrap("AutomaticRewardRedemption", {
        reward_type: event.reward.type, gigantified_emote: twitchEmote(event.reward.emote.id),
      })];
    }
    if (type === "channel.hype_train.begin" || type === "channel.hype_train.progress") {
      const result: WSData[] = [];
      // Twitch can deliver progress before begin. Start once per train ID.
      if (this.trainId !== event.id) {
        this.trainId = event.id;
        this.trainLevel = 1;
        this.contributors.clear();
        result.push(wrap("HypeTrainStart"));
      }
      while (this.trainLevel < event.level) {
        this.trainLevel++;
        result.push(wrap("HypeTrainLevelUp"));
      }
      // V2 supplies top_contributions instead of last_contribution.
      for (const contributor of event.top_contributions ?? []) {
        const key = `${contributor.user_id}:${contributor.type}`;
        if (contributor.total > (this.contributors.get(key) ?? 0)) {
          this.contributors.set(key, contributor.total);
          result.push(wrap("HypeTrainUpdate", {
            last_contribution: { user_id: contributor.user_login || contributor.user_id },
          }));
        }
      }
      return result;
    }
    if (type === "channel.hype_train.end" && this.trainId === event.id) {
      this.trainId = "";
      this.trainLevel = 0;
      return [wrap("HypeTrainEnd")];
    }
    return [];
  }
}
