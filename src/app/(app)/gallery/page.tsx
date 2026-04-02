"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, Button, ColoredSketchPreview } from "@/components/ui";
import { useProgressStore } from "@/stores/progressStore";
import { useSketchProgress, SketchProgressData } from "@/hooks";

// Sketch titles mapping (same as used in library and canvas)
const sketchTitles: Record<string, string> = {
    butterfly: "Monarch Butterfly",
    rose: "Elegant Rose",
    mandala: "Sacred Mandala",
    hummingbird: "Hummingbird Garden",
    "koi-fish": "Japanese Koi",
    owl: "Wise Owl",
    lotus: "Lotus Bloom",
    fox: "Woodland Fox",
    elephant: "Baby Elephant",
    peacock: "Majestic Peacock",
    dolphin: "Playful Dolphin",
    "sea-turtle": "Sea Turtle",
    dinosaur: "T-Rex Adventure",
    puppy: "Adorable Puppy",
    lion: "Baby Lion",
    cat: "Kawaii Cat",
    bunny: "Fluffy Bunny",
    "teddy-bear": "Teddy Bear",
    flamingo: "Tropical Flamingo",
    octopus: "Cute Octopus",
    sunflower: "Sunny Sunflower",
    "cherry-blossom": "Cherry Blossom Branch",
    unicorn: "Magical Unicorn",
    dragon: "Friendly Dragon",
    mermaid: "Beautiful Mermaid",
    "mushroom-house": "Fairy Mushroom House",
    castle: "Princess Castle",
    rainbow: "Rainbow Dreams",
    astronaut: "Space Explorer",
    cupcake: "Sweet Cupcake",
    "ice-cream": "Ice Cream Cone",
};

// Helper to get sketch title
function getSketchTitle(sketchId: string): string {
    return sketchTitles[sketchId] || sketchId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

export default function GalleryPage() {
    const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");
    const { totalSketches } = useProgressStore();
    const { progressMap, isLoading } = useSketchProgress();

    // Convert progress map to array and filter
    const artworks = useMemo(() => {
        return Object.values(progressMap)
            .filter((p): p is SketchProgressData => {
                // Only include sketches that have been started (have fills)
                const fillCount = Object.keys(p.fills || {}).filter(k => k !== "background").length;
                return fillCount > 0;
            })
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }, [progressMap]);

    const filteredArtworks = artworks.filter((artwork) => {
        if (filter === "completed") return artwork.completed_at !== null;
        if (filter === "in-progress") return artwork.completed_at === null;
        return true;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
        
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 pb-20 lg:pb-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-bold">My Gallery</h1>
                    <p className="text-on-surface-variant mt-1">Loading your artworks...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-surface-container rounded-2xl aspect-square animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-bold">My Gallery</h1>
                    <p className="text-on-surface-variant mt-1">
                        {artworks.length > 0
                            ? `${artworks.length} ${artworks.length === 1 ? 'artwork' : 'artworks'} in progress or completed`
                            : 'Your artworks will appear here'
                        }
                    </p>
                </div>

                <Link href="/library">
                    <Button variant="primary">+ New Artwork</Button>
                </Link>
            </div>

            {/* Filter Tabs - Only show when there are artworks */}
            {artworks.length > 0 && (
                <div className="flex gap-2">
                    {[
                        { id: "all", label: "All" },
                        { id: "completed", label: "Completed" },
                        { id: "in-progress", label: "In Progress" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as typeof filter)}
                            className={`
              px-4 py-2 rounded-full font-headline font-medium text-sm
              transition-all duration-150 soft-touch
              ${filter === tab.id
                                    ? "bg-primary text-white"
                                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                                }
            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Artwork Grid */}
            {filteredArtworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArtworks.map((artwork) => (
                        <Card
                            key={artwork.sketch_id}
                            variant="elevated"
                            padding="none"
                            className="overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
                        >
                            {/* Thumbnail with colored preview */}
                            <div className="relative aspect-square bg-surface-container">
                                <ColoredSketchPreview
                                    sketchPath={`/sketches/${artwork.sketch_id}.svg`}
                                    fills={artwork.fills}
                                    className="absolute inset-0"
                                />

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    {artwork.completed_at ? (
                                        <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-headline font-bold">
                                            ✓ Completed
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-headline font-bold">
                                            In Progress
                                        </span>
                                    )}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={`/canvas/${artwork.sketch_id}`}>
                                        <Button variant="primary" size="sm">
                                            {artwork.completed_at ? "View" : "Continue"}
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-headline font-bold text-lg">
                                    {getSketchTitle(artwork.sketch_id)}
                                </h3>
                                <p className="text-sm text-on-surface-variant">
                                    {artwork.completed_at 
                                        ? `Finished ${formatDate(artwork.completed_at)}`
                                        : `Edited ${formatDate(artwork.updated_at)}`
                                    }
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <Card variant="filled" className="text-center py-12 sm:py-16">
                    <div className="text-5xl sm:text-6xl mb-4">🎨</div>
                    <h3 className="text-lg sm:text-xl font-headline font-bold mb-2">
                        Your gallery is empty
                    </h3>
                    <p className="text-on-surface-variant mb-2">
                        Start coloring sketches and they will appear here automatically.
                    </p>
                    <p className="text-sm text-on-surface-variant mb-6">
                        You&apos;ve completed {totalSketches} {totalSketches === 1 ? 'sketch' : 'sketches'} so far!
                    </p>
                    <Link href="/library">
                        <Button variant="primary">Browse Sketches</Button>
                    </Link>
                </Card>
            )}

            {/* Stats - Only show when there are artworks */}
            {artworks.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                            {artworks.length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Total Artworks</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-green-600">
                            {artworks.filter((a) => a.completed_at).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Completed</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-yellow-600">
                            {artworks.filter((a) => !a.completed_at).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">In Progress</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
