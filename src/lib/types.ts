export type AppType = 'mail' | 'gacha' | 'mixtape' | 'ticket' | 'game' | 'photos' | 'calendar' | 'secret' | 'purr';

export interface DesktopConfig {
  id: string;
  slug: string;
  recipientName: string;
  wallpaper: string;
  wallpaperType: 'gradient' | 'solid' | 'image';
  stickyNote?: string;
  shutdownMessage: string;
  welcomeMessage: string;
  apps: {
    [key in AppType]?: AppConfig;
  };
  music?: {
    enabled: boolean;
    url?: string;
    fileName?: string;
    startOffset?: number;
    endOffset?: number;
    loop?: boolean;
    volume?: number;
  };
}

export interface AppConfig {
  enabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}

export interface MailConfig {
  fromName: string;
  subject: string;
  body: string;
  signature?: string;
  photoUrl?: string;
}

export interface GachaCapsule {
  message: string;
  emoji: string;
  rarity: 'normal' | 'rare' | 'legendary';
  color: string;
}

export interface GachaConfig {
  capsules: GachaCapsule[];
}

export interface MixtapeConfig {
  title: string;
  personalNote: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  songs: { title: string; artist: string }[];
}

export interface TicketConfig {
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  location: string;
  dresscode?: string;
  notes?: string;
  countdownEnabled: boolean;
}

export interface GameConfig {
  rewardMessage: string;
}

export interface PhotoItem {
  id?: string;
  url: string;
  caption: string;
  date?: string;
  location?: string;
  secretNote?: string;
  audioUrl?: string;
  tapeStyle?: 'grid' | 'floral' | 'pastel' | 'clear' | 'none';
  filter?: 'normal' | 'vintage' | 'grain' | 'glow' | 'bw';
  sticker?: 'stamp' | 'heart' | 'ribbon' | 'star' | 'none';
  rotation?: number;
  x?: number;
  y?: number;
}

export interface PhotoAlbumPage {
  id: string;
  title?: string;
  layout: 'single' | 'grid2x2' | 'scrapbook' | 'journal';
  photos: PhotoItem[];
  journalText?: string;
  bgPalette?: string;
}

export interface PhotosConfig {
  albumTitle?: string;
  palette?: string;
  musicUrl?: string;
  pages?: PhotoAlbumPage[];
  // Legacy fallback
  photos?: PhotoItem[];
}

export interface MemoryDateItem {
  id?: string;
  day: number;
  month?: number; // 1-12 (defaults to config.month)
  year?: number;
  icon?: string;
  title: string;
  text: string;
  photoUrl?: string;
  location?: string;
  voiceUrl?: string;
  tagColor?: string;
}

export interface CalendarConfig {
  year: number;
  month: number; // 1-12
  palette?: string;
  title?: string;
  memories?: MemoryDateItem[];
  // Backwards compatibility fallbacks:
  highlightedDay?: number;
  memoryTitle?: string;
  memoryText?: string;
  memoryPhotoUrl?: string;
}

export interface SecretConfig {
  passwordHint: string;
  password: string;
  contentType: 'message' | 'photos' | 'video';
  content: string;
  title: string;
}
