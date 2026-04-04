"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { Category } from "@/types";
import { Icons } from "@/lib/icons";
import { useSketchProgress } from "@/hooks";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { useColoringStore } from "@/stores/coloringStore";
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

type StatusFilter = "all" | "in-progress" | "completed";

function LibraryContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category") as Category | null;

    // State
    const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("popularity");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Hooks
    const { progressMap } = useSketchProgress();
    const { favorites, loadFavorites, toggle: toggleFavorite } = useFavoritesStore();
    const { level } = useProgressStore();
    const { savedProgress } = useColoringStore();

    // Get in-progress and completed sketch IDs
    const { inProgressIds, completedIds } = useMemo(() => {
        const inProgress: string[] = [];
        const completed: string[] = [];
        
        Object.entries(savedProgress).forEach(([sketchId, progress]) => {
            const filledCount = Object.keys(progress.fills).length;
            if (filledCount === 0) return;
            
            const totalRegions = progress.totalRegions || 20; // fallback estimate
            const percent = (filledCount / totalRegions) * 100;
            
            if (percent >= 100) {
                completed.push(sketchId);
            } else {
                inProgress.push(sketchId);
            }
        });
        
        return { inProgressIds: inProgress, completedIds: completed };
    }, [savedProgress]);

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

    // Filter by category and status
    const filteredSketches = sketches.filter((sketch) => {
        // Category filter
        if (effectiveCategory !== "all" && sketch.category !== effectiveCategory) {
            return false;
        }
        
        // Status filter
        if (statusFilter === "in-progress") {
            return inProgressIds.includes(sketch.id);
        } else if (statusFilter === "completed") {
            return completedIds.includes(sketch.id);
        }
        
        return true;
    });
    const sortedSketches = sortSketches(filteredSketches, sortBy);

    // Counts for status tabs
    const statusCounts = {
        all: sketches.filter(s => effectiveCategory === "all" || s.category === effectiveCategory).length,
        inProgress: inProgressIds.filter(id => {
            const sketch = sketches.find(s => s.id === id);
            return sketch && (effectiveCategory === "all" || sketch.category === effectiveCategory);
        }).length,
        completed: completedIds.filter(id => {
            const sketch = sketches.find(s => s.id === id);
            return sketch && (effectiveCategory === "all" || sketch.category === effectiveCategory);
        }).length,
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Sketch Library</h1>
                <p className="text-on-surface-variant mt-1">
                    Choose a sketch and start your creative journey
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
                <button
                    onClick={() => setStatusFilter("all")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-headline font-medium text-sm transition-all ${
                        statusFilter === "all"
                            ? "bg-primary text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                    All ({statusCounts.all})
                </button>
                <button
                    onClick={() => setStatusFilter("in-progress")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-headline font-medium text-sm transition-all ${
                        statusFilter === "in-progress"
                            ? "bg-primary text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                    In Progress ({statusCounts.inProgress})
                </button>
                <button
                    onClick={() => setStatusFilter("completed")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-headline font-medium text-sm transition-all ${
                        statusFilter === "completed"
                            ? "bg-primary text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                    Completed ({statusCounts.completed})
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-on-surface-variant">Category:</span>
                    <select
                        value={effectiveCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as Category | "all")}
                        className="bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm font-headline focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[140px]"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
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
