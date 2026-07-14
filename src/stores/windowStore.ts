import { create } from 'zustand';

export type AppType = 'mail' | 'gacha' | 'mixtape' | 'ticket' | 'game' | 'photos' | 'calendar' | 'secret';

export interface WindowState {
  id: string;
  appType: AppType;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface DesktopConfig {
  recipientName: string;
  wallpaper: string;
  wallpaperType: 'gradient' | 'solid' | 'image';
  stickyNote?: string;
  apps: {
    [key in AppType]?: {
      enabled: boolean;
      config: Record<string, unknown>;
    };
  };
}

interface WindowStore {
  windows: WindowState[];
  highestZIndex: number;
  openWindow: (appType: AppType, title: string, icon: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  getDefaultSize: (appType: AppType) => { width: number; height: number };
}

const DEFAULT_SIZES: Record<AppType, { width: number; height: number }> = {
  mail: { width: 640, height: 480 },
  gacha: { width: 380, height: 480 },
  mixtape: { width: 480, height: 540 },
  ticket: { width: 440, height: 520 },
  game: { width: 480, height: 520 },
  photos: { width: 600, height: 480 },
  calendar: { width: 420, height: 460 },
  secret: { width: 380, height: 380 },
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  highestZIndex: 10,

  getDefaultSize: (appType: AppType) => DEFAULT_SIZES[appType],

  openWindow: (appType, title, icon) => {
    const { windows, highestZIndex } = get();
    const existing = windows.find((w) => w.appType === appType);

    if (existing) {
      // Just focus + restore it
      set((state) => ({
        highestZIndex: state.highestZIndex + 1,
        windows: state.windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, isFocused: true, zIndex: state.highestZIndex + 1 }
            : { ...w, isFocused: false }
        ),
      }));
      return;
    }

    const offset = windows.length * 24;
    const size = DEFAULT_SIZES[appType];
    const newZIndex = highestZIndex + 1;

    const centerX = Math.max(20, (window?.innerWidth ?? 800) / 2 - size.width / 2 + offset);
    const centerY = Math.max(20, (window?.innerHeight ?? 600) / 2 - size.height / 2 + offset - 40);

    const newWindow: WindowState = {
      id: `${appType}-${Date.now()}`,
      appType,
      title,
      icon,
      isOpen: true,
      isMinimized: false,
      isFocused: true,
      position: { x: Math.min(centerX, (window?.innerWidth ?? 800) - 100), y: Math.min(centerY, (window?.innerHeight ?? 600) - 100) },
      size,
      zIndex: newZIndex,
    };

    set((state) => ({
      highestZIndex: newZIndex,
      windows: [
        ...state.windows.map((w) => ({ ...w, isFocused: false })),
        newWindow,
      ],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      highestZIndex: state.highestZIndex + 1,
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, isFocused: true, zIndex: state.highestZIndex + 1 }
          : { ...w, isFocused: false }
      ),
    }));
  },

  focusWindow: (id) => {
    set((state) => ({
      highestZIndex: state.highestZIndex + 1,
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isFocused: true, zIndex: state.highestZIndex + 1 }
          : { ...w, isFocused: false }
      ),
    }));
  },

  updatePosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
  },

  updateSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  },
}));
