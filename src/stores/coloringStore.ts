import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FillState, DEFAULT_PALETTE } from "@/types";

interface SketchProgress {
  fills: FillState;
  lastModified: number;
  totalRegions?: number;
}

interface ColoringStore {
  // State
  activeSketchId: string | null;
  fills: FillState;
  history: FillState[];
  redoStack: FillState[];
  selectedColor: string;
  brushSize: number;
  mode: "fill" | "draw";
  zoom: number;

  // Multi-sketch progress tracking
  savedProgress: Record<string, SketchProgress>;

  // Actions
  setActiveSketch: (
    sketchId: string,
    initialFills?: FillState,
    totalRegions?: number,
  ) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setMode: (mode: "fill" | "draw") => void;
  setZoom: (zoom: number) => void;
  fillRegion: (regionId: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  clearSession: () => void;

  // Multi-sketch helpers
  getInProgressSketches: () => Array<{
    sketchId: string;
    progress: SketchProgress;
  }>;
  saveCurrentProgress: (totalRegions?: number) => void;
  loadSketchProgress: (sketchId: string) => FillState | null;
  clearSketchProgress: (sketchId: string) => void;
}

export const useColoringStore = create<ColoringStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeSketchId: null,
      fills: {},
      history: [],
      redoStack: [],
      selectedColor: DEFAULT_PALETTE[0].hex,
      brushSize: 12,
      mode: "fill",
      zoom: 100,
      savedProgress: {},

      // Actions
      setActiveSketch: (sketchId, initialFills, totalRegions) => {
        const { savedProgress, activeSketchId, fills } = get();

        // Save current sketch progress before switching (if there was an active sketch with fills)
        if (activeSketchId && Object.keys(fills).length > 0) {
          const existingProgress = savedProgress[activeSketchId];
          set({
            savedProgress: {
              ...savedProgress,
              [activeSketchId]: {
                fills,
                lastModified: Date.now(),
                totalRegions: existingProgress?.totalRegions,
              },
            },
          });
        }

        // Load saved progress for new sketch, or use initialFills
        const existingSketchProgress = savedProgress[sketchId];
        const fillsToUse = existingSketchProgress?.fills || initialFills || {};

        set({
          activeSketchId: sketchId,
          fills: fillsToUse,
          history: [],
          redoStack: [],
          savedProgress: {
            ...get().savedProgress,
            [sketchId]: {
              fills: fillsToUse,
              lastModified: Date.now(),
              totalRegions:
                totalRegions || existingSketchProgress?.totalRegions,
            },
          },
        });
      },

      setColor: (color) => set({ selectedColor: color }),
      setBrushSize: (size) => set({ brushSize: size }),
      setMode: (mode) => set({ mode }),
      setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(25, zoom)) }),

      fillRegion: (regionId) => {
        const { fills, selectedColor, history, activeSketchId, savedProgress } =
          get();
        const newFills = { ...fills, [regionId]: selectedColor };

        // Update savedProgress for the active sketch
        const updatedSavedProgress = activeSketchId
          ? {
              ...savedProgress,
              [activeSketchId]: {
                ...savedProgress[activeSketchId],
                fills: newFills,
                lastModified: Date.now(),
              },
            }
          : savedProgress;

        set({
          fills: newFills,
          history: [...history, fills], // Save current state to history
          redoStack: [], // Clear redo stack on new action
          savedProgress: updatedSavedProgress,
        });
      },

      undo: () => {
        const { fills, history, redoStack } = get();
        if (history.length === 0) return;

        const previousState = history[history.length - 1];
        set({
          fills: previousState,
          history: history.slice(0, -1),
          redoStack: [...redoStack, fills],
        });
      },

      redo: () => {
        const { fills, history, redoStack } = get();
        if (redoStack.length === 0) return;

        const nextState = redoStack[redoStack.length - 1];
        set({
          fills: nextState,
          history: [...history, fills],
          redoStack: redoStack.slice(0, -1),
        });
      },

      reset: () => {
        const { fills, history, activeSketchId, savedProgress } = get();
        if (Object.keys(fills).length === 0) return;

        // Also clear from savedProgress
        const updatedSavedProgress = activeSketchId
          ? {
              ...savedProgress,
              [activeSketchId]: {
                ...savedProgress[activeSketchId],
                fills: {},
                lastModified: Date.now(),
              },
            }
          : savedProgress;

        set({
          fills: {},
          history: [...history, fills],
          redoStack: [],
          savedProgress: updatedSavedProgress,
        });
      },

      clearSession: () => {
        set({
          activeSketchId: null,
          fills: {},
          history: [],
          redoStack: [],
        });
      },

      // Multi-sketch helpers
      getInProgressSketches: () => {
        const { savedProgress } = get();
        return Object.entries(savedProgress)
          .filter(([, progress]) => Object.keys(progress.fills).length > 0)
          .map(([sketchId, progress]) => ({ sketchId, progress }))
          .sort((a, b) => b.progress.lastModified - a.progress.lastModified);
      },

      saveCurrentProgress: (totalRegions) => {
        const { activeSketchId, fills, savedProgress } = get();
        if (!activeSketchId) return;

        set({
          savedProgress: {
            ...savedProgress,
            [activeSketchId]: {
              fills,
              lastModified: Date.now(),
              totalRegions:
                totalRegions || savedProgress[activeSketchId]?.totalRegions,
            },
          },
        });
      },

      loadSketchProgress: (sketchId) => {
        const { savedProgress } = get();
        return savedProgress[sketchId]?.fills || null;
      },

      clearSketchProgress: (sketchId) => {
        const { savedProgress } = get();
        const { [sketchId]: _, ...rest } = savedProgress;
        set({ savedProgress: rest });
      },
    }),
    {
      name: "colorsketch-coloring",
      partialize: (state) => ({
        activeSketchId: state.activeSketchId,
        fills: state.fills,
        selectedColor: state.selectedColor,
        savedProgress: state.savedProgress,
      }),
    },
  ),
);
