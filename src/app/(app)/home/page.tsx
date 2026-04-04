"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { useProgressStore } from "@/stores/progressStore";
import { useColoringStore } from "@/stores/coloringStore";
import { useSketchProgress } from "@/hooks/useSketchProgress";
import { Icons } from "@/lib/icons";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { sketches } from "@/data/sketches";
import { useEffect, useMemo, useState, useRef } from "react";
import { Sparkles, Palette, TrendingUp, Clock, ChevronRight, Flame, Star, Zap, Heart, Bookmark, X, Eye } from "lucide-react";
import { getPublicArtworks, getArtworkInteractions, toggleArtworkLike, toggleArtworkBookmark } from "@/lib/actions";

const categories = [
    { id: "animals", label: "Animals", emoji: "🦋", href: "/library?category=animals" },
    { id: "botanical", label: "Botanical", emoji: "🌸", href: "/library?category=botanical" },
    { id: "mandalas", label: "Mandalas", emoji: "🔮", href: "/library?category=mandalas" },
    { id: "fantasy", label: "Fantasy", emoji: "🐉", href: "/library?category=fantasy" },
    { id: "geometric", label: "Geometric", emoji: "🔲", href: "/library?category=geometric" },
    { id: "abstract", label: "Abstract", emoji: "🎨", href: "/library?category=abstract" },
];

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

