import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkAchievements, type Achievement } from "@/lib/achievements";
import { useLevelUpStore } from "./levelUpStore";
import { playSound } from "@/lib/feedback";

// Helper to get local date in ISO format (YYYY-MM-DD)
const getLocalISODate = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};

// Helper to convert old date formats to ISO format
const migrateToISODate = (dateStr: string): string => {
  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Try to parse old format like "Thu Apr 03 2026"
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return (
        parsed.getFullYear() +
        "-" +
        String(parsed.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(parsed.getDate()).padStart(2, "0")
      );
    }
  } catch {
    // Fall through to default
  }
  // Fallback to today
  return getLocalISODate();
};

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
      lastActiveDate: getLocalISODate(),
      totalSketches: 0,
      achievements: [],

      addXP: (amount) => {
        const { xp, level, xpToNextLevel, totalXPEarned } = get();
        const newXP = xp + amount;
        const newTotalXP = totalXPEarned + amount;

        if (newXP >= xpToNextLevel) {
          const newLevel = level + 1;
          set({
            level: newLevel,
            xp: newXP - xpToNextLevel,
            xpToNextLevel: Math.floor(xpToNextLevel * 1.5),
            totalXPEarned: newTotalXP,
          });

          // Trigger level-up celebration!
          playSound("level-up");
          useLevelUpStore.getState().triggerLevelUp(newLevel);
        } else {
          set({ xp: newXP, totalXPEarned: newTotalXP });
        }

        // Auto-check achievements after XP gain
        get().checkAndUnlockAchievements();
      },

      checkStreak: () => {
        const today = getLocalISODate();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate !== today) {
          // Get yesterday's date in ISO format
          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterday =
            yesterdayDate.getFullYear() +
            "-" +
            String(yesterdayDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(yesterdayDate.getDate()).padStart(2, "0");
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
    {
      name: "colorsketch-progress",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0 || !version) {
          // Migrate lastActiveDate to ISO format
          if (
            state.lastActiveDate &&
            typeof state.lastActiveDate === "string"
          ) {
            state.lastActiveDate = migrateToISODate(state.lastActiveDate);
          }
        }
        return state as unknown as ProgressStore;
      },
    },
  ),
);
