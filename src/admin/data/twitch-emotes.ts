/**
 * Base library of popular Twitch global emotes for preview selection
 * These are the most commonly used Twitch emotes
 */

export interface TwitchEmote {
  id: string;
  name: string;
  imageUrl: string;
  category: 'classic' | 'hype' | 'reaction' | 'meme' | 'popular';
}

// Global Twitch emotes using the official CDN
// Using v2 API format: https://static-cdn.jtvnw.net/emoticons/v2/{id}/default/dark/2.0
const createEmote = (id: string, name: string, category: TwitchEmote['category']): TwitchEmote => ({
  id,
  name,
  imageUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
  category,
});

export const twitchEmotes: TwitchEmote[] = [
  // Classic Twitch emotes
  createEmote('425618', 'LUL', 'classic'),
  createEmote('28', 'MrDestructoid', 'classic'),
  createEmote('1', ':)', 'classic'),
  createEmote('2', ':(', 'classic'),
  createEmote('3', ':D', 'classic'),
  createEmote('4', '>(', 'classic'),
  createEmote('5', ':z', 'classic'),
  createEmote('6', 'O_o', 'classic'),
  createEmote('7', 'B)', 'classic'),
  createEmote('8', ':O', 'classic'),
  createEmote('9', '<3', 'classic'),
  createEmote('10', ':\\', 'classic'),
  createEmote('11', ';)', 'classic'),
  createEmote('12', ':P', 'classic'),
  createEmote('13', ';P', 'classic'),
  createEmote('14', 'R)', 'classic'),
  
  // Kappa family
  createEmote('25', 'Kappa', 'meme'),
  createEmote('354', 'Keepo', 'meme'),
  createEmote('55338', 'KappaRoss', 'meme'),
  createEmote('160401', 'KappaClaus', 'meme'),
  createEmote('74510', 'KappaPride', 'meme'),
  createEmote('160400', 'KappaWealth', 'meme'),
  
  // Hype emotes
  createEmote('307827377', 'PogChamp', 'hype'),
  createEmote('emotesv2_64b47eb4b67a4ff0978f9c7b2ea19d42', 'PogChomp', 'hype'),
  createEmote('emotesv2_c85b468b5e6e4e21ba5f3ab7e2abb58f', 'PoroSad', 'hype'),
  createEmote('30259', 'HeyGuys', 'hype'),
  createEmote('86', 'BibleThump', 'hype'),
  createEmote('58765', 'NotLikeThis', 'hype'),
  createEmote('41', 'Kreygasm', 'hype'),
  createEmote('22639', 'BabyRage', 'hype'),
  createEmote('160402', 'CoolCat', 'hype'),
  
  // Reaction emotes
  createEmote('65', 'FrankerZ', 'reaction'),
  createEmote('15', 'JKanStyle', 'reaction'),
  createEmote('16', 'OptimizePrime', 'reaction'),
  createEmote('17', 'StoneLightning', 'reaction'),
  createEmote('18', 'TheRinger', 'reaction'),
  createEmote('20', 'RedCoat', 'reaction'),
  createEmote('22', 'Kappa', 'reaction'),
  createEmote('27', 'WinWaker', 'reaction'),
  createEmote('30', 'BCWarrior', 'reaction'),
  createEmote('33', 'DansGame', 'reaction'),
  createEmote('36', 'PJSalt', 'reaction'),
  createEmote('38', 'TriHard', 'reaction'),
  createEmote('46', 'SSSsss', 'reaction'),
  createEmote('47', 'PunchTrees', 'reaction'),
  createEmote('50', 'ArsonNoSexy', 'reaction'),
  createEmote('52', 'SMOrc', 'reaction'),
  
  // Popular/Meme emotes
  createEmote('55', 'Failfish', 'meme'),
  createEmote('68', 'ItsBoshyTime', 'meme'),
  createEmote('69', 'ResidentSleeper', 'meme'),
  createEmote('73', 'DBstyle', 'meme'),
  createEmote('81', 'BloodTrail', 'meme'),
  createEmote('87', 'ShazBotstix', 'meme'),
  createEmote('88', 'PogBones', 'meme'),
  createEmote('92', 'PMSTwin', 'meme'),
  createEmote('244', 'Volcania', 'meme'),
  createEmote('245', 'MrDestructoid', 'meme'),
  createEmote('354', 'Keepo', 'meme'),
  createEmote('357', 'HotPokket', 'meme'),
  createEmote('360', 'OMGScoots', 'meme'),
  createEmote('1902', 'Jebaited', 'meme'),
  createEmote('114836', 'CoolStoryBob', 'meme'),
  createEmote('114876', 'WutFace', 'meme'),
  createEmote('120232', 'TriHard', 'meme'),
  createEmote('134256', 'VoteNay', 'meme'),
  createEmote('134255', 'VoteYea', 'meme'),
  createEmote('245', 'PartyParrot', 'popular'),
  createEmote('117484', 'Squid1', 'popular'),
  createEmote('117485', 'Squid2', 'popular'),
  createEmote('117486', 'Squid3', 'popular'),
  createEmote('117487', 'Squid4', 'popular'),
  createEmote('81997', 'cmonBruh', 'popular'),
  createEmote('81274', 'SeriousSloth', 'popular'),
  createEmote('69847', 'DoritosChip', 'popular'),
  createEmote('81249', 'ThankEgg', 'popular'),
  createEmote('81273', 'TooSpicy', 'popular'),
  createEmote('114846', 'twitchRaid', 'popular'),
  createEmote('81636', 'OSFrog', 'popular'),
  createEmote('80393', 'VoHiYo', 'popular'),
  createEmote('81103', 'riPepperonis', 'popular'),
];

// Default emotes used for preview
export const defaultPreviewEmotes: TwitchEmote[] = [
  twitchEmotes.find(e => e.name === 'LUL')!,
  twitchEmotes.find(e => e.name === 'Kappa')!,
  twitchEmotes.find(e => e.name === 'PogChamp')!,
];

/**
 * Search emotes by name (case-insensitive)
 */
export function searchEmotes(query: string): TwitchEmote[] {
  if (!query.trim()) return twitchEmotes;
  
  const lowerQuery = query.toLowerCase();
  return twitchEmotes.filter(emote => 
    emote.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get emotes by category
 */
export function getEmotesByCategory(category: TwitchEmote['category']): TwitchEmote[] {
  return twitchEmotes.filter(emote => emote.category === category);
}

/**
 * Validate if a URL is a valid Twitch emote URL
 */
export function isValidEmoteUrl(url: string): boolean {
  return url.startsWith('https://static-cdn.jtvnw.net/emoticons/') ||
         url.startsWith('https://cdn.7tv.app/') ||
         url.startsWith('https://cdn.betterttv.net/') ||
         url.startsWith('https://cdn.frankerfacez.com/');
}
