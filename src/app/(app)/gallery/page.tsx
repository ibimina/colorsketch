"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { getSavedArtworks, toggleArtworkVisibility, deleteArtwork } from "@/lib/actions";
import { Globe, Lock, Trash2, Eye, Loader2 } from "lucide-react";

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

function getSketchTitle(sketchId: string): string {
    return sketchTitles[sketchId] || sketchId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

interface SavedArtwork {
    id: string;
    sketch_id: string;
    image_url: string;
    thumbnail_url: string | null;
    is_public: boolean;
    created_at: string;
}

export default function GalleryPage() {
    const [artworks, setArtworks] = useState<SavedArtwork[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "public" | "private">("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadArtworks();
    }, []);

    async function loadArtworks() {
        setIsLoading(true);
        const data = await getSavedArtworks();
        setArtworks(data as SavedArtwork[]);
        setIsLoading(false);
    }

    async function handleToggleVisibility(artwork: SavedArtwork) {
        setUpdatingId(artwork.id);
        const result = await toggleArtworkVisibility(artwork.id, !artwork.is_public);
        if (result.success) {
            setArtworks(prev => prev.map(a => 
                a.id === artwork.id ? { ...a, is_public: !a.is_public } : a
            ));
        }
        setUpdatingId(null);
    }

    async function handleDelete(artworkId: string) {
        if (!confirm("Are you sure you want to delete this artwork?")) return;
        
        setDeletingId(artworkId);
        const result = await deleteArtwork(artworkId);
        if (result.success) {
            setArtworks(prev => prev.filter(a => a.id !== artworkId));
        }
        setDeletingId(null);
    }

    const filteredArtworks = artworks.filter((artwork) => {
        if (filter === "public") return artwork.is_public;
        if (filter === "private") return !artwork.is_public;
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
                            ? `${artworks.length} saved ${artworks.length === 1 ? 'artwork' : 'artworks'}`
                            : 'Save artworks from the canvas to see them here'
                        }
                    </p>
                </div>

                <Link href="/library">
                    <Button variant="primary">+ New Artwork</Button>
                </Link>
            </div>

            {/* Filter Tabs */}
            {artworks.length > 0 && (
                <div className="flex gap-2">
                    {[
                        { id: "all", label: "All" },
                        { id: "public", label: "Public" },
                        { id: "private", label: "Private" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as typeof filter)}
                            className={`
                                px-4 py-2 rounded-full font-headline font-medium text-sm
                                transition-all duration-150
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
                            className="overflow-hidden group"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-square bg-surface-container">
                                <Image
                                    src={artwork.thumbnail_url || artwork.image_url}
                                    alt={getSketchTitle(artwork.sketch_id)}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />

                                {/* Visibility Badge */}
                                <div className="absolute top-3 left-3">
                                    {artwork.is_public ? (
                                        <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-headline font-bold flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Public
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full bg-gray-500 text-white text-xs font-headline font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Private
                                        </span>
                                    )}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleToggleVisibility(artwork)}
                                        disabled={updatingId === artwork.id}
                                        className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                                        title={artwork.is_public ? "Make private" : "Make public"}
                                    >
                                        {updatingId === artwork.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                                        ) : artwork.is_public ? (
                                            <Lock className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <Globe className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => window.open(artwork.image_url, '_blank')}
                                        className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                                        title="View full size"
                                    >
                                        <Eye className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(artwork.id)}
                                        disabled={deletingId === artwork.id}
                                        className="p-2 rounded-full bg-red-500/90 hover:bg-red-500 transition-colors"
                                        title="Delete artwork"
                                    >
                                        {deletingId === artwork.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                                        ) : (
                                            <Trash2 className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-1">
                                <h3 className="font-headline font-bold text-lg">
                                    {getSketchTitle(artwork.sketch_id)}
                                </h3>
                                <p className="text-sm text-on-surface-variant">
                                    Saved {formatDate(artwork.created_at)}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <Card variant="filled" className="text-center py-12 sm:py-16">
                    <div className="text-5xl sm:text-6xl mb-4">🖼️</div>
                    <h3 className="text-lg sm:text-xl font-headline font-bold mb-2">
                        Your gallery is empty
                    </h3>
                    <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                        Complete a sketch and tap &quot;Gallery&quot; to save it here. 
                        You can choose to keep it private or share it with the community!
                    </p>
                    <Link href="/library">
                        <Button variant="primary">Browse Sketches</Button>
                    </Link>
                </Card>
            )}

            {/* Stats */}
            {artworks.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                            {artworks.length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Total Saved</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-green-600">
                            {artworks.filter((a) => a.is_public).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Public</p>
                    </Card>
                    <Card variant="filled" className="text-center">
                        <p className="text-2xl sm:text-3xl font-headline font-bold text-gray-600">
                            {artworks.filter((a) => !a.is_public).length}
                        </p>
                        <p className="text-sm text-on-surface-variant">Private</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
