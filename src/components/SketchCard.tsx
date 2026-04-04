"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Lock, Clock } from "lucide-react";
import { Card, Button, ColoredSketchPreview } from "@/components/ui";
import { Sketch } from "@/types";
import { SketchProgressData } from "@/hooks/useSketchProgress";
import { notify } from "@/stores/notificationsStore";
import {
    getSketchUnlockLevel,
    getProgressStatus,
    hasSketchProgress,
    isSketchLocked,
    getButtonText,
    ProgressStatus,
} from "@/lib/sketch-utils";

// Difficulty color mapping
const difficultyColors = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
} as const;

// ============================================
// Types
// ============================================

export interface SketchCardProps {
    sketch: Sketch;
    progressMap: Record<string, SketchProgressData>;
    userLevel: number;
    isFavorited: boolean;
    onFavoriteToggle: (sketchId: string, sketchTitle: string) => void;
    viewMode?: "grid" | "list";
    /** Show NEW badge only if not started */
    showNewBadge?: boolean;
}

// ============================================
// Component
// ============================================

export function SketchCard({
    sketch,
    progressMap,
    userLevel,
    isFavorited,
    onFavoriteToggle,
    viewMode = "grid",
    showNewBadge = true,
}: SketchCardProps) {
    const progress = progressMap[sketch.id];
    const status = getProgressStatus(sketch.id, progressMap);
    const hasProgress = hasSketchProgress(sketch.id, progressMap);
    const isLocked = isSketchLocked(sketch, userLevel);
    const buttonText = getButtonText(sketch, isLocked, progressMap);
    const unlockLevel = getSketchUnlockLevel(sketch);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onFavoriteToggle(sketch.id, sketch.title);
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        if (isLocked) {
            e.preventDefault();
            notify.info("Premium Sketch", `Reach Level ${unlockLevel} to unlock this sketch!`);
        }
    };

    return (
        <Card
            variant="elevated"
            padding="none"
            className={`overflow-hidden transition-transform ${
                viewMode === "list" ? "flex flex-row border-b border-surface-container-high last:border-b-0" : ""
            }`}
        >
            <Link
                href={isLocked ? "#" : `/canvas/${sketch.id}`}
                onClick={handleLinkClick}
                className={`${
                    viewMode === "list" ? "flex w-full min-w-0" : "block"
                } hover:scale-[1.01] transition-transform ${
                    isLocked ? "cursor-not-allowed" : ""
                }`}
            >
                {/* Thumbnail */}
                <div
                    className={`relative bg-surface-container-low flex items-center justify-center ${
                        viewMode === "list" ? "w-28 sm:w-40 h-28 sm:h-32 shrink-0" : "aspect-square"
                    }`}
                >
                    {hasProgress && progress ? (
                        <ColoredSketchPreview
                            sketchPath={sketch.thumbnail}
                            fills={progress.fills}
                            className="absolute inset-0"
                        />
                    ) : (
                        <Image
                            src={sketch.thumbnail}
                            alt={sketch.title}
                            fill
                            className="object-contain p-4"
                        />
                    )}

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-1 sm:top-2 left-1 sm:left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                            isFavorited
                                ? "bg-red-500 text-white shadow-lg"
                                : "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 hover:bg-white shadow-md"
                        }`}
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                    </button>

                    {/* Lock Overlay for Premium Sketches */}
                    {isLocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                            <div className="text-center text-white">
                                <Lock className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs font-medium">Level {unlockLevel}</p>
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    <SketchBadges
                        sketch={sketch}
                        status={status}
                        showNewBadge={showNewBadge}
                    />
                </div>

                {/* Info */}
                <div
                    className={`p-3 sm:p-4 ${
                        viewMode === "list"
                            ? "flex-1 flex flex-col justify-between min-w-0 overflow-hidden"
                            : ""
                    }`}
                >
                    <div>
                        <h3 className="font-headline font-bold mb-1 text-sm sm:text-base truncate w-full">
                            {sketch.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 flex-wrap">
                            {/* Difficulty Badge */}
                            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                                difficultyColors[sketch.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
                            }`}>
                                {sketch.difficulty}
                            </span>
                            {status === "completed" ? (
                                <span className="text-green-600 font-medium">Completed ✓</span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    ~{sketch.estimatedMinutes} min
                                </span>
                            )}
                        </div>

                        {/* Progress Bar (list view, in-progress only) */}
                        {viewMode === "list" && status === "in-progress" && progress && (
                            <div className="mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, Object.keys(progress.fills).length * 5)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-on-surface-variant font-medium">
                                        {Object.keys(progress.fills).length} regions
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Tags (list view only) */}
                        {viewMode === "list" && sketch.tags && (
                            <div className="flex gap-1 mb-2 flex-wrap overflow-hidden">
                                {sketch.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant shrink-0"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        variant={
                            isLocked
                                ? "secondary"
                                : status === "completed"
                                ? "secondary"
                                : "primary"
                        }
                        size="sm"
                        className={`${
                            viewMode === "list" ? "w-auto self-start" : "w-full"
                        } text-xs sm:text-sm ${isLocked ? "opacity-70" : ""}`}
                    >
                        {buttonText}
                    </Button>
                </div>
            </Link>
        </Card>
    );
}

// ============================================
// Sub-components
// ============================================

interface SketchBadgesProps {
    sketch: Sketch;
    status: ProgressStatus;
    showNewBadge: boolean;
}

function SketchBadges({ sketch, status, showNewBadge }: SketchBadgesProps) {
    return (
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 flex-wrap justify-end max-w-[calc(100%-2rem)]">
            {status === "in-progress" && (
                <span className="bg-yellow-500 text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    In Progress
                </span>
            )}
            {showNewBadge && status === "not-started" && sketch.isNew && (
                <span className="bg-primary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    NEW
                </span>
            )}
            {sketch.isFeatured && (
                <span className="bg-secondary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    ⭐
                </span>
            )}
            {sketch.isEditorChoice && (
                <span className="bg-tertiary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    👑
                </span>
            )}
        </div>
    );
}

// ============================================
// Grid Component (for convenience)
// ============================================

export interface SketchGridProps {
    sketches: Sketch[];
    progressMap: Record<string, SketchProgressData>;
    userLevel: number;
    favorites: string[];
    onFavoriteToggle: (sketchId: string, sketchTitle: string) => void;
    viewMode?: "grid" | "list";
}

export function SketchGrid({
    sketches,
    progressMap,
    userLevel,
    favorites,
    onFavoriteToggle,
    viewMode = "grid",
}: SketchGridProps) {
    return (
        <div
            className={
                viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    : "flex flex-col gap-3"
            }
        >
            {sketches.map((sketch) => (
                <SketchCard
                    key={sketch.id}
                    sketch={sketch}
                    progressMap={progressMap}
                    userLevel={userLevel}
                    isFavorited={favorites.includes(sketch.id)}
                    onFavoriteToggle={onFavoriteToggle}
                    viewMode={viewMode}
                />
            ))}
        </div>
    );
}
