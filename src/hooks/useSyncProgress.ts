"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useProgressStore } from "@/stores/progressStore";
import { createClient } from "@/lib/supabase/client";

// Helper to get local date in ISO format (YYYY-MM-DD)
const getLocalISODate = () => {
  const date = new Date();
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
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
      return parsed.getFullYear() + '-' + 
        String(parsed.getMonth() + 1).padStart(2, '0') + '-' + 
        String(parsed.getDate()).padStart(2, '0');
    }
  } catch {
    // Fall through to default
  }
  // Fallback to today
  return getLocalISODate();
};

// Inline debounce hook to avoid import issues
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to sync progress store with Supabase
 * - Loads data from Supabase on mount (if logged in)
 * - Syncs changes to Supabase with debouncing
 * - Falls back to localStorage when offline/logged out
 */
export function useSyncProgress() {
  const hasLoadedRef = useRef(false);
  const isSyncingRef = useRef(false);

  const {
    level,
    xp,
    xpToNextLevel,
    totalXPEarned,
    streak,
    lastActiveDate,
    totalSketches,
  } = useProgressStore();

  // Create a serializable state object
  const progressData = {
    level,
    xp,
    xpToNextLevel,
    totalXPEarned,
    streak,
    lastActiveDate,
    totalSketches,
  };

  // Debounce the progress data to avoid too many syncs
  const debouncedProgress = useDebounce(progressData, 2000);

  // Load progress from Supabase on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;

    async function loadFromSupabase() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        hasLoadedRef.current = true;
        return;
      }

      try {
        // Load progress
        const { data: progress } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (progress) {
          // Merge with local - take higher values for progress
          const store = useProgressStore.getState();
          const shouldUpdate =
            progress.total_xp_earned > store.totalXPEarned ||
            progress.level > store.level;

          // Migrate server date to ISO format if needed
          const serverDate = progress.last_active_date || '';
          const migratedDate = migrateToISODate(serverDate);
          const needsDateMigration = serverDate !== migratedDate;

          if (shouldUpdate) {
            useProgressStore.setState({
              level: Math.max(progress.level, store.level),
              xp: progress.level > store.level ? progress.xp : store.xp,
              xpToNextLevel:
                progress.level > store.level
                  ? progress.xp_to_next_level
                  : store.xpToNextLevel,
              totalXPEarned: Math.max(
                progress.total_xp_earned,
                store.totalXPEarned,
              ),
              streak: Math.max(progress.streak, store.streak),
              totalSketches: Math.max(
                progress.total_sketches,
                store.totalSketches,
              ),
              lastActiveDate: migratedDate || store.lastActiveDate,
            });
          }

          // Force sync if date format needs migration in database
          if (needsDateMigration) {
            const currentStore = useProgressStore.getState();
            await supabase.from("user_progress").upsert(
              {
                user_id: user.id,
                level: currentStore.level,
                xp: currentStore.xp,
                xp_to_next_level: currentStore.xpToNextLevel,
                total_xp_earned: currentStore.totalXPEarned,
                streak: currentStore.streak,
                last_active_date: migratedDate,
                total_sketches: currentStore.totalSketches,
              },
              { onConflict: "user_id" }
            );
          }
        }

        // Load achievements
        const { data: serverAchievements } = await supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", user.id);

        if (serverAchievements && serverAchievements.length > 0) {
          const serverIds = serverAchievements.map((a) => a.achievement_id);
          const localIds = useProgressStore.getState().achievements;
          const merged = [...new Set([...localIds, ...serverIds])];

          useProgressStore.setState({ achievements: merged });
        }
      } catch (error) {
        console.error("Failed to load progress from Supabase:", error);
      }

      hasLoadedRef.current = true;
    }

    loadFromSupabase();
  }, []);

  // Sync progress to Supabase when it changes
  useEffect(() => {
    if (!hasLoadedRef.current || isSyncingRef.current) return;

    async function syncToSupabase() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      isSyncingRef.current = true;

      try {
        await supabase.from("user_progress").upsert(
          {
            user_id: user.id,
            level: debouncedProgress.level,
            xp: debouncedProgress.xp,
            xp_to_next_level: debouncedProgress.xpToNextLevel,
            total_xp_earned: debouncedProgress.totalXPEarned,
            streak: debouncedProgress.streak,
            last_active_date: debouncedProgress.lastActiveDate,
            total_sketches: debouncedProgress.totalSketches,
          },
          {
            onConflict: "user_id",
          },
        );
      } catch (error) {
        console.error("Failed to sync progress to Supabase:", error);
      }

      isSyncingRef.current = false;
    }

    syncToSupabase();
  }, [debouncedProgress]);

  // Sync new achievements immediately
  const syncAchievements = useCallback(async (newAchievementIds: string[]) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || newAchievementIds.length === 0) return;

    try {
      await supabase.from("user_achievements").upsert(
        newAchievementIds.map((id) => ({
          user_id: user.id,
          achievement_id: id,
        })),
        { onConflict: "user_id,achievement_id", ignoreDuplicates: true },
      );
    } catch (error) {
      console.error("Failed to sync achievements:", error);
    }
  }, []);

  // Watch for new achievements
  useEffect(() => {
    const unsubscribe = useProgressStore.subscribe((state, prevState) => {
      const newAchievements = state.achievements.filter(
        (id) => !prevState.achievements.includes(id),
      );
      if (newAchievements.length > 0) {
        syncAchievements(newAchievements);
      }
    });

    return unsubscribe;
  }, [syncAchievements]);
}
