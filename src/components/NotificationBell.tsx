"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";
import {
    listNotifications,
    markNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    type NotificationRow,
    type NotificationType,
} from "@/lib/actions";

// Fallback poll if realtime drops (firewalls, sleeping tab waking)
const REFRESH_MS = 5 * 60_000;

const dotClass: Record<NotificationType, string> = {
    like: "bg-rose-500",
    save: "bg-amber-500",
    follow: "bg-primary",
    repost: "bg-sky-500",
    comment: "bg-violet-500",
    level_up: "bg-emerald-500",
    achievement: "bg-amber-500",
    system: "bg-on-surface-variant",
};

function describe(n: NotificationRow): { title: string; href?: string } {
    const actor = n.actor_name || "Someone";
    switch (n.type) {
        case "like":
            return {
                title: `${actor} liked your artwork`,
                href: n.target_id ? `/profile/${n.actor_id ?? ""}` : undefined,
            };
        case "save":
            return {
                title: `${actor} saved your artwork`,
                href: n.target_id ? `/profile/${n.actor_id ?? ""}` : undefined,
            };
        case "follow":
            return {
                title: `${actor} followed you`,
                href: n.actor_id ? `/profile/${n.actor_id}` : undefined,
            };
        case "repost":
            return {
                title: `${actor} reposted your artwork`,
                href: n.actor_id ? `/profile/${n.actor_id}` : undefined,
            };
        case "comment": {
            const preview = (n.payload?.preview as string | undefined) || "";
            return {
                title: preview
                    ? `${actor} commented: “${preview}”`
                    : `${actor} commented on your artwork`,
                href: n.actor_id ? `/profile/${n.actor_id}` : undefined,
            };
        }
        case "level_up":
            return { title: `You leveled up!` };
        case "achievement":
            return {
                title: (n.payload?.title as string) || "New achievement unlocked",
            };
        default:
            return {
                title: (n.payload?.title as string) || "Notification",
            };
    }
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<NotificationRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const list = await listNotifications(30);
            setItems(list);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load + slow fallback poll
    useEffect(() => {
        refresh();
        const id = setInterval(refresh, REFRESH_MS);
        return () => clearInterval(id);
    }, [refresh]);

    // Realtime subscription on the notifications table for the current user
    useEffect(() => {
        const supabase = createClient();
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let cancelled = false;

        async function subscribe() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || cancelled) return;

            channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => {
                        // Re-fetch to hydrate actor profile fields
                        refresh();
                    },
                )
                .subscribe();
        }

        subscribe();
        return () => {
            cancelled = true;
            if (channel) supabase.removeChannel(channel);
        };
    }, [refresh]);

    // When opening, mark unread items as read
    useEffect(() => {
        if (!isOpen) return;
        const unread = items.filter((n) => !n.read_at).map((n) => n.id);
        if (unread.length === 0) return;
        const optimistic = items.map((n) =>
            n.read_at ? n : { ...n, read_at: new Date().toISOString() }
        );
        setItems(optimistic);
        markNotificationsRead(unread).catch(() => { });
    }, [isOpen, items]);

    const unreadCount = items.filter((n) => !n.read_at).length;

    const handleDismiss = async (id: string) => {
        setItems((curr) => curr.filter((n) => n.id !== id));
        await deleteNotification(id);
    };

    const handleClearAll = async () => {
        setItems([]);
        await clearAllNotifications();
    };

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="Notifications"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((v) => !v)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            >
                <Icons.Notification className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-error text-on-error text-[10px] font-semibold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                    />
                    <div
                        role="dialog"
                        aria-label="Notifications"
                        className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] bg-surface border border-surface-variant/30 rounded-2xl shadow-xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-variant/30">
                            <h2 className="text-sm font-headline font-semibold">Notifications</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={refresh}
                                    className="text-xs text-on-surface-variant hover:underline"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Refreshing..." : "Refresh"}
                                </button>
                                {items.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearAll}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="px-4 py-10 text-center text-sm text-on-surface-variant">
                                    {isLoading ? "Loading..." : "You're all caught up."}
                                </div>
                            ) : (
                                <ul className="divide-y divide-surface-variant/20">
                                    {items.map((n) => {
                                        const { title, href } = describe(n);
                                        const isUnread = !n.read_at;
                                        const Row = (
                                            <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors">
                                                {n.actor_avatar ? (
                                                    <Image
                                                        src={n.actor_avatar}
                                                        alt=""
                                                        width={36}
                                                        height={36}
                                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotClass[n.type]}`}
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm truncate ${isUnread ? "font-semibold" : "text-on-surface-variant"}`}
                                                    >
                                                        {title}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                                        {timeAgo(n.created_at)}
                                                    </p>
                                                </div>
                                                {isUnread && (
                                                    <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                                                )}
                                                <button
                                                    type="button"
                                                    aria-label="Dismiss notification"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDismiss(n.id);
                                                    }}
                                                    className="text-on-surface-variant hover:text-on-surface text-lg leading-none px-1 shrink-0"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                        return (
                                            <li key={n.id}>
                                                {href ? (
                                                    <Link
                                                        href={href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block"
                                                    >
                                                        {Row}
                                                    </Link>
                                                ) : (
                                                    Row
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
