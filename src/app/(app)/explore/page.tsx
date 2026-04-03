"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { Icons } from "@/lib/icons";
import { Leaderboard } from "@/components/Leaderboard";
import { getPublicArtworks, getArtworkInteractions, toggleArtworkLike, toggleArtworkBookmark } from "@/lib/actions";

const categories = [
    { id: "animals", label: "Animals", emoji: "🦋", href: "/library?category=animals" },
    { id: "botanical", label: "Botanical", emoji: "🌸", href: "/library?category=botanical" },
    { id: "mandalas", label: "Mandalas", emoji: "🔮", href: "/library?category=mandalas" },
    { id: "fantasy", label: "Fantasy", emoji: "🐉", href: "/library?category=fantasy" },
    { id: "geometric", label: "Geometric", emoji: "🔲", href: "/library?category=geometric" },
    { id: "abstract", label: "Abstract", emoji: "🎨", href: "/library?category=abstract" },
];

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

interface PublicArtwork {
    id: string;
    sketch_id: string;
    image_url: string;
    thumbnail_url: string | null;
    created_at: string;
    user_id: string;
    likes_count: number;
    saves_count: number;
    artist_name: string;
    artist_avatar: string | null;
}

interface Interactions {
    liked: string[];
    bookmarked: string[];
}

export default function ExplorePage() {
    const [communityArtworks, setCommunityArtworks] = useState<PublicArtwork[]>([]);
    const [interactions, setInteractions] = useState<Interactions>({ liked: [], bookmarked: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCommunityArtworks() {
            const data = await getPublicArtworks(8);
            setCommunityArtworks(data as PublicArtwork[]);

            // Load user's interactions with these artworks
            if (data.length > 0) {
                const artworkIds = data.map(a => a.id);
                const userInteractions = await getArtworkInteractions(artworkIds);
                setInteractions(userInteractions);
            }

            setIsLoading(false);
        }
        loadCommunityArtworks();
    }, []);

    const handleLike = async (artworkId: string) => {
        const isLiked = interactions.liked.includes(artworkId);
        const result = await toggleArtworkLike(artworkId, isLiked);

        if (result.success) {
            setInteractions(prev => ({
                ...prev,
                liked: isLiked
                    ? prev.liked.filter(id => id !== artworkId)
                    : [...prev.liked, artworkId]
            }));

            setCommunityArtworks(prev => prev.map(artwork =>
                artwork.id === artworkId
                    ? { ...artwork, likes_count: artwork.likes_count + (isLiked ? -1 : 1) }
                    : artwork
            ));
        }
    };

    const handleBookmark = async (artworkId: string) => {
        const isBookmarked = interactions.bookmarked.includes(artworkId);
        const result = await toggleArtworkBookmark(artworkId, isBookmarked);

        if (result.success) {
            setInteractions(prev => ({
                ...prev,
                bookmarked: isBookmarked
                    ? prev.bookmarked.filter(id => id !== artworkId)
                    : [...prev.bookmarked, artworkId]
            }));

            setCommunityArtworks(prev => prev.map(artwork =>
                artwork.id === artworkId
                    ? { ...artwork, saves_count: artwork.saves_count + (isBookmarked ? -1 : 1) }
                    : artwork
            ));
        }
    };
    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-headline font-bold">
                        Explore Sketches
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
                        Discover beautiful artwork to bring to life with your colors
                    </p>
                </div>

                {/* Search Bar */}
                <Card variant="elevated" className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Icons.Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                        <input
                            type="text"
                            placeholder="Search for sketches, categories, themes..."
                            className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.location.href = '/library';
                                }
                            }}
                        />
                        <Link href="/library">
                            <Button variant="primary" size="sm">
                                Browse All
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Browse Categories */}
                <section>
                    <h2 className="text-xl sm:text-2xl font-headline font-bold mb-6 text-center">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={cat.href}
                                className="group"
                            >
                                <Card
                                    variant="elevated"
                                    className="text-center hover:scale-105 transition-transform"
                                >
                                    <div className="text-4xl sm:text-5xl mb-3">{cat.emoji}</div>
                                    <p className="font-headline font-medium">
                                        {cat.label}
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Top Artists This Week */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-2xl font-headline font-bold">
                            🏆 Top Artists This Week
                        </h2>
                        <Link
                            href="/leaderboard"
                            className="text-primary font-headline font-medium text-sm hover:underline"
                        >
                            View All →
                        </Link>
                    </div>
                    <Leaderboard
                        limit={5}
                        showPeriodToggle={false}
                        defaultPeriod="weekly"
                        title="Top Artists This Week"
                    />
                </section>

                {/* Coming Soon Banner */}
                <Card
                    variant="filled"
                    className="bg-linear-to-br from-primary/10 via-secondary/10 to-tertiary/10 text-center py-12"
                >
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-5xl sm:text-6xl">🎨</div>
                        <h3 className="text-xl sm:text-2xl font-headline font-bold">
                            More Features Coming Soon
                        </h3>
                        <p className="text-on-surface-variant">
                            We&apos;re working on featured sketches, curated collections, and artist spotlights.
                            For now, explore our full library of beautiful artwork.
                        </p>
                        <Link href="/library">
                            <Button variant="primary" size="lg">
                                View Full Library
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Community Gallery */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-2xl font-headline font-bold">
                            🌟 Community Gallery
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : communityArtworks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {communityArtworks.map((artwork) => {
                                const isLiked = interactions.liked.includes(artwork.id);
                                const isBookmarked = interactions.bookmarked.includes(artwork.id);

                                return (
                                    <Card
                                        key={artwork.id}
                                        variant="elevated"
                                        padding="none"
                                        className="overflow-hidden group"
                                    >
                                        <div className="relative aspect-square bg-surface-container">
                                            <Image
                                                src={artwork.thumbnail_url || artwork.image_url}
                                                alt={getSketchTitle(artwork.sketch_id)}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleLike(artwork.id)}
                                                    className={`p-2 rounded-full transition-colors ${isLiked
                                                            ? "bg-error text-on-error"
                                                            : "bg-white/20 text-white hover:bg-white/30"
                                                        }`}
                                                >
                                                    <Icons.Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleBookmark(artwork.id)}
                                                    className={`p-2 rounded-full transition-colors ${isBookmarked
                                                            ? "bg-primary text-on-primary"
                                                            : "bg-white/20 text-white hover:bg-white/30"
                                                        }`}
                                                >
                                                    <Icons.Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <p className="font-headline font-medium text-sm truncate mb-1">
                                                {getSketchTitle(artwork.sketch_id)}
                                            </p>

                                            {/* Artist Info */}
                                            <Link
                                                href={`/profile/${artwork.user_id}`}
                                                className="flex items-center gap-1.5 mb-2 hover:opacity-80 transition-opacity"
                                            >
                                                {artwork.artist_avatar ? (
                                                    <Image
                                                        src={artwork.artist_avatar}
                                                        alt={artwork.artist_name}
                                                        width={16}
                                                        height={16}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <span className="text-[8px]">🎨</span>
                                                    </div>
                                                )}
                                                <span className="text-xs text-on-surface-variant truncate">
                                                    {artwork.artist_name}
                                                </span>
                                            </Link>

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
                                );
                            })}
                        </div>
                    ) : (
                        <Card variant="filled" className="text-center py-8">
                            <p className="text-on-surface-variant">
                                No community artworks yet. Be the first to share! 🎨
                            </p>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
