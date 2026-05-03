"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import {
    listComments,
    addComment,
    deleteComment,
    getCurrentUserId,
    type CommentRow,
} from "@/lib/actions";

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

export function ArtworkComments({
    artworkId,
    artworkOwnerId,
    onCountChange,
    closeOnNavigate,
}: {
    artworkId: string;
    artworkOwnerId: string;
    onCountChange?: (delta: number) => void;
    closeOnNavigate?: () => void;
}) {
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meId, setMeId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            const [list, me] = await Promise.all([
                listComments(artworkId),
                getCurrentUserId(),
            ]);
            if (cancelled) return;
            setComments(list);
            setMeId(me);
            setIsLoading(false);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [artworkId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = draft.trim();
        if (!body || isPosting) return;
        setIsPosting(true);
        setError(null);
        const result = await addComment(artworkId, body);
        setIsPosting(false);
        if (result.error || !result.comment) {
            setError(result.error ?? "Failed to add comment");
            return;
        }
        setComments((curr) => [...curr, result.comment!]);
        setDraft("");
        onCountChange?.(1);
    };

    const handleDelete = async (id: string) => {
        const prev = comments;
        setComments((curr) => curr.filter((c) => c.id !== id));
        const result = await deleteComment(id);
        if (result.error) {
            setComments(prev);
            return;
        }
        onCountChange?.(-1);
    };

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-headline font-semibold">
                Comments ({comments.length})
            </h4>

            {isLoading ? (
                <div className="flex items-center justify-center py-6 text-on-surface-variant">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-2">
                    Be the first to comment.
                </p>
            ) : (
                <ul className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {comments.map((c) => {
                        const canDelete = meId === c.user_id || meId === artworkOwnerId;
                        return (
                            <li key={c.id} className="flex items-start gap-2.5">
                                <Link
                                    href={`/profile/${c.user_id}`}
                                    onClick={closeOnNavigate}
                                    className="shrink-0 hover:opacity-80 transition-opacity"
                                >
                                    {c.author_avatar ? (
                                        <Image
                                            src={c.author_avatar}
                                            alt={c.author_name || "Artist"}
                                            width={28}
                                            height={28}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs">🎨</span>
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <Link
                                            href={`/profile/${c.user_id}`}
                                            onClick={closeOnNavigate}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            {c.author_name || "Anonymous Artist"}
                                        </Link>
                                        <span className="text-xs text-on-surface-variant">
                                            {timeAgo(c.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                        {c.body}
                                    </p>
                                </div>
                                {canDelete && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(c.id)}
                                        className="shrink-0 p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
                                        title="Delete comment"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {meId ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t border-surface-container-high">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Add a comment..."
                        maxLength={500}
                        rows={2}
                        className="w-full resize-none rounded-lg bg-surface-container px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {error && (
                        <p className="text-xs text-error">{error}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">
                            {draft.length}/500
                        </span>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!draft.trim() || isPosting}
                        >
                            <span className="flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5" />
                                {isPosting ? "Posting..." : "Post"}
                            </span>
                        </Button>
                    </div>
                </form>
            ) : (
                <p className="text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>{" "}
                    to leave a comment.
                </p>
            )}
        </div>
    );
}
