"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { useProgressStore } from "@/stores/progressStore";
import { useColoringStore } from "@/stores/coloringStore";
import { Emojis } from "@/lib/icons";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { sketches } from "@/data/sketches";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Palette, TrendingUp, Clock, ChevronRight, Flame, Star, Zap } from "lucide-react";

export default function HomePage() {
    const { level, xp, xpToNextLevel, streak, totalSketches, achievements, checkStreak } = useProgressStore();
    const { savedProgress } = useColoringStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkStreak();
    }, [checkStreak]);

    // Get a featured sketch (random but consistent per day)
    const featuredSketch = useMemo(() => {
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return sketches[seed % sketches.length];
    }, []);

    // Get in-progress sketches
    const inProgressSketches = useMemo(() => {
        const progressList = Object.entries(savedProgress)
            .filter(([, progress]) => Object.keys(progress.fills).length > 0)
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
    }, [savedProgress]);

    const unlockedAchievements = useMemo(() => {
        return achievements
            .map(id => ACHIEVEMENTS.find(a => a.id === id))
            .filter(Boolean)
            .slice(0, 4);
    }, [achievements]);

    const xpProgress = (xp / xpToNextLevel) * 100;

    // Quick stats for the compact bar
    const stats = [
        { icon: <Zap className="w-4 h-4" />, value: level, label: "Level", color: "text-amber-500" },
        { icon: <Flame className="w-4 h-4" />, value: streak, label: "Streak", color: "text-orange-500" },
        { icon: <Star className="w-4 h-4" />, value: totalSketches, label: "Complete", color: "text-purple-500" },
    ];

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Compact Progress Bar */}
            <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl">
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
                    {/* Sketch Preview */}
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

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                        <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                            {featuredSketch?.category}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-headline font-bold mb-3">
                            {featuredSketch?.title}
                        </h1>
                        <p className="text-on-surface-variant mb-6 text-sm md:text-base">
                            Bring this beautiful sketch to life with your unique color palette. Express yourself and share your creation with the community!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href={`/canvas/${featuredSketch?.id}`}>
                                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                                    <Palette className="w-4 h-4" />
                                    Color This
                                </Button>
                            </Link>
                            <Link href="/library">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                                    Browse Library
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Continue Coloring - Show first if there's progress */}
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
                                        {/* Progress overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${sketch.progress}%` }}
                                            />
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

            {/* Quick Actions Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/library">
                    <Card variant="filled" className="text-center hover:shadow-md transition-all cursor-pointer h-full bg-linear-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-0">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="font-headline font-bold text-sm">Library</p>
                        <p className="text-xs text-on-surface-variant">{sketches.length} sketches</p>
                    </Card>
                </Link>
                <Link href="/explore">
                    <Card variant="filled" className="text-center hover:shadow-md transition-all cursor-pointer h-full bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-0">
                        <div className="text-3xl mb-2">🌟</div>
                        <p className="font-headline font-bold text-sm">Explore</p>
                        <p className="text-xs text-on-surface-variant">Community art</p>
                    </Card>
                </Link>
                <Link href="/favorites">
                    <Card variant="filled" className="text-center hover:shadow-md transition-all cursor-pointer h-full bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
                        <div className="text-3xl mb-2">❤️</div>
                        <p className="font-headline font-bold text-sm">Favorites</p>
                        <p className="text-xs text-on-surface-variant">Your collection</p>
                    </Card>
                </Link>
                <Link href="/leaderboard">
                    <Card variant="filled" className="text-center hover:shadow-md transition-all cursor-pointer h-full bg-linear-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-0">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="font-headline font-bold text-sm">Leaderboard</p>
                        <p className="text-xs text-on-surface-variant">Top artists</p>
                    </Card>
                </Link>
            </section>

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
                            <Card
                                key={achievement!.id}
                                variant="elevated"
                                className="shrink-0 w-40 lg:w-auto flex items-center gap-3 hover:bg-surface-container/50 transition-colors"
                            >
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

            {/* Inspirational Footer */}
            <section className="text-center py-8 px-4 bg-linear-to-r from-primary/5 via-secondary/5 to-tertiary/5 rounded-2xl">
                <p className="text-4xl mb-3">✨</p>
                <p className="font-headline font-bold text-lg mb-1">Every color tells a story</p>
                <p className="text-on-surface-variant text-sm">Keep creating and sharing your unique artwork</p>
            </section>
        </div>
    );
}
