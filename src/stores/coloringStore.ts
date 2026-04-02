import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FillState, DEFAULT_PALETTE } from "@/types";

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

  // Actions
  setActiveSketch: (sketchId: string, initialFills?: FillState) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setMode: (mode: "fill" | "draw") => void;
  setZoom: (zoom: number) => void;
  fillRegion: (regionId: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  clearSession: () => void;
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

      // Actions
      setActiveSketch: (sketchId, initialFills = {}) => {
        set({
          activeSketchId: sketchId,
          fills: initialFills,
          history: [],
          redoStack: [],
        });
      },

      setColor: (color) => set({ selectedColor: color }),
      setBrushSize: (size) => set({ brushSize: size }),
      setMode: (mode) => set({ mode }),
      setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(25, zoom)) }),

      fillRegion: (regionId) => {
        const { fills, selectedColor, history } = get();
        const newFills = { ...fills, [regionId]: selectedColor };
        set({
          fills: newFills,
          history: [...history, fills], // Save current state to history
          redoStack: [], // Clear redo stack on new action
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
        const { fills, history } = get();
        if (Object.keys(fills).length === 0) return;

        set({
          fills: {},
          history: [...history, fills],
          redoStack: [],
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
    }),
    {
      name: "colorsketch-coloring",
      partialize: (state) => ({
        activeSketchId: state.activeSketchId,
        fills: state.fills,
        selectedColor: state.selectedColor,
      }),
    },
  ),
);
