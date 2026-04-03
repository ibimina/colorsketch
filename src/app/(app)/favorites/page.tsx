"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { useSketchProgress } from "@/hooks";
import { notify } from "@/stores/notificationsStore";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";

// Shared data and components
import { sketches } from "@/data/sketches";
import { SketchGrid } from "@/components/SketchCard";

// ============================================
// Favorites Page
// ============================================

export default function FavoritesPage() {
    // Hooks
    const { favorites, loadFavorites, toggle: toggleFavorite } = useFavoritesStore();
    const { level } = useProgressStore();
    const { progressMap } = useSketchProgress();

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Handle favorite toggle (always removes on this page)
    const handleFavoriteToggle = (sketchId: string, sketchTitle: string) => {
        toggleFavorite(sketchId);
        notify.success("Removed from favorites", sketchTitle);
    };

    // Filter sketches to only show favorites
    const favoriteSketches = sketches.filter((sketch) => favorites.includes(sketch.id));

    return (
        <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/library"
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Library
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    <h1 className="text-3xl sm:text-4xl font-headline font-bold">My Favorites</h1>
                </div>
                <p className="text-on-surface-variant text-lg">
                    {favoriteSketches.length} {favoriteSketches.length === 1 ? "sketch" : "sketches"} saved
                </p>
            </div>

            {/* Empty State */}
            {favoriteSketches.length === 0 ? (
                <EmptyState />
            ) : (
                <SketchGrid
                    sketches={favoriteSketches}
                    progressMap={progressMap}
                    userLevel={level}
                    favorites={favorites}
                    onFavoriteToggle={handleFavoriteToggle}
                />
            )}
        </div>
    );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
    return (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl">
            <Heart className="h-16 w-16 mx-auto text-on-surface-variant/30 mb-4" />
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
                No favorites yet
            </h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                Start exploring and tap the heart icon on sketches you love to save them here.
            </p>
            <Link href="/library">
                <Button variant="primary" size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Browse Library
                </Button>
            </Link>
        </div>
    );
}
