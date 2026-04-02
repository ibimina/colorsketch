"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { useProgressStore } from "@/stores/progressStore";

// TODO: Connect to actual saved artworks store when save functionality is implemented
const savedArtworks: any[] = [];

export default function GalleryPage() {
    const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");
    const { totalSketches } = useProgressStore();

    const filteredArtworks = savedArtworks.filter((artwork) => {
        if (filter === "completed") return artwork.completedAt !== null;
        if (filter === "in-progress") return artwork.completedAt === null;
        return true;
    });

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-bold">My Gallery</h1>
                    <p className="text-on-surface-variant mt-1">
                        {savedArtworks.length > 0
                            ? `${savedArtworks.length} saved ${savedArtworks.length === 1 ? 'artwork' : 'artworks'}`
                            : 'Your saved artworks will appear here'
                        }
                    </p>
                </div>

                <Link href="/library">
                    <Button variant="primary">+ New Artwork</Button>
                </Link>
            </div>

            {/* Filter Tabs - Only show when there are artworks */}
            {savedArtworks.length > 0 && (
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
                            key={artwork.id}
                            variant="elevated"
                            padding="none"
                            className="overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-square bg-surface-container">
                                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40">
                                    🎨
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    {artwork.completedAt ? (
                                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-headline font-bold">
                                            ✓ Completed
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-headline font-bold">
                                            In Progress
                                        </span>
                                    )}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={`/canvas/${artwork.sketchId}`}>
                                        <Button variant="primary" size="sm">
                                            {artwork.completedAt ? "View" : "Continue"}
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-headline font-bold text-lg">{artwork.title}</h3>
                                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                                    <span>Started {formatDate(artwork.createdAt)}</span>
                                    {artwork.completedAt && (
                                        <span className="text-green-600">
                                            Done {formatDate(artwork.completedAt)}
                                        </span>
                                    )}
                                </div>
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
                        Saved artworks will appear here when you color and save sketches.
                    </p>
                    <p className="text-sm text-on-surface-variant mb-6">
                        You've completed {totalSketches} {totalSketches === 1 ? 'sketch' : 'sketches'} so far!
                    </p>
                    <Link href="/library">
                        <Button variant="primary">Browse Sketches</Button>
                    </Link>
                </Card>
            )}

            {/* Stats - Only show when there are artworks */}
            {savedArtworks.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                            {savedArtworks.length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Saved Artworks</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-green-600">
                            {savedArtworks.filter((a) => a.completedAt).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Completed</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-yellow-600">
                            {savedArtworks.filter((a) => !a.completedAt).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">In Progress</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
