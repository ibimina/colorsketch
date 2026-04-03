import { Sketch } from "@/types";
import { SketchProgressData } from "@/hooks/useSketchProgress";

// ============================================
// Constants
// ============================================

/**
 * Base unlock levels for premium sketches
 * - Featured (⭐): Level 3
 * - Editor's Choice (👑): Level 5  
 * - Both (⭐👑): Level 8
 */
export const UNLOCK_LEVELS = {
    FEATURED: 3,
    EDITOR_CHOICE: 5,
    BOTH: 8,
} as const;

/** @deprecated Use getSketchUnlockLevel() instead */
export const PREMIUM_UNLOCK_LEVEL = 5;

// ============================================
// Progress Status
// ============================================

export type ProgressStatus = "not-started" | "in-progress" | "completed";

/**
 * Get the progress status for a sketch
 */
export function getProgressStatus(
    sketchId: string,
    progressMap: Record<string, SketchProgressData>
): ProgressStatus {
    const progress = progressMap[sketchId];
    if (!progress) return "not-started";
    if (progress.completed_at) return "completed";
    const fillCount = Object.keys(progress.fills || {}).filter(k => k !== "background").length;
    return fillCount > 0 ? "in-progress" : "not-started";
}

/**
 * Check if a sketch has any progress (fills applied)
 */
export function hasSketchProgress(
    sketchId: string,
    progressMap: Record<string, SketchProgressData>
): boolean {
    const progress = progressMap[sketchId];
    return progress ? Object.keys(progress.fills || {}).length > 0 : false;
}

// ============================================
// Premium/Lock Status
// ============================================

/**
 * Check if a sketch is premium (Featured or Editor's Choice)
 */
export function isPremiumSketch(sketch: Sketch): boolean {
    return Boolean(sketch.isFeatured || sketch.isEditorChoice);
}

/**
 * Get the unlock level required for a sketch
 * Returns 0 for non-premium sketches (always unlocked)
 */
export function getSketchUnlockLevel(sketch: Sketch): number {
    // If sketch has explicit unlock level, use it
    if (sketch.unlockLevel !== undefined) {
        return sketch.unlockLevel;
    }
    
    // Calculate based on premium status
    const isFeatured = Boolean(sketch.isFeatured);
    const isEditorChoice = Boolean(sketch.isEditorChoice);
    
    if (isFeatured && isEditorChoice) {
        return UNLOCK_LEVELS.BOTH; // Level 8
    } else if (isEditorChoice) {
        return UNLOCK_LEVELS.EDITOR_CHOICE; // Level 5
    } else if (isFeatured) {
        return UNLOCK_LEVELS.FEATURED; // Level 3
    }
    
    return 0; // Not premium, always unlocked
}

/**
 * Check if a sketch is locked for a user based on their level
 */
export function isSketchLocked(sketch: Sketch, userLevel: number): boolean {
    const requiredLevel = getSketchUnlockLevel(sketch);
    return requiredLevel > 0 && userLevel < requiredLevel;
}

// ============================================
// Button Text
// ============================================

/**
 * Get appropriate button text based on sketch status
 */
export function getButtonText(
    sketch: Sketch,
    isLocked: boolean,
    progressMap: Record<string, SketchProgressData>
): string {
    if (isLocked) {
        const unlockLevel = getSketchUnlockLevel(sketch);
        return `🔒 Unlock at Level ${unlockLevel}`;
    }
    
    const status = getProgressStatus(sketch.id, progressMap);
    switch (status) {
        case "completed":
            return "View Artwork";
        case "in-progress":
            return "Continue";
        default:
            return "Start Coloring";
    }
}

// ============================================
// Sorting
// ============================================

export type SortOption = "popularity" | "newest" | "difficulty";

const difficultyOrder: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
};

/**
 * Sort sketches by the given sort option
 */
export function sortSketches(sketches: Sketch[], sortBy: SortOption): Sketch[] {
    const sorted = [...sketches];
    
    switch (sortBy) {
        case "newest":
            return sorted.sort((a, b) => {
                if (a.isNew && !b.isNew) return -1;
                if (!a.isNew && b.isNew) return 1;
                return 0;
            });
        case "difficulty":
            return sorted.sort((a, b) => 
                difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
        case "popularity":
        default:
            // Featured first, then editor's choice, then rest
            return sorted.sort((a, b) => {
                const aScore = (a.isFeatured ? 2 : 0) + (a.isEditorChoice ? 1 : 0);
                const bScore = (b.isFeatured ? 2 : 0) + (b.isEditorChoice ? 1 : 0);
                return bScore - aScore;
            });
    }
}
