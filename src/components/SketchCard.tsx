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

    // List view layout
    if (viewMode === "list") {
        return (
            <Link
                href={isLocked ? "#" : `/canvas/${sketch.id}`}
                onClick={handleLinkClick}
                className={`group flex items-center gap-4 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all ${isLocked ? "cursor-not-allowed opacity-75" : ""
                    }`}
            >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white shrink-0">
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
                            className="object-contain p-2"
                        />
                    )}

                    {/* Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                    )}

                    {/* Status indicator */}
                    {status === "completed" && (
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === "in-progress" && (
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-headline font-bold text-sm sm:text-base truncate">
                            {sketch.title}
                        </h3>
                        <button
                            onClick={handleFavoriteClick}
                            className={`shrink-0 p-1.5 rounded-full transition-all ${isFavorited
                                    ? "text-red-500"
                                    : "text-on-surface-variant/50 hover:text-red-500"
                                }`}
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-xs mb-2">
                        <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColors[sketch.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
                            }`}>
                            {sketch.difficulty}
                        </span>
                        <span className="text-on-surface-variant flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sketch.estimatedMinutes} min
                        </span>
                        {sketch.isNew && status === "not-started" && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Progress bar for in-progress */}
                    {status === "in-progress" && progress && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden max-w-32">
                                <div
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${Math.min(100, Object.keys(progress.fills).length * 5)}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                                {Object.keys(progress.fills).length} filled
                            </span>
                        </div>
                    )}

                    {/* Tags */}
                    {sketch.tags && sketch.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            {sketch.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-[10px] text-on-surface-variant/70"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="shrink-0 hidden sm:block">
                    <Button
                        variant={status === "completed" ? "secondary" : "primary"}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                    >
                        {buttonText}
                    </Button>
                </div>
            </Link>
        );
    }

    // Grid view layout
    return (
        <Card
            variant="elevated"
            padding="none"
            className="overflow-hidden transition-transform"
        >
            <Link
                href={isLocked ? "#" : `/canvas/${sketch.id}`}
                onClick={handleLinkClick}
                className={`block hover:scale-[1.01] transition-transform ${isLocked ? "cursor-not-allowed" : ""
                    }`}
            >
                {/* Thumbnail */}
                <div
                    className="relative bg-surface-container-low flex items-center justify-center aspect-square"
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
                        className={`absolute top-1 sm:top-2 left-1 sm:left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${isFavorited
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
                <div className="p-3 sm:p-4">
                    <div>
                        <h3 className="font-headline font-bold mb-1 text-sm sm:text-base truncate w-full">
                            {sketch.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 flex-wrap">
                            {/* Difficulty Badge */}
                            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColors[sketch.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
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
                        className={`w-full text-xs sm:text-sm ${isLocked ? "opacity-70" : ""}`}
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
                    : "grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-8"
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
