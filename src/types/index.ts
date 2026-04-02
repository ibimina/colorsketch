// ============================================
// Sketch Types
// ============================================

export type Category =
  | "animals"
  | "botanical"
  | "fantasy"
  | "geometric"
  | "mandalas"
  | "landscape"
  | "zentangle"
  | "fashion"
  | "abstract"
  | "people";

export type Difficulty = "easy" | "medium" | "hard";

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  tier: "free" | "pro";
}

export interface Sketch {
  id: string;
  title: string;
  description?: string;
  category: Category;
  difficulty: Difficulty;
  estimatedMinutes: number;
  thumbnail: string;
  svgContent: string;
  regions: string[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isEditorChoice?: boolean;
  artist?: Artist;
  createdAt: Date;
  remixCount?: number;
}

// ============================================
// Coloring Types
// ============================================

export interface FillState {
  [regionId: string]: string; // hex color
}

export interface ColoringSession {
  sketchId: string;
  fills: FillState;
  history: FillState[];
  redoStack: FillState[];
  brushSize: number;
  mode: "fill" | "draw";
  completedAt?: Date;
  savedAt?: Date;
}

export interface UserArtwork {
  id: string;
  sketchId: string;
  userId: string;
  fills: FillState;
  thumbnailUri: string;
  completedAt?: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: "free" | "pro";
  createdAt: Date;
}

// ============================================
// Color Palette
// ============================================

export interface ColorSwatch {
  id: string;
  hex: string;
  name: string;
}

export const DEFAULT_PALETTE: ColorSwatch[] = [
  // Reds & Pinks
  { id: "1", hex: "#b41924", name: "Primary Red" },
  { id: "2", hex: "#ff7671", name: "Coral" },
  { id: "3", hex: "#ff5a58", name: "Salmon" },
  { id: "4", hex: "#e91e63", name: "Pink" },
  { id: "5", hex: "#ff9800", name: "Orange" },

  // Yellows & Greens
  { id: "6", hex: "#ffd740", name: "Gold" },
  { id: "7", hex: "#f0c931", name: "Mustard" },
  { id: "8", hex: "#8bc34a", name: "Light Green" },
  { id: "9", hex: "#4caf50", name: "Green" },
  { id: "10", hex: "#009688", name: "Teal Green" },

  // Blues
  { id: "11", hex: "#006386", name: "Teal" },
  { id: "12", hex: "#005675", name: "Deep Teal" },
  { id: "13", hex: "#9adaff", name: "Sky Blue" },
  { id: "14", hex: "#71ceff", name: "Light Blue" },
  { id: "15", hex: "#2196f3", name: "Blue" },
  { id: "16", hex: "#3f51b5", name: "Indigo" },

  // Purples
  { id: "17", hex: "#9c27b0", name: "Purple" },
  { id: "18", hex: "#673ab7", name: "Deep Purple" },

  // Browns & Neutrals
  { id: "19", hex: "#795548", name: "Brown" },
  { id: "20", hex: "#6e5a00", name: "Olive" },
  { id: "21", hex: "#9e9e9e", name: "Gray" },
  { id: "22", hex: "#607d8b", name: "Blue Gray" },
  { id: "23", hex: "#2c2f30", name: "Charcoal" },
  { id: "24", hex: "#000000", name: "Black" },
  { id: "25", hex: "#ffffff", name: "White" },
];
