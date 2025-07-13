export interface LanyardApiResponse {
  success: boolean;
  data: LanyardData | null;
  error?: string;
}

export interface LanyardStatusResponse {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface LanyardData {
  spotify: LanyardSpotify | null;
  listening_to_spotify: boolean;
  kv: { [key: string]: string } | null;
  discord_user: LanyardUser;
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: LanyardActivity[];
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_embedded?: boolean;
}

export interface LanyardSpotify {
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
}

export interface LanyardUser {
  username: string;
  global_name: string | null;
  display_name: string | null;
  id: string;
  discriminator: string;
  avatar: string | null;
  avatar_decoration_data?: {
    sku_id: string;
    asset: string;
    expires_at: number;
  } | null;
  bot: boolean;
  public_flags: number;
  clan?: {
    tag: string;
    identity_guild_id: string;
    badge: string;
    identity_enabled: boolean;
  };
  primary_guild?: {
    tag: string;
    identity_guild_id: string;
    badge: string;
    identity_enabled: boolean;
  };
}

export interface LanyardActivity {
  type: number;
  state: string | null;
  name: string;
  id: string;
  details: string | null;
  created_at: number;
  timestamps?: {
    start: number;
    end?: number;
  };
  assets?: {
    large_text: string | null;
    large_image: string;
    small_text: string | null;
    small_image: string;
  };
  application_id?: string;
  buttons?: string[];
}

export interface UseLanyardResult {
  data: LanyardStatusResponse | null;
  loading: boolean;
  isRefreshing: boolean;
  error: Error | null;
}