function getSketchTitle(sketchId: string): string {
    const sketch = sketches.find(s => s.id === sketchId);
    if (sketch) return sketch.title;
    return sketchId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

export default function HomePage() {
    const { level, xp, xpToNextLevel, streak, totalSketches, achievements, checkStreak } = useProgressStore();
    const { savedProgress } = useColoringStore();
    const { progressMap } = useSketchProgress();
    const mountedRef = useRef(false);
    const [mounted, setMounted] = useState(false);

    // Community gallery state
    const [communityArtworks, setCommunityArtworks] = useState<PublicArtwork[]>([]);
    const [interactions, setInteractions] = useState<Interactions>({ liked: [], bookmarked: [] });
    const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState<PublicArtwork | null>(null);

    useEffect(() => {
        // Use async IIFE to avoid synchronous setState warning
        (async () => {
            if (!mountedRef.current) {
                mountedRef.current = true;
                setMounted(true);
            }
        })();
        checkStreak();

        // Load community artworks
        async function loadCommunityArtworks() {
            const data = await getPublicArtworks(8);
            setCommunityArtworks(data as PublicArtwork[]);

            if (data.length > 0) {
                const artworkIds = data.map(a => a.id);
                const userInteractions = await getArtworkInteractions(artworkIds);
                setInteractions(userInteractions);
            }
            setIsLoadingArtworks(false);
        }
        loadCommunityArtworks();
    }, [checkStreak]);

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

    // Get a featured sketch (random but consistent per day)
    const featuredSketch = useMemo(() => {
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return sketches[seed % sketches.length];
    }, []);

    // Get in-progress sketches (exclude completed ones)
    const inProgressSketches = useMemo(() => {
        // Get IDs of completed sketches from database
        const completedIds = new Set(
            Object.entries(progressMap)
                .filter(([, progress]) => progress.completed_at)
                .map(([sketchId]) => sketchId)
        );

        const progressList = Object.entries(savedProgress)
            .filter(([sketchId, progress]) => {
                // Must have some fills
                if (Object.keys(progress.fills).length === 0) return false;
                // Must NOT be completed
                if (completedIds.has(sketchId)) return false;
                return true;
            })
            .map(([sketchId, progress]) => ({ sketchId, progress }))
            .sort((a, b) => b.progress.lastModified - a.progress.lastModified);

        return progressList
            .map(({ sketchId, progress }) => {
                const sketch = sketches.find(s => s.id === sketchId);
                if (!sketch) return null;

                const filledRegions = Object.keys(progress.fills).length;
                const totalRegions = progress.totalRegions || sketch.regions?.length || 20;
                const progressPercent = Math.min(100, Math.round((filledRegions / totalRegions) * 100));

                return {
                    id: sketch.id,
                    title: sketch.title,
                    category: sketch.category,
                    thumbnail: sketch.thumbnail,
                    progress: progressPercent,
                    lastModified: progress.lastModified,
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .slice(0, 4);
    }, [savedProgress, progressMap]);

    const unlockedAchievements = useMemo(() => {
        return achievements
            .map(id => ACHIEVEMENTS.find(a => a.id === id))
            .filter(Boolean)
            .slice(0, 4);
    }, [achievements]);

    const xpProgress = (xp / xpToNextLevel) * 100;

    const stats = [
        { icon: <Zap className="w-4 h-4" />, value: level, label: "Level", color: "text-amber-500" },
        { icon: <Flame className="w-4 h-4" />, value: streak, label: "Streak", color: "text-orange-500" },
        { icon: <Star className="w-4 h-4" />, value: totalSketches, label: "Complete", color: "text-purple-500" },
    ];

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Compact Progress Bar */}
            <div className="flex items-center gap-4 p-4 w-6/12 bg-surface-container rounded-2xl">
                <div className="flex items-center gap-6 flex-1">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className={stat.color}>{stat.icon}</span>
                            <span className="font-bold text-lg">{stat.value}</span>
                            <span className="text-xs text-on-surface-variant hidden sm:inline">{stat.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-48">
                    <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
                        {xp}/{xpToNextLevel} XP
                    </span>
                </div>
            </div>

            {/* Hero: Featured Sketch of the Day */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="relative grid md:grid-cols-2 gap-0">
                    <div className="relative aspect-square md:aspect-auto md:min-h-80 bg-white/50 flex items-center justify-center p-8">
                        <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Sketch of the Day
                        </div>
                        {featuredSketch?.thumbnail ? (
                            <Image
                                src={featuredSketch.thumbnail}
                                alt={featuredSketch.title}
                                width={280}
                                height={280}
                                className="object-contain drop-shadow-lg"
                            />
                        ) : (
                            <div className="text-8xl">🎨</div>
                        )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                        <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                            {featuredSketch?.category}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-headline font-bold mb-3">
                            {featuredSketch?.title}
                        </h1>
                        <p className="text-on-surface-variant mb-6 text-sm md:text-base">
                            Bring this beautiful sketch to life with your unique color palette. Express yourself and share your creation!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href={`/canvas/${featuredSketch?.id}`}>
                                <Button variant="primary" size="lg" className="w-full flex items-center sm:w-auto gap-2">
                                    <Palette className="w-4 h-4" />
                                    Color This
                                </Button>
                            </Link>
                            <Link href="/library">
                                <Button variant="secondary" size="lg" className="w-full flex items-center sm:w-auto gap-2">
                                    Browse Library
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Continue Coloring */}
            {mounted && inProgressSketches.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-headline font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Continue Where You Left Off
                        </h2>
                        <Link href="/library?status=in-progress" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {inProgressSketches.map((sketch) => (
                            <Link key={sketch.id} href={`/canvas/${sketch.id}`}>
                                <Card variant="elevated" padding="none" className="overflow-hidden group hover:shadow-lg transition-all">
                                    <div className="aspect-square bg-surface-container flex items-center justify-center relative p-4">
                                        {sketch.thumbnail ? (
                                            <Image
                                                src={sketch.thumbnail}
                                                alt={sketch.title}
                                                fill
                                                className="object-contain p-3 group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <span className="text-4xl">🎨</span>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${sketch.progress}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-sm truncate">{sketch.title}</p>
                                        <p className="text-xs text-on-surface-variant">{sketch.progress}% complete</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Browse by Category */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-headline font-bold">Browse by Category</h2>
                    <Link href="/library" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                        All Sketches <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={cat.href}>
                            <Card variant="elevated" className="text-center hover:scale-105 transition-transform p-3">
                                <div className="text-2xl sm:text-3xl mb-1">{cat.emoji}</div>
                                <p className="font-headline font-medium text-xs sm:text-sm">{cat.label}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Community Gallery */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-headline font-bold flex items-center gap-2">
                        🌟 Community Gallery
                    </h2>
                </div>

                {isLoadingArtworks ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : communityArtworks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {communityArtworks.map((artwork) => {
                            const isLiked = interactions.liked.includes(artwork.id);
                            const isBookmarked = interactions.bookmarked.includes(artwork.id);

                            return (
                                <Card key={artwork.id} variant="elevated" padding="none" className="overflow-hidden group rounded-lg">
                                    <div
                                        className="relative aspect-square bg-surface-container cursor-pointer"
                                        onClick={() => setSelectedArtwork(artwork)}
                                    >
                                        <Image
                                            src={artwork.image_url}
                                            alt={getSketchTitle(artwork.sketch_id)}
                                            fill
                                            sizes="(min-width: 640px) 25vw, 50vw"
                                            className="object-cover"
                                            quality={90}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedArtwork(artwork); }}
                                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleLike(artwork.id); }}
                                                className={`p-2 rounded-full transition-colors ${isLiked ? "bg-error text-on-error" : "bg-white/20 text-white hover:bg-white/30"}`}
                                            >
                                                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBookmark(artwork.id); }}
                                                className={`p-2 rounded-full transition-colors ${isBookmarked ? "bg-primary text-on-primary" : "bg-white/20 text-white hover:bg-white/30"}`}
                                            >
                                                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-headline font-medium text-sm truncate mb-1">
                                            {getSketchTitle(artwork.sketch_id)}
                                        </p>
                                        <Link href={`/profile/${artwork.user_id}`} className="flex items-center gap-1.5 mb-2 hover:opacity-80 transition-opacity">
                                            {artwork.artist_avatar ? (
                                                <Image src={artwork.artist_avatar} alt={artwork.artist_name} width={16} height={16} className="rounded-full" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <span className="text-[8px]">🎨</span>
                                                </div>
                                            )}
                                            <span className="text-xs text-on-surface-variant truncate">{artwork.artist_name}</span>
                                        </Link>
                                        <div className="flex items-center justify-between text-xs text-on-surface-variant">
                                            <span className="flex items-center gap-1">
                                                <Icons.Heart className="w-3 h-3" /> {artwork.likes_count || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icons.Bookmark className="w-3 h-3" /> {artwork.saves_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card variant="filled" className="text-center py-8">
                        <p className="text-4xl mb-3">🎨</p>
                        <p className="font-headline font-bold">No artworks yet</p>
                        <p className="text-on-surface-variant text-sm">Be the first to share your creation!</p>
                    </Card>
                )}
            </section>

            {/* Artwork View Modal */}
            {selectedArtwork && (
                <ArtworkModal
                    artwork={selectedArtwork}
                    onClose={() => setSelectedArtwork(null)}
                    isLiked={interactions.liked.includes(selectedArtwork.id)}
                    isBookmarked={interactions.bookmarked.includes(selectedArtwork.id)}
                    onLike={() => handleLike(selectedArtwork.id)}
                    onBookmark={() => handleBookmark(selectedArtwork.id)}
                />
            )}

            {/* Achievements Row */}
            {unlockedAchievements.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-headline font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                            Your Achievements
                        </h2>
                        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
                            {achievements.length} unlocked
                        </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4">
                        {unlockedAchievements.map((achievement) => (
                            <Card key={achievement!.id} variant="elevated" className="shrink-0 w-40 lg:w-auto flex items-center gap-3">
                                <span className="text-2xl">{achievement!.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-headline font-bold text-sm truncate">{achievement!.title}</p>
                                    <p className="text-xs text-on-surface-variant truncate">{achievement!.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// Artwork View Modal Component
function ArtworkModal({
    artwork,
    onClose,
    isLiked,
    isBookmarked,
    onLike,
    onBookmark,
}: {
    artwork: PublicArtwork;
    onClose: () => void;
    isLiked: boolean;
    isBookmarked: boolean;
    onLike: () => void;
    onBookmark: () => void;
}) {
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const formattedDate = new Date(artwork.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className="relative flex-1 min-h-64 md:min-h-0 bg-surface-container">
                    <Image
                        src={artwork.image_url}
                        alt={getSketchTitle(artwork.sketch_id)}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                        quality={95}
                        priority
                    />
                </div>

                {/* Details Sidebar */}
                <div className="w-full md:w-72 p-5 flex flex-col border-t md:border-t-0 md:border-l border-surface-container-high">
                    {/* Title */}
                    <h3 className="text-xl font-headline font-bold mb-2">
                        {getSketchTitle(artwork.sketch_id)}
                    </h3>

                    {/* Artist */}
                    <Link
                        href={`/profile/${artwork.user_id}`}
                        className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                        onClick={onClose}
                    >
                        {artwork.artist_avatar ? (
                            <Image
                                src={artwork.artist_avatar}
                                alt={artwork.artist_name}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-sm">🎨</span>
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-sm">{artwork.artist_name}</p>
                            <p className="text-xs text-on-surface-variant">{formattedDate}</p>
                        </div>
                    </Link>

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 border-t border-b border-surface-container-high mb-4">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-error text-error" : ""}`} />
                            <span className="text-sm font-medium">{artwork.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                            <span className="text-sm font-medium">{artwork.saves_count || 0}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                        <Button
                            variant={isLiked ? "primary" : "secondary"}
                            size="md"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={onLike}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                            {isLiked ? "Liked" : "Like"}
                        </Button>
                        <Button
                            variant={isBookmarked ? "primary" : "secondary"}
                            size="md"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={onBookmark}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                            {isBookmarked ? "Saved" : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
