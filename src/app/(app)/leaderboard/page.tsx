"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, getUserRank, type LeaderboardEntry } from "@/lib/actions";
import { Crown, Flame, Medal, Star, Trophy, TrendingUp, User, ArrowLeft } from "lucide-react";

type Period = "daily" | "weekly" | "all-time";

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<Period>("all-time");
    const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number } | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [leaderboardData, rankData] = await Promise.all([
                getLeaderboard(50, period),
                getUserRank()
            ]);
            setEntries(leaderboardData);
            setUserRank(rankData);
            setIsLoading(false);
        }
        loadData();
    }, [period]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400 fill-yellow-400" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-orange-400 fill-orange-400" />;
        return <span className="text-gray-500 font-bold text-lg w-6 text-center">{rank}</span>;
    };

    const getRankBgColor = (rank: number, isCurrentUser: boolean) => {
        if (isCurrentUser) return "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700";
        if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
        if (rank === 2) return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
        if (rank === 3) return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
        return "bg-white dark:bg-gray-800/30 border-gray-100 dark:border-gray-700";
    };

    const tabs: { id: Period; label: string; description: string }[] = [
        { id: "daily", label: "Today", description: "Artists active today" },
        { id: "weekly", label: "This Week", description: "Top performers this week" },
        { id: "all-time", label: "All Time", description: "Legends of ColorSketch" },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <h1 className="text-3xl sm:text-4xl font-headline font-bold">Leaderboard</h1>
                </div>
                <p className="text-on-surface-variant text-lg">
                    See how you stack up against other artists
                </p>
            </div>

            {/* User's Rank Card */}
            {userRank && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">Your Global Rank</p>
                            <p className="text-4xl font-bold">#{userRank.rank}</p>
                            <p className="text-purple-200 text-sm mt-1">
                                out of {userRank.totalUsers.toLocaleString()} artists
                            </p>
                        </div>
                        <div className="text-6xl opacity-30">
                            <Trophy />
                        </div>
                    </div>
                </div>
            )}

            {/* Period Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-surface-container-low rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setPeriod(tab.id)}
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-headline font-medium transition-all ${
                            period === tab.id
                                ? "bg-primary text-white shadow-md"
                                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        }`}
                    >
                        <span className="block text-sm sm:text-base">{tab.label}</span>
                        <span className={`hidden sm:block text-xs mt-0.5 ${
                            period === tab.id ? "text-white/80" : "text-on-surface-variant/70"
                        }`}>
                            {tab.description}
                        </span>
                    </button>
                ))}
            </div>

            {/* Leaderboard List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 bg-surface-container-low rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-2xl">
                    <User className="h-16 w-16 mx-auto text-on-surface-variant/30 mb-4" />
                    <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
                        No artists yet
                    </h3>
                    <p className="text-on-surface-variant">
                        {period === "daily"
                            ? "Be the first to color today!"
                            : period === "weekly"
                            ? "No activity this week yet. Start coloring!"
                            : "Start your creative journey to appear here!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {entries.map((entry) => (
                        <div
                            key={entry.userId}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${getRankBgColor(
                                entry.rank,
                                entry.isCurrentUser
                            )}`}
                        >
                            {/* Rank */}
                            <div className="flex items-center justify-center w-10">
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="relative shrink-0">
                                {entry.avatarUrl ? (
                                    <img
                                        src={entry.avatarUrl}
                                        alt={entry.name || "Artist"}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                        {(entry.name || "A")[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    Lv.{entry.level}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p
                                        className={`font-headline font-bold truncate ${
                                            entry.isCurrentUser
                                                ? "text-purple-700 dark:text-purple-300"
                                                : "text-on-surface dark:text-white"
                                        }`}
                                    >
                                        {entry.name || "Anonymous Artist"}
                                    </p>
                                    {entry.isCurrentUser && (
                                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full shrink-0">
                                            You
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                                    <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        {entry.totalXP.toLocaleString()} XP
                                    </span>
                                    {entry.streak > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            {entry.streak} day streak
                                        </span>
                                    )}
                                    <span className="hidden sm:flex items-center gap-1">
                                        🎨 {entry.totalSketches} sketches
                                    </span>
                                </div>
                            </div>

                            {/* XP Badge (Mobile) */}
                            <div className="sm:hidden text-right">
                                <p className="text-lg font-bold text-primary">{entry.totalXP.toLocaleString()}</p>
                                <p className="text-xs text-on-surface-variant">XP</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
