export type AppType = 'mail' | 'gacha' | 'mixtape' | 'ticket' | 'game' | 'photos' | 'calendar' | 'secret';

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

export interface PhotosConfig {
  photos: {
    url: string;
    caption: string;
    rotation: number;
    x: number;
    y: number;
  }[];
}

export interface CalendarConfig {
  year: number;
  month: number; // 1-12
  highlightedDay: number;
  memoryTitle: string;
  memoryText: string;
  memoryPhotoUrl?: string;
}

export interface SecretConfig {
  passwordHint: string;
  password: string;
  contentType: 'message' | 'photos' | 'video';
  content: string;
  title: string;
}
