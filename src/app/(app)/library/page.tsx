"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { Category } from "@/types";
import { Icons } from "@/lib/icons";
import { useSketchProgress } from "@/hooks";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { notify } from "@/stores/notificationsStore";

// Shared data and utilities
import { sketches, categories } from "@/data/sketches";
import { sortSketches, SortOption } from "@/lib/sketch-utils";
import { SketchGrid } from "@/components/SketchCard";

// ============================================
// Main Page Component
// ============================================

export default function LibraryPage() {
    return (
        <Suspense fallback={<LibraryLoadingSkeleton />}>
            <LibraryContent />
        </Suspense>
    );
}

// ============================================
// Loading Skeleton
// ============================================

function LibraryLoadingSkeleton() {
    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Sketch Library</h1>
                <p className="text-on-surface-variant mt-1">Loading sketches...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className="bg-surface-container rounded-2xl aspect-square animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================
// Library Content
// ============================================

function LibraryContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category") as Category | null;

    // State
    const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
    const [sortBy, setSortBy] = useState<SortOption>("popularity");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Hooks
    const { progressMap } = useSketchProgress();
    const { favorites, loadFavorites, toggle: toggleFavorite } = useFavoritesStore();
    const { level } = useProgressStore();

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Handle favorite toggle
    const handleFavoriteToggle = (sketchId: string, sketchTitle: string) => {
        const wasFavorited = favorites.includes(sketchId);
        toggleFavorite(sketchId);
        notify.success(
            wasFavorited ? "Removed from favorites" : "Added to favorites",
            sketchTitle
        );
    };

    // Derive effective category from URL param or local state
    const effectiveCategory = categoryParam || selectedCategory;

    // Filter and sort sketches
    const filteredSketches = sketches.filter(
        (sketch) => effectiveCategory === "all" || sketch.category === effectiveCategory
    );
    const sortedSketches = sortSketches(filteredSketches, sortBy);

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Sketch Library</h1>
                <p className="text-on-surface-variant mt-1">
                    Choose a sketch and start your creative journey
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap scrollbar-hide w-full sm:w-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`
                                shrink-0 px-4 py-2 rounded-full font-headline font-medium text-sm
                                transition-all duration-150 soft-touch
                                ${
                                    effectiveCategory === cat.id
                                        ? "bg-primary text-white"
                                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                                }
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* View Mode & Sort Controls */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded transition-all ${
                                viewMode === "grid"
                                    ? "bg-primary text-white"
                                    : "text-on-surface-variant hover:bg-surface-container"
                            }`}
                            aria-label="Grid view"
                        >
                            <Icons.Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded transition-all ${
                                viewMode === "list"
                                    ? "bg-primary text-white"
                                    : "text-on-surface-variant hover:bg-surface-container"
                            }`}
                            aria-label="List view"
                        >
                            <Icons.List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-on-surface-variant hidden sm:inline">
                            Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-surface-container-low border-none rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-headline focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
                        >
                            <option value="popularity">Popularity</option>
                            <option value="newest">Newest</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sketch Grid */}
            <SketchGrid
                sketches={sortedSketches}
                progressMap={progressMap}
                userLevel={level}
                favorites={favorites}
                onFavoriteToggle={handleFavoriteToggle}
                viewMode={viewMode}
            />

            {/* Pagination Info */}
            <div className="flex flex-col items-center gap-4 pt-8">
                <p className="text-sm text-on-surface-variant">
                    Showing {sortedSketches.length} of {sketches.length} artistic templates
                </p>
                <Button variant="secondary" size="md">
                    Discover More Sketches ↓
                </Button>
            </div>
        </div>
    );
}
