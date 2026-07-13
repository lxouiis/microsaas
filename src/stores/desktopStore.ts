import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DesktopStore {
  soundEnabled: boolean;
  starEarned: boolean;
  gachaUsed: boolean;
  openedCapsules: number[];
  toggleSound: () => void;
  earnStar: () => void;
  openCapsule: (index: number) => void;
  resetGacha: () => void;
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      starEarned: false,
      gachaUsed: false,
      openedCapsules: [],

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      earnStar: () => set({ starEarned: true }),
      openCapsule: (index) =>
        set((state) => ({
          openedCapsules: [...state.openedCapsules, index],
          gachaUsed: true,
        })),
      resetGacha: () => set({ openedCapsules: [], gachaUsed: false }),
    }),
    {
      name: 'desktop-dear-state',
    }
  )
);
