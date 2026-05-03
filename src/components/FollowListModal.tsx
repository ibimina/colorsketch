"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import {
    listFollowers,
    listFollowing,
    followUser,
    unfollowUser,
} from "@/lib/actions";

type Mode = "followers" | "following";

interface FollowUser {
    id: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    isFollowing: boolean;
    isSelf: boolean;
}

export function FollowListModal({
    userId,
    mode,
    onClose,
}: {
    userId: string;
    mode: Mode;
    onClose: () => void;
}) {
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pending, setPending] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            const data = mode === "followers"
                ? await listFollowers(userId)
                : await listFollowing(userId);
            if (cancelled) return;
            setUsers(data as FollowUser[]);
            setIsLoading(false);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [userId, mode]);

    const toggleFollow = async (target: FollowUser) => {
        if (pending[target.id] || target.isSelf) return;
        setPending((p) => ({ ...p, [target.id]: true }));
        const wasFollowing = target.isFollowing;
        // Optimistic
        setUsers((list) =>
            list.map((u) =>
                u.id === target.id ? { ...u, isFollowing: !wasFollowing } : u
            )
        );
        const result = wasFollowing
            ? await unfollowUser(target.id)
            : await followUser(target.id);
        if (!result.success) {
            setUsers((list) =>
                list.map((u) =>
                    u.id === target.id ? { ...u, isFollowing: wasFollowing } : u
                )
            );
        }
        setPending((p) => ({ ...p, [target.id]: false }));
    };

    const title = mode === "followers" ? "Followers" : "Following";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                    <h2 className="text-lg font-headline font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 text-on-surface-variant">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <p className="text-4xl mb-3">
                                {mode === "followers" ? "👀" : "🧭"}
                            </p>
                            <p className="font-headline font-bold mb-1">
                                {mode === "followers"
                                    ? "No followers yet"
                                    : "Not following anyone yet"}
                            </p>
                            <p className="text-on-surface-variant text-sm">
                                {mode === "followers"
                                    ? "Share your art to attract followers."
                                    : "Find artists to follow on the Community Gallery."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-outline-variant">
                            {users.map((u) => (
                                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                                    <Link
                                        href={`/profile/${u.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                    >
                                        {u.avatar_url ? (
                                            <Image
                                                src={u.avatar_url}
                                                alt={u.name || "Artist"}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-lg">🎨</span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {u.name || "Anonymous Artist"}
                                            </p>
                                            {u.bio && (
                                                <p className="text-xs text-on-surface-variant truncate">
                                                    {u.bio}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                    {!u.isSelf && (
                                        <Button
                                            size="sm"
                                            variant={u.isFollowing ? "outline" : "primary"}
                                            disabled={pending[u.id]}
                                            onClick={() => toggleFollow(u)}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {u.isFollowing ? (
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                ) : (
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                )}
                                                {u.isFollowing ? "Following" : "Follow"}
                                            </span>
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
