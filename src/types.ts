// Common Type Definitions

export interface GlobalVars {
  channelsub?: boolean;
  hypetrainCache: string[];
  BotChat?: boolean;
  hypetimer?: ReturnType<typeof setTimeout>;
  HypeTrainWrapper?: HTMLElement;
  HypeCart?: HTMLElement;
  divnumber: number;
}

export interface GlobalConst {
  defaultemotes: number;
  maxemotes: number;
  ws: WebSocket;
  warp: HTMLElement;
  subonly: boolean;
  emoterain: boolean;
  welcome: boolean;
  all: boolean;
  lurk: boolean;
  kappagen: boolean;
  debug: boolean;
  hypetrain: boolean;
  cheers: boolean;
  choon: boolean;
}

export interface EmoteData {
  name: string;
  imageUrl: string;
}

export interface WSData {
  event?: {
    type?: string;
  };
  data?: {
    message?: {
      username?: string;
      userId?: string;
      message?: string;
      role?: string;
      subscriber?: boolean;
      emotes?: EmoteData[];
    };
    userName?: string;
    last_contribution?: {
      user_id?: string;
    };
    name?: string;
    coinFlipResult?: string;
    from_broadcaster_user_id?: string;
    from_broadcaster_user_name?: string;
    viewers?: number;
  };
  actions?: any[];
  id?: string;
}

export interface AnimationModule {
  [key: string]: (images: string[], count?: any, interval?: number) => void;
}