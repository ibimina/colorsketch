"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, ColoredSketchPreview } from "@/components/ui";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { useSketchProgress } from "@/hooks";
import { notify } from "@/stores/notificationsStore";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { Sketch } from "@/types";

// Import sketch data (should ideally be in a shared file)
const sampleSketches: Sketch[] = [
    { id: "butterfly", title: "Monarch Butterfly", category: "animals", difficulty: "medium", estimatedMinutes: 20, thumbnail: "/sketches/butterfly.svg", svgContent: "", regions: [], tags: ["Animals", "Nature"], isNew: true, isFeatured: true, createdAt: new Date() },
    { id: "hummingbird", title: "Hummingbird Garden", category: "animals", difficulty: "hard", estimatedMinutes: 40, thumbnail: "/sketches/hummingbird.svg", svgContent: "", regions: [], tags: ["Animals", "Birds"], isFeatured: true, createdAt: new Date() },
    { id: "koi-fish", title: "Japanese Koi", category: "animals", difficulty: "hard", estimatedMinutes: 45, thumbnail: "/sketches/koi-fish.svg", svgContent: "", regions: [], tags: ["Animals", "Japanese"], createdAt: new Date() },
    { id: "owl", title: "Wise Owl", category: "animals", difficulty: "medium", estimatedMinutes: 30, thumbnail: "/sketches/owl.svg", svgContent: "", regions: [], tags: ["Animals", "Wildlife"], createdAt: new Date() },
    { id: "fox", title: "Woodland Fox", category: "animals", difficulty: "medium", estimatedMinutes: 30, thumbnail: "/sketches/fox.svg", svgContent: "", regions: [], tags: ["Animals", "Wildlife"], isEditorChoice: true, createdAt: new Date() },
    { id: "elephant", title: "Baby Elephant", category: "animals", difficulty: "easy", estimatedMinutes: 20, thumbnail: "/sketches/elephant.svg", svgContent: "", regions: [], tags: ["Animals", "Safari"], isNew: true, createdAt: new Date() },
    { id: "peacock", title: "Majestic Peacock", category: "animals", difficulty: "hard", estimatedMinutes: 50, thumbnail: "/sketches/peacock.svg", svgContent: "", regions: [], tags: ["Animals", "Birds"], createdAt: new Date() },
    { id: "dolphin", title: "Playful Dolphins", category: "animals", difficulty: "medium", estimatedMinutes: 35, thumbnail: "/sketches/dolphin.svg", svgContent: "", regions: [], tags: ["Animals", "Ocean"], createdAt: new Date() },
    { id: "cat", title: "Curious Cat", category: "animals", difficulty: "easy", estimatedMinutes: 15, thumbnail: "/sketches/cat.svg", svgContent: "", regions: [], tags: ["Animals", "Pets"], createdAt: new Date() },
    { id: "horse", title: "Wild Horse", category: "animals", difficulty: "hard", estimatedMinutes: 45, thumbnail: "/sketches/horse.svg", svgContent: "", regions: [], tags: ["Animals", "Nature"], createdAt: new Date() },
    { id: "rabbit", title: "Spring Bunny", category: "animals", difficulty: "easy", estimatedMinutes: 15, thumbnail: "/sketches/rabbit.svg", svgContent: "", regions: [], tags: ["Animals", "Cute"], isEditorChoice: true, createdAt: new Date() },
    { id: "flamingo", title: "Tropical Flamingo", category: "animals", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/flamingo.svg", svgContent: "", regions: [], tags: ["Animals", "Birds"], createdAt: new Date() },
    { id: "octopus", title: "Cute Octopus", category: "animals", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/octopus.svg", svgContent: "", regions: [], tags: ["Animals", "Ocean"], isNew: true, createdAt: new Date() },
    { id: "rose", title: "Elegant Rose", category: "botanical", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/rose.svg", svgContent: "", regions: [], tags: ["Botanical", "Flowers"], isNew: true, createdAt: new Date() },
    { id: "lotus", title: "Lotus Bloom", category: "botanical", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/lotus.svg", svgContent: "", regions: [], tags: ["Botanical", "Meditation"], createdAt: new Date() },
    { id: "sunflower", title: "Sunny Sunflower", category: "botanical", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/sunflower.svg", svgContent: "", regions: [], tags: ["Botanical", "Flowers"], isFeatured: true, createdAt: new Date() },
    { id: "cherry-blossom", title: "Cherry Blossom Branch", category: "botanical", difficulty: "hard", estimatedMinutes: 40, thumbnail: "/sketches/cherry-blossom.svg", svgContent: "", regions: [], tags: ["Botanical", "Japanese"], isEditorChoice: true, createdAt: new Date() },
    { id: "unicorn", title: "Magical Unicorn", category: "fantasy", difficulty: "medium", estimatedMinutes: 30, thumbnail: "/sketches/unicorn.svg", svgContent: "", regions: [], tags: ["Fantasy", "Magic"], isNew: true, isFeatured: true, createdAt: new Date() },
    { id: "dragon", title: "Friendly Dragon", category: "fantasy", difficulty: "hard", estimatedMinutes: 45, thumbnail: "/sketches/dragon.svg", svgContent: "", regions: [], tags: ["Fantasy", "Mythical"], createdAt: new Date() },
    { id: "mermaid", title: "Ocean Mermaid", category: "fantasy", difficulty: "hard", estimatedMinutes: 40, thumbnail: "/sketches/mermaid.svg", svgContent: "", regions: [], tags: ["Fantasy", "Ocean"], isEditorChoice: true, createdAt: new Date() },
    { id: "phoenix", title: "Rising Phoenix", category: "fantasy", difficulty: "hard", estimatedMinutes: 50, thumbnail: "/sketches/phoenix.svg", svgContent: "", regions: [], tags: ["Fantasy", "Mythical"], createdAt: new Date() },
    { id: "mandala-flower", title: "Flower Mandala", category: "mandalas", difficulty: "medium", estimatedMinutes: 35, thumbnail: "/sketches/mandala-flower.svg", svgContent: "", regions: [], tags: ["Mandalas", "Meditation"], createdAt: new Date() },
    { id: "mandala-geometric", title: "Sacred Geometry", category: "mandalas", difficulty: "hard", estimatedMinutes: 45, thumbnail: "/sketches/mandala-geometric.svg", svgContent: "", regions: [], tags: ["Mandalas", "Geometric"], isFeatured: true, createdAt: new Date() },
    { id: "mandala-sun", title: "Sun Mandala", category: "mandalas", difficulty: "medium", estimatedMinutes: 30, thumbnail: "/sketches/mandala-sun.svg", svgContent: "", regions: [], tags: ["Mandalas", "Celestial"], createdAt: new Date() },
    { id: "geometric-lion", title: "Geometric Lion", category: "geometric", difficulty: "hard", estimatedMinutes: 40, thumbnail: "/sketches/geometric-lion.svg", svgContent: "", regions: [], tags: ["Geometric", "Animals"], isEditorChoice: true, createdAt: new Date() },
    { id: "geometric-wolf", title: "Poly Wolf", category: "geometric", difficulty: "medium", estimatedMinutes: 35, thumbnail: "/sketches/geometric-wolf.svg", svgContent: "", regions: [], tags: ["Geometric", "Animals"], createdAt: new Date() },
    { id: "abstract-waves", title: "Ocean Waves", category: "abstract", difficulty: "easy", estimatedMinutes: 20, thumbnail: "/sketches/abstract-waves.svg", svgContent: "", regions: [], tags: ["Abstract", "Ocean"], createdAt: new Date() },
    { id: "abstract-flow", title: "Flowing Lines", category: "abstract", difficulty: "medium", estimatedMinutes: 25, thumbnail: "/sketches/abstract-flow.svg", svgContent: "", regions: [], tags: ["Abstract", "Modern"], isFeatured: true, createdAt: new Date() },
];

const PREMIUM_UNLOCK_LEVEL = 5;

export default function FavoritesPage() {
    const { favorites, loadFavorites, toggle: toggleFavorite } = useFavoritesStore();
    const { level } = useProgressStore();
    const { progressMap } = useSketchProgress();

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const isFavorited = (sketchId: string) => favorites.includes(sketchId);

    const handleFavoriteClick = (e: React.MouseEvent, sketchId: string, sketchTitle: string) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(sketchId);
        notify.success("Removed from favorites", sketchTitle);
    };

    const getProgressStatus = (sketchId: string) => {
        const progress = progressMap[sketchId];
        if (!progress) return "not-started";
        if (progress.completed_at) return "completed";
        const fillCount = Object.keys(progress.fills || {}).filter(k => k !== "background").length;
        return fillCount > 0 ? "in-progress" : "not-started";
    };

    const isSketchLocked = (sketch: Sketch): boolean => {
        const isPremium = Boolean(sketch.isFeatured || sketch.isEditorChoice);
        return isPremium && level < PREMIUM_UNLOCK_LEVEL;
    };

    const getButtonText = (sketchId: string, isLocked: boolean) => {
        if (isLocked) return `🔒 Unlock at Level ${PREMIUM_UNLOCK_LEVEL}`;
        const status = getProgressStatus(sketchId);
        if (status === "completed") return "View Artwork";
        if (status === "in-progress") return "Continue";
        return "Start Coloring";
    };

    // Filter sketches to only show favorites
    const favoriteSketches = sampleSketches.filter(sketch => favorites.includes(sketch.id));

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
            ) : (
                /* Favorites Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {favoriteSketches.map((sketch) => {
                        const progress = progressMap[sketch.id];
                        const status = getProgressStatus(sketch.id);
                        const hasProgress = progress && Object.keys(progress.fills || {}).length > 0;
                        const isLocked = isSketchLocked(sketch);

                        return (
                            <Card
                                key={sketch.id}
                                variant="elevated"
                                padding="none"
                                className="overflow-hidden transition-transform"
                            >
                                <Link
                                    href={isLocked ? "#" : `/canvas/${sketch.id}`}
                                    onClick={(e) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            notify.info("Premium Sketch", `Reach Level ${PREMIUM_UNLOCK_LEVEL} to unlock!`);
                                        }
                                    }}
                                    className={`block hover:scale-[1.01] transition-transform ${isLocked ? "cursor-not-allowed" : ""}`}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-square bg-surface-container-low flex items-center justify-center">
                                        {hasProgress ? (
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
                                            onClick={(e) => handleFavoriteClick(e, sketch.id, sketch.title)}
                                            className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 bg-red-500 text-white shadow-lg hover:bg-red-600"
                                            aria-label="Remove from favorites"
                                        >
                                            <Heart className="w-4 h-4 fill-current" />
                                        </button>

                                        {/* Badges */}
                                        <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end">
                                            {status === "in-progress" && (
                                                <span className="bg-yellow-500 text-white text-xs font-headline font-bold px-2 py-1 rounded-full">
                                                    In Progress
                                                </span>
                                            )}
                                            {sketch.isFeatured && (
                                                <span className="bg-secondary text-white text-xs font-headline font-bold px-2 py-1 rounded-full">
                                                    ⭐
                                                </span>
                                            )}
                                            {sketch.isEditorChoice && (
                                                <span className="bg-tertiary text-white text-xs font-headline font-bold px-2 py-1 rounded-full">
                                                    👑
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-headline font-bold mb-1 truncate">{sketch.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
                                            <span className="capitalize">{sketch.difficulty}</span>
                                            <span>•</span>
                                            {status === "completed" ? (
                                                <span className="text-green-600 font-medium">Completed ✓</span>
                                            ) : (
                                                <span>~{sketch.estimatedMinutes} min</span>
                                            )}
                                        </div>
                                        <Button
                                            variant={isLocked ? "secondary" : status === "completed" ? "secondary" : "primary"}
                                            size="sm"
                                            className={`w-full text-sm ${isLocked ? "opacity-70" : ""}`}
                                        >
                                            {getButtonText(sketch.id, isLocked)}
                                        </Button>
                                    </div>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
