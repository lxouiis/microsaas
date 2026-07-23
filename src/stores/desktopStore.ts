import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DesktopStore {
  soundEnabled: boolean;
  starEarned: boolean;
  gachaUsed: boolean;
  openedCapsules: number[];
  credits: number;
  notification: string | null;
  isAppPlayingMedia: boolean;
  toggleSound: () => void;
  earnStar: () => void;
  openCapsule: (index: number) => void;
  resetGacha: () => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  showNotification: (msg: string) => void;
  hideNotification: () => void;
  setAppPlayingMedia: (playing: boolean) => void;
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      starEarned: false,
      gachaUsed: false,
      openedCapsules: [],
      credits: 200000,
      notification: null,
      isAppPlayingMedia: false,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      earnStar: () => set((state) => ({ starEarned: true, credits: state.credits + 200 })), // Earn 200 credits when catching stars
      openCapsule: (index) =>
          set((state) => ({
            openedCapsules: [...state.openedCapsules, index],
            gachaUsed: true,
          })),
      resetGacha: () => set({ openedCapsules: [], gachaUsed: false, credits: 200000, notification: null }),
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
      showNotification: (msg) => set({ notification: msg }),
      hideNotification: () => set({ notification: null }),
      setAppPlayingMedia: (playing) => set({ isAppPlayingMedia: playing }),
    }),
    {
      name: 'desktop-dear-state',
    }
  )
);
