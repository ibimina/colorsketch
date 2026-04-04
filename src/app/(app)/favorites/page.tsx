"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";;
import { Button, Card } from "@/components/ui";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { useSketchProgress } from "@/hooks";
import { notify } from "@/stores/notificationsStore";
import { Icons } from "@/lib/icons";
import { Heart, ArrowLeft, Sparkles, Bookmark } from "lucide-react";
import { getUserBookmarkedArtworks, toggleArtworkBookmark } from "@/lib/actions";

// Shared data and components
import { sketches } from "@/data/sketches";
import { SketchGrid } from "@/components/SketchCard";

// Sketch titles mapping
const sketchTitles: Record<string, string> = {
    butterfly: "Monarch Butterfly",
    rose: "Elegant Rose",
    mandala: "Sacred Mandala",
    hummingbird: "Hummingbird Garden",
    "koi-fish": "Japanese Koi",
    owl: "Wise Owl",
    lotus: "Lotus Bloom",
    fox: "Woodland Fox",
};

function getSketchTitle(sketchId: string): string {
    return sketchTitles[sketchId] || sketchId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

type TabType = "sketches" | "bookmarks";

interface CommunityArtwork {
    id: string;
    sketch_id: string;
    image_url: string;
    thumbnail_url: string | null;
    likes_count: number;
    saves_count: number;
    created_at: string;
    user_id: string;
    bookmarked_at?: string;
}

// ============================================
// Favorites Page
// ============================================

export default function FavoritesPage() {
    // State
    const [activeTab, setActiveTab] = useState<TabType>("sketches");
    const [bookmarkedArtworks, setBookmarkedArtworks] = useState<CommunityArtwork[]>([]);
    const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
    const hasStartedLoadingBookmarks = useRef(false);

    // Hooks
    const { favorites, loadFavorites, toggle: toggleFavorite } = useFavoritesStore();
    const { level } = useProgressStore();
    const { progressMap } = useSketchProgress();

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Load bookmarked artworks when switching tabs
    useEffect(() => {
        if (activeTab === "bookmarks" && !hasStartedLoadingBookmarks.current) {
            hasStartedLoadingBookmarks.current = true;
            // Start async fetch - loading state handled by initial true value
            (async () => {
                setIsLoadingBookmarks(true);
                const data = await getUserBookmarkedArtworks();
                setBookmarkedArtworks(data as unknown as CommunityArtwork[]);
                setIsLoadingBookmarks(false);
            })();
        }
    }, [activeTab]);

    // Handle favorite toggle (always removes on this page)
    const handleFavoriteToggle = (sketchId: string, sketchTitle: string) => {
        toggleFavorite(sketchId);
        notify.success("Removed from favorites", sketchTitle);
    };

    // Handle unbookmark
    const handleUnbookmark = async (artworkId: string) => {
        const result = await toggleArtworkBookmark(artworkId, true);
        if (result.success) {
            setBookmarkedArtworks(prev => prev.filter(a => a.id !== artworkId));
            notify.success("Removed from bookmarks");
        }
    };

    // Filter sketches to only show favorites
    const favoriteSketches = sketches.filter((sketch) => favorites.includes(sketch.id));

    const tabs = [
        { id: "sketches" as TabType, label: "Sketches", count: favoriteSketches.length, icon: Heart },
        { id: "bookmarks" as TabType, label: "Bookmarks", count: bookmarkedArtworks.length, icon: Bookmark },
    ];

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
                    Your favorite sketches and community artworks
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-outline-variant">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${activeTab === tab.id
                                ? "text-primary"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${tab.id === "sketches" && activeTab === tab.id ? "fill-current" : ""}`} />
                            {tab.label}
                            <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === "sketches" && (
                favoriteSketches.length === 0 ? (
                    <EmptyState type="sketches" />
                ) : (
                    <SketchGrid
                        sketches={favoriteSketches}
                        progressMap={progressMap}
                        userLevel={level}
                        favorites={favorites}
                        onFavoriteToggle={handleFavoriteToggle}
                    />
                )
            )}

            {activeTab === "bookmarks" && (
                isLoadingBookmarks ? (
                    <LoadingGrid />
                ) : bookmarkedArtworks.length === 0 ? (
                    <EmptyState type="bookmarks" />
                ) : (
                    <ArtworkGrid
                        artworks={bookmarkedArtworks}
                        onRemove={handleUnbookmark}
                        removeIcon="bookmark"
                    />
                )
            )}
        </div>
    );
}

// ============================================
// Artwork Grid Component
// ============================================

function ArtworkGrid({
    artworks,
    onRemove,
    removeIcon
}: {
    artworks: CommunityArtwork[];
    onRemove: (id: string) => void;
    removeIcon: "heart" | "bookmark";
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
                <Card
                    key={artwork.id}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden group"
                >
                    <div className="relative aspect-square bg-surface-container">
                        <Image
                            src={artwork.image_url}
                            alt={getSketchTitle(artwork.sketch_id)}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover"
                            quality={90}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => onRemove(artwork.id)}
                                className="p-3 rounded-full bg-error text-on-error hover:bg-error/80 transition-colors"
                                title={removeIcon === "heart" ? "Unlike" : "Unsave"}
                            >
                                {removeIcon === "heart" ? (
                                    <Icons.Heart className="w-5 h-5 fill-current" />
                                ) : (
                                    <Icons.Bookmark className="w-5 h-5 fill-current" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="font-headline font-medium text-sm truncate mb-1">
                            {getSketchTitle(artwork.sketch_id)}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1">
                                <Icons.Heart className="w-3 h-3" />
                                {artwork.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Icons.Bookmark className="w-3 h-3" />
                                {artwork.saves_count || 0}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ============================================
// Loading Grid Component
// ============================================

function LoadingGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
            ))}
        </div>
    );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ type }: { type: "sketches" | "bookmarks" }) {
    const config = {
        sketches: {
            icon: Heart,
            title: "No favorite sketches yet",
            description: "Start exploring and tap the heart icon on sketches you love to save them here.",
            buttonText: "Browse Library",
            buttonLink: "/library"
        },
        bookmarks: {
            icon: Bookmark,
            title: "No bookmarked artworks yet",
            description: "Bookmark community artworks to build your private collection.",
            buttonText: "Explore Gallery",
            buttonLink: "/home"
        }
    };

    const { icon: Icon, title, description, buttonText, buttonLink } = config[type];

    return (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl">
            <Icon className="h-16 w-16 mx-auto text-on-surface-variant/30 mb-4" />
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
                {title}
            </h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                {description}
            </p>
            <Link href={buttonLink} className="flex items-center justify-center">
                <Button variant="primary" className="flex items-center" size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {buttonText}
                </Button>
            </Link>
        </div>
    );
}
