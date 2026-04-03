import { create } from "zustand";

interface LevelUpCelebration {
  isOpen: boolean;
  newLevel: number;
  confettiTrigger: number;
}

interface LevelUpStore extends LevelUpCelebration {
  triggerLevelUp: (newLevel: number) => void;
  closeCelebration: () => void;
}

export const useLevelUpStore = create<LevelUpStore>((set, get) => ({
  isOpen: false,
  newLevel: 1,
  confettiTrigger: 0,

  triggerLevelUp: (newLevel: number) => {
    set({
      isOpen: true,
      newLevel,
      confettiTrigger: get().confettiTrigger + 1,
    });
  },

  closeCelebration: () => {
    set({ isOpen: false });
  },
}));
