"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, Loader2, UserPlus, UserMinus } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { sketches } from "@/data/sketches";
import {
    searchArtists,
    searchArtworks,
    followUser,
    unfollowUser,
    type ArtistSearchResult,
    type ArtworkSearchResult,
} from "@/lib/actions";
import { useDebounce } from "@/hooks/useDebounce";

function getSketchTitle(sketchId: string): string {
    const sketch = sketches.find((s) => s.id === sketchId);
    if (sketch) return sketch.title;
    return sketchId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const debounced = useDebounce(query, 300);
    const [artists, setArtists] = useState<ArtistSearchResult[]>([]);
    const [artworks, setArtworks] = useState<ArtworkSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [followingPending, startFollowTransition] = useTransition();

    useEffect(() => {
        const trimmed = debounced.trim();
        if (trimmed.length < 2) {
            return;
        }
        let cancelled = false;
        async function run() {
            setIsLoading(true);
            const [a, w] = await Promise.all([
                searchArtists(trimmed),
                searchArtworks(trimmed),
            ]);
            if (cancelled) return;
            setArtists(a);
            setArtworks(w);
            setHasSearched(true);
            setIsLoading(false);
        }
        run();
        return () => {
            cancelled = true;
        };
    }, [debounced]);

    const queryActive = debounced.trim().length >= 2;
    const visibleArtists = queryActive ? artists : [];
    const visibleArtworks = queryActive ? artworks : [];
    const visibleHasSearched = queryActive && hasSearched;

    const handleToggleFollow = (artist: ArtistSearchResult) => {
        const next = !artist.isFollowing;
        setArtists((curr) =>
            curr.map((a) => (a.id === artist.id ? { ...a, isFollowing: next } : a)),
        );
        startFollowTransition(async () => {
            const result = next
                ? await followUser(artist.id)
                : await unfollowUser(artist.id);
            if (result.error) {
                // revert
                setArtists((curr) =>
                    curr.map((a) =>
                        a.id === artist.id ? { ...a, isFollowing: !next } : a,
                    ),
                );
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-headline font-bold mb-1">Search</h1>
                <p className="text-on-surface-variant text-sm">
                    Find artists and artworks across the community.
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                    type="search"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search artists or artworks..."
                    className="w-full bg-surface-container rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>

            {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="text-sm text-on-surface-variant">
                    Type at least 2 characters.
                </p>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-12 text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            )}

            {!isLoading && visibleHasSearched && visibleArtists.length === 0 && visibleArtworks.length === 0 && (
                <Card variant="filled" className="text-center py-10">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="font-headline font-bold">No results</p>
                    <p className="text-on-surface-variant text-sm">
                        Try a different name or keyword.
                    </p>
                </Card>
            )}

            {!isLoading && visibleArtists.length > 0 && (
                <section>
                    <h2 className="text-base font-headline font-semibold mb-3">
                        Artists ({visibleArtists.length})
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visibleArtists.map((artist) => (
                            <li key={artist.id}>
                                <Card className="flex items-center gap-3 p-3">
                                    <Link
                                        href={`/profile/${artist.id}`}
                                        className="shrink-0"
                                    >
                                        {artist.avatar_url ? (
                                            <Image
                                                src={artist.avatar_url}
                                                alt={artist.name || "Artist"}
                                                width={44}
                                                height={44}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-lg">🎨</span>
                                            </div>
                                        )}
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/profile/${artist.id}`}
                                            className="font-medium text-sm hover:underline block truncate"
                                        >
                                            {artist.name || "Anonymous Artist"}
                                        </Link>
                                        {artist.bio && (
                                            <p className="text-xs text-on-surface-variant truncate">
                                                {artist.bio}
                                            </p>
                                        )}
                                    </div>
                                    {!artist.isSelf && (
                                        <Button
                                            variant={artist.isFollowing ? "secondary" : "primary"}
                                            size="sm"
                                            disabled={followingPending}
                                            onClick={() => handleToggleFollow(artist)}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {artist.isFollowing ? (
                                                    <>
                                                        <UserMinus className="w-3.5 h-3.5" />
                                                        Following
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        Follow
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    )}
                                </Card>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {!isLoading && visibleArtworks.length > 0 && (
                <section>
                    <h2 className="text-base font-headline font-semibold mb-3">
                        Artworks ({visibleArtworks.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {visibleArtworks.map((art) => (
                            <Link
                                key={art.id}
                                href={`/profile/${art.user_id}`}
                                className="block"
                            >
                                <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative aspect-square bg-surface-container">
                                        <Image
                                            src={art.thumbnail_url || art.image_url}
                                            alt={getSketchTitle(art.sketch_id)}
                                            fill
                                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <p className="text-sm font-medium truncate">
                                            {getSketchTitle(art.sketch_id)}
                                        </p>
                                        <p className="text-xs text-on-surface-variant truncate">
                                            by {art.artist_name}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
