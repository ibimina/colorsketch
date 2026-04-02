import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkAchievements, type Achievement } from "@/lib/achievements";

interface ProgressStore {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  streak: number;
  lastActiveDate: string;
  totalSketches: number;
  achievements: string[];
  addXP: (amount: number) => void;
  checkStreak: () => void;
  unlockAchievement: (id: string) => void;
  checkAndUnlockAchievements: () => Achievement[];
  incrementSketches: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXPEarned: 0,
      streak: 0,
      lastActiveDate: new Date().toDateString(),
      totalSketches: 0,
      achievements: [],

      addXP: (amount) => {
        const { xp, level, xpToNextLevel, totalXPEarned } = get();
        const newXP = xp + amount;
        const newTotalXP = totalXPEarned + amount;

        if (newXP >= xpToNextLevel) {
          set({
            level: level + 1,
            xp: newXP - xpToNextLevel,
            xpToNextLevel: Math.floor(xpToNextLevel * 1.5),
            totalXPEarned: newTotalXP,
          });
        } else {
          set({ xp: newXP, totalXPEarned: newTotalXP });
        }

        // Auto-check achievements after XP gain
        get().checkAndUnlockAchievements();
      },

      checkStreak: () => {
        const today = new Date().toDateString();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const newStreak = lastActiveDate === yesterday ? streak + 1 : 1;
          set({ streak: newStreak, lastActiveDate: today });

          // Auto-check achievements after streak update
          get().checkAndUnlockAchievements();
        }
      },

      unlockAchievement: (id) => {
        const { achievements } = get();
        if (!achievements.includes(id)) {
          set((state) => ({
            achievements: [...state.achievements, id],
          }));
        }
      },

      checkAndUnlockAchievements: () => {
        const { level, totalXPEarned, streak, totalSketches, achievements } =
          get();
        const newlyUnlocked = checkAchievements(
          level,
          totalXPEarned,
          streak,
          totalSketches,
          achievements,
        );

        newlyUnlocked.forEach((achievement) => {
          get().unlockAchievement(achievement.id);
        });

        return newlyUnlocked;
      },

      incrementSketches: () => {
        set((state) => ({
          totalSketches: state.totalSketches + 1,
        }));

        // Auto-check achievements after sketch count update
        get().checkAndUnlockAchievements();
      },
    }),
    { name: "colorsketch-progress" },
  ),
);
