"use client";

import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { useProgressStore } from "@/stores/progressStore";
import { Emojis } from "@/lib/icons";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useEffect, useMemo } from "react";
import { Leaderboard } from "@/components/Leaderboard";

export default function HomePage() {
    // No dummy data - ready for real data integration
    const recentSketches: any[] = [];
    const dailyTip = "";
    const { level, xp, xpToNextLevel, streak, totalSketches, achievements, checkStreak } = useProgressStore();

    // Check streak on page load
    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    // Convert achievement IDs to full achievement objects
    const unlockedAchievements = useMemo(() => {
        return achievements
            .map(id => ACHIEVEMENTS.find(a => a.id === id))
            .filter(Boolean);
    }, [achievements]);

    const xpProgress = (xp / xpToNextLevel) * 100;
    const hasProgress = level > 1 || totalSketches > 0 || streak > 0;

    return (
        <div className="space-y-8 pb-20 lg:pb-0">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">
                    Welcome back, Artist! 👋
                </h1>
                <p className="text-on-surface-variant">
                    {hasProgress
                        ? `Level ${level} • ${totalSketches} ${totalSketches === 1 ? 'artwork' : 'artworks'} completed`
                        : "Start your creative journey today"
                    }
                </p>
            </div>

            {/* Hero Section - Featured Sketch */}
            <section>
                <Card
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden bg-linear-to-br from-primary/5 via-secondary/5 to-tertiary/5"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Artwork Preview */}
                        <div className="aspect-square md:aspect-auto bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4 sm:p-8">
                            <div className="text-center space-y-4">
                                <div className="text-6xl sm:text-7xl md:text-8xl">🎨</div>
                                <p className="text-base sm:text-lg font-headline text-on-surface-variant">
                                    Hundreds of sketches waiting
                                </p>
                            </div>
                        </div>

                        {/* CTA Content */}
                        <div className="p-6 sm:p-8 flex flex-col justify-center space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-headline font-bold mb-2">
                                    Ready to Create?
                                </h2>
                                <p className="text-on-surface-variant mb-6">
                                    Browse our library of beautiful sketches and bring them to life with your unique color choices.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/library" className="flex-1">
                                    <Button variant="primary" size="lg" className="w-full">
                                        ✨ Start Coloring
                                    </Button>
                                </Link>
                                <Link href="/explore" className="flex-1">
                                    <Button variant="secondary" size="lg" className="w-full">
                                        🔍 Explore Sketches
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Progress Section - Only show if user has activity */}
            {hasProgress && (
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Level & XP Card */}
                    <Card variant="elevated" className="bg-linear-to-br from-primary/10 to-secondary/10">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-on-surface-variant">Current Level</p>
                                <p className="text-3xl sm:text-4xl font-headline font-bold text-primary">
                                    {level}
                                </p>
                            </div>
                            <div className="text-4xl sm:text-5xl">{Emojis.achievement}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">XP Progress</span>
                                <span className="font-headline font-bold">
                                    {xp} / {xpToNextLevel}
                                </span>
                            </div>
                            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Streak & Stats Card */}
                    <Card variant="elevated" className="bg-linear-to-br from-tertiary/10 to-error/10">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl sm:text-3xl">{Emojis.streak}</span>
                                    <div>
                                        <p className="text-sm text-on-surface-variant">Streak</p>
                                        <p className="text-2xl sm:text-3xl font-headline font-bold text-error">
                                            {streak}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-on-surface-variant">
                                    {streak > 0 ? 'Days in a row! 🎉' : 'Start your streak today!'}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl sm:text-3xl">{Emojis.star}</span>
                                    <div>
                                        <p className="text-sm text-on-surface-variant">Sketches</p>
                                        <p className="text-2xl sm:text-3xl font-headline font-bold text-tertiary">
                                            {totalSketches}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-on-surface-variant">
                                    Total completed
                                </p>
                            </div>
                        </div>
                    </Card>
                </section>
            )}

            {/* Achievements Section (if any unlocked) */}
            {unlockedAchievements.length > 0 && (
                <section>
                    <h2 className="text-lg sm:text-xl font-headline font-bold mb-4 flex items-center gap-2">
                        <span>Recent Achievements</span>
                        <span className="text-xl sm:text-2xl">{Emojis.achievement}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {unlockedAchievements.slice(0, 3).map((achievement) => (
                            <Card
                                key={achievement!.id}
                                variant="filled"
                                className="bg-primary-container/20 border-2 border-primary/30"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl sm:text-3xl">{achievement!.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-headline font-bold text-sm">{achievement!.title}</p>
                                        <p className="text-xs text-on-surface-variant">{achievement!.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Leaderboard Section */}
            <section>
                <Leaderboard limit={5} showPeriodToggle={true} />
            </section>

            {/* Continue Coloring */}
            {recentSketches.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-headline font-bold">Continue Coloring</h2>
                        <Link href="/gallery" className="text-primary font-headline font-medium text-sm">
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentSketches.map((sketch) => (
                            <Card key={sketch.id} variant="elevated" padding="none" className="overflow-hidden">
                                <div className="aspect-video bg-surface-container flex items-center justify-center">
                                    <span className="text-4xl opacity-40">🎨</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-headline font-bold">{sketch.title}</h3>
                                    <p className="text-sm text-on-surface-variant mb-3">{sketch.category}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${sketch.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-headline font-medium text-on-surface-variant">
                                            {sketch.progress}%
                                        </span>
                                    </div>
                                    <Link href={`/canvas/${sketch.id}`} className="block mt-3">
                                        <Button variant="primary" size="sm" className="w-full">
                                            Continue
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Daily Tip - only shown when there's a tip */}
            {dailyTip && (
                <Card variant="filled" className="bg-primary-container/30 border-l-4 border-primary">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="font-headline font-bold text-primary">Daily Tip</h3>
                            <p className="text-on-surface-variant">{dailyTip}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
