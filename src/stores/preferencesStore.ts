import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesStore {
  autoSave: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  displayMode: "kids" | "adult";
  setAutoSave: (value: boolean) => void;
  setSoundEffects: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setDisplayMode: (mode: "kids" | "adult") => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      autoSave: true,
      soundEffects: false,
      hapticFeedback: true,
      displayMode: "adult",
      setAutoSave: (value) => set({ autoSave: value }),
      setSoundEffects: (value) => set({ soundEffects: value }),
      setHapticFeedback: (value) => set({ hapticFeedback: value }),
      setDisplayMode: (mode) => set({ displayMode: mode }),
    }),
    { name: "colorsketch-preferences" },
  ),
);
