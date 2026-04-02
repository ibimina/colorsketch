"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/actions";
import { Crown, Flame, Medal, Star, TrendingUp, User } from "lucide-react";

interface LeaderboardProps {
  limit?: number;
  showPeriodToggle?: boolean;
  className?: string;
  defaultPeriod?: "daily" | "weekly" | "all-time";
  title?: string;
}

export function Leaderboard({
  limit = 10,
  showPeriodToggle = true,
  className = "",
  defaultPeriod = "all-time",
  title = "Leaderboard",
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "all-time">(defaultPeriod);

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      const data = await getLeaderboard(limit, period);
      setEntries(data);
      setIsLoading(false);
    }
    loadLeaderboard();
  }, [limit, period]);

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2)
      return <Medal className="h-5 w-5 text-gray-400 fill-gray-400" />;
    if (rank === 3)
      return <Medal className="h-5 w-5 text-orange-400 fill-orange-400" />;
    return <span className="text-gray-500 font-medium w-5 text-center">{rank}</span>;
  };

  const getRankBgColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700";
    if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    if (rank === 2) return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
    if (rank === 3) return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    return "bg-white dark:bg-gray-800/30 border-gray-100 dark:border-gray-700";
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {showPeriodToggle && (
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                period === "daily"
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                period === "weekly"
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("all-time")}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                period === "all-time"
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              All Time
            </button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No artists yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-transform hover:scale-[1.02] ${getRankBgColor(
                entry.rank,
                entry.isCurrentUser
              )}`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>

              <div className="relative">
                {entry.avatarUrl ? (
                  <img
                    src={entry.avatarUrl}
                    alt={entry.name || "Artist"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {(entry.name || "A")[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {entry.level}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`font-semibold truncate ${
                      entry.isCurrentUser
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {entry.name || "Anonymous Artist"}
                  </p>
                  {entry.isCurrentUser && (
                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {entry.totalXP.toLocaleString()} XP
                  </span>
                  {entry.streak > 0 && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {entry.streak}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
