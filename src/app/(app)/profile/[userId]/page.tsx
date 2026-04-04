"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, Input } from "@/components/ui";
import { Icons } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";
import {
    getProfileData,
    getProfileLikedArtworks,
    getArtworkInteractions,
    toggleArtworkLike,
    toggleArtworkBookmark,
    toggleArtworkVisibility,
    updateProfile,
    deleteArtwork
} from "@/lib/actions";
import { Globe, Lock, Pencil, X, Loader2, Image as ImageIcon, Heart, RefreshCw, Trash2, Eye, Edit } from "lucide-react";

// Sketch titles mapping
const sketchTitles: Record<string, string> = {
    butterfly: "Monarch Butterfly",
    rose: "Elegant Rose",
    mandala: "Sacred Mandala",
    hummingbird: "Hummingbird Garden",
    "koi-fish": "Japanese Koi",
    owl: "Wise Owl",
    lotus: "Lotus Bloom",
    fox: "Woodland Fox",
};

function getSketchTitle(sketchId: string): string {
    return sketchTitles[sketchId] || sketchId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

interface ProfileData {
    profile: {
        id: string;
        name: string | null;
        avatar_url: string | null;
        bio: string | null;
    };
    progress: {
        level: number;
        total_xp_earned: number;
        total_sketches: number;
    };
    artworks: {
        id: string;
        sketch_id: string;
        image_url: string;
        thumbnail_url: string | null;
        likes_count: number;
        saves_count: number;
        is_public: boolean;
        created_at: string;
    }[];
    isOwnProfile: boolean;
}

interface LikedArtwork {
    id: string;
    user_id: string;
    sketch_id: string;
    image_url: string;
    thumbnail_url: string | null;
    likes_count: number;
    saves_count: number;
    liked_at: string;
    artist_name: string;
    artist_avatar: string | null;
}

interface Interactions {
    liked: string[];
    bookmarked: string[];
}

type TabType = "gallery" | "liked" | "reposts";

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [likedLoadState, setLikedLoadState] = useState<"idle" | "loading" | "loaded">("idle");
    const [likedArtworks, setLikedArtworks] = useState<LikedArtwork[]>([]);
    const [interactions, setInteractions] = useState<Interactions>({ liked: [], bookmarked: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("gallery");
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingArtwork, setViewingArtwork] = useState<ProfileData["artworks"][0] | null>(null);
    const [viewingLikedArtwork, setViewingLikedArtwork] = useState<LikedArtwork | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            const data = await getProfileData(userId);
            if (!data) {
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            // If own profile and no avatar_url, try to get from auth metadata
            if (data.isOwnProfile && !data.profile.avatar_url) {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.user_metadata?.picture || user?.user_metadata?.avatar_url) {
                    data.profile.avatar_url = user.user_metadata.picture || user.user_metadata.avatar_url;
                }
            }

            setProfileData(data as ProfileData);

            // Load user's interactions with gallery artworks
            if (data.artworks.length > 0) {
                const artworkIds = data.artworks.map(a => a.id);
                const userInteractions = await getArtworkInteractions(artworkIds);
                setInteractions(userInteractions);
            }

            setIsLoading(false);
        }
        loadProfile();
    }, [userId]);

    // Load liked artworks when tab changes to liked
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === "liked" && likedLoadState === "idle") {
            setLikedLoadState("loading");
            getProfileLikedArtworks(userId).then(data => {
                setLikedArtworks(data as unknown as LikedArtwork[]);
                setLikedLoadState("loaded");
            });
        }
    };

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

            setProfileData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    artworks: prev.artworks.map(artwork =>
                        artwork.id === artworkId
                            ? { ...artwork, likes_count: artwork.likes_count + (isLiked ? -1 : 1) }
                            : artwork
                    )
                };
            });
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

            setProfileData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    artworks: prev.artworks.map(artwork =>
                        artwork.id === artworkId
                            ? { ...artwork, saves_count: artwork.saves_count + (isBookmarked ? -1 : 1) }
                            : artwork
                    )
                };
            });
        }
    };

    const handleToggleVisibility = async (artworkId: string, currentIsPublic: boolean) => {
        const result = await toggleArtworkVisibility(artworkId, !currentIsPublic);

        if (result.success) {
            setProfileData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    artworks: prev.artworks.map(artwork =>
                        artwork.id === artworkId
                            ? { ...artwork, is_public: !currentIsPublic }
                            : artwork
                    )
                };
            });
        }
    };

    const handleDelete = async (artworkId: string) => {
        if (!confirm("Are you sure you want to delete this artwork? This cannot be undone.")) return;

        setDeletingId(artworkId);
        const result = await deleteArtwork(artworkId);

        if (result.success) {
            setProfileData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    artworks: prev.artworks.filter(artwork => artwork.id !== artworkId)
                };
            });
        }
        setDeletingId(null);
    };

    const handleProfileUpdate = async (updates: { name?: string; bio?: string; avatar_url?: string }) => {
        const result = await updateProfile(updates);
        if (result.success && profileData) {
            setProfileData({
                ...profileData,
                profile: {
                    ...profileData.profile,
                    ...updates,
                }
            });
        }
        return result;
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
                <div className="animate-pulse space-y-8">
                    <Card variant="elevated" className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-surface-container" />
                            <div className="flex-1 space-y-3 text-center sm:text-left">
                                <div className="h-7 w-48 bg-surface-container rounded mx-auto sm:mx-0" />
                                <div className="h-4 w-32 bg-surface-container rounded mx-auto sm:mx-0" />
                                <div className="h-4 w-64 bg-surface-container rounded mx-auto sm:mx-0" />
                            </div>
                        </div>
                    </Card>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-surface-container rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !profileData) {
        return (
            <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
                <Card variant="elevated" className="text-center py-16">
                    <div className="text-6xl mb-4">👤</div>
                    <h1 className="text-2xl font-headline font-bold mb-2">
                        Artist Not Found
                    </h1>
                    <p className="text-on-surface-variant mb-6">
                        This profile doesn&apos;t exist or has no public artworks.
                    </p>
                    <Link href="/home">
                        <Button variant="primary">
                            Back to Home
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const { profile, progress, artworks, isOwnProfile } = profileData;
    const publicArtworksCount = artworks.filter(a => a.is_public).length;

    const tabs = [
        { id: "gallery" as TabType, label: "Gallery", icon: ImageIcon, count: artworks.length },
        { id: "liked" as TabType, label: "Liked", icon: Heart, count: likedArtworks.length },
        { id: "reposts" as TabType, label: "Reposts", icon: RefreshCw, count: 0 },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
            <div className="space-y-6">
                {/* Profile Header */}
                <Card variant="elevated" className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <div className="relative">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.name || "Artist"}
                                    width={96}
                                    height={96}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-4xl">🎨</span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                {progress.level}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                <h1 className="text-2xl font-headline font-bold">
                                    {profile.name || "Anonymous Artist"}
                                </h1>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Pencil className="w-4 h-4 text-on-surface-variant" />
                                    </button>
                                )}
                            </div>
                            <p className="text-on-surface-variant text-sm mb-2">
                                Level {progress.level} Artist
                            </p>
                            {profile.bio && (
                                <p className="text-on-surface mb-4 max-w-md">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex justify-center sm:justify-start gap-6">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-primary">
                                        {isOwnProfile ? artworks.length : publicArtworksCount}
                                    </div>
                                    <div className="text-xs text-on-surface-variant">
                                        Artworks
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-secondary">
                                        {progress.total_xp_earned.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-on-surface-variant">
                                        Total XP
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-tertiary">
                                        {progress.total_sketches}
                                    </div>
                                    <div className="text-xs text-on-surface-variant">
                                        Sketches
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-outline-variant">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${activeTab === tab.id
                                    ? "text-primary"
                                    : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === "gallery" && (
                    <GalleryTab
                        artworks={artworks}
                        isOwnProfile={isOwnProfile}
                        interactions={interactions}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        onToggleVisibility={handleToggleVisibility}
                        onDelete={handleDelete}
                        onView={setViewingArtwork}
                        deletingId={deletingId}
                    />
                )}

                {activeTab === "liked" && (
                    <LikedTab
                        artworks={likedArtworks}
                        isLoading={likedLoadState === "loading"}
                        onView={setViewingLikedArtwork}
                    />
                )}

                {activeTab === "reposts" && (
                    <RepostsTab />
                )}

                {/* Back Link */}
                <div className="text-center pt-4">
                    <Link href="/home" className="text-primary hover:underline font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleProfileUpdate}
                />
            )}

            {/* View Artwork Modal */}
            {viewingArtwork && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewingArtwork(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingArtwork(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="relative aspect-square max-h-[70vh] w-full bg-surface-container rounded-xl overflow-hidden">
                            <Image
                                src={viewingArtwork.image_url}
                                alt={getSketchTitle(viewingArtwork.sketch_id)}
                                fill
                                sizes="(min-width: 768px) 70vw, 90vw"
                                className="object-contain"
                                quality={95}
                                priority
                            />
                        </div>

                        <div className="mt-4 text-center text-white">
                            <h3 className="text-xl font-headline font-bold">
                                {getSketchTitle(viewingArtwork.sketch_id)}
                            </h3>
                            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Icons.Heart className="w-4 h-4" />
                                    {viewingArtwork.likes_count || 0} likes
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icons.Bookmark className="w-4 h-4" />
                                    {viewingArtwork.saves_count || 0} saves
                                </span>
                            </div>
                            {isOwnProfile && (
                                <Link
                                    href={`/canvas/${viewingArtwork.sketch_id}`}
                                    className="inline-block mt-4 px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors"
                                >
                                    Continue Editing
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Liked Artwork Modal */}
            {viewingLikedArtwork && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewingLikedArtwork(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingLikedArtwork(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="relative aspect-square max-h-[70vh] w-full bg-surface-container rounded-xl overflow-hidden">
                            <Image
                                src={viewingLikedArtwork.image_url}
                                alt={getSketchTitle(viewingLikedArtwork.sketch_id)}
                                fill
                                sizes="(min-width: 768px) 70vw, 90vw"
                                className="object-contain"
                                quality={95}
                                priority
                            />
                        </div>

                        <div className="mt-4 text-center text-white">
                            <h3 className="text-xl font-headline font-bold">
                                {getSketchTitle(viewingLikedArtwork.sketch_id)}
                            </h3>

                            {/* Artist Info */}
                            <Link
                                href={`/profile/${viewingLikedArtwork.user_id}`}
                                className="inline-flex items-center gap-2 mt-2 hover:opacity-80"
                            >
                                {viewingLikedArtwork.artist_avatar ? (
                                    <Image
                                        src={viewingLikedArtwork.artist_avatar}
                                        alt={viewingLikedArtwork.artist_name}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-xs">🎨</span>
                                    </div>
                                )}
                                <span className="text-sm text-gray-300">
                                    by {viewingLikedArtwork.artist_name}
                                </span>
                            </Link>

                            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Icons.Heart className="w-4 h-4 fill-current text-error" />
                                    {viewingLikedArtwork.likes_count || 0} likes
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icons.Bookmark className="w-4 h-4" />
                                    {viewingLikedArtwork.saves_count || 0} saves
                                </span>
                            </div>

                            <Link
                                href={`/profile/${viewingLikedArtwork.user_id}`}
                                className="inline-block mt-4 px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors"
                            >
                                View Artist Profile
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Gallery Tab Component
// ============================================

function GalleryTab({
    artworks,
    isOwnProfile,
    interactions,
    onLike,
    onBookmark,
    onToggleVisibility,
    onDelete,
    onView,
    deletingId
}: {
    artworks: ProfileData["artworks"];
    isOwnProfile: boolean;
    interactions: Interactions;
    onLike: (id: string) => void;
    onBookmark: (id: string) => void;
    onToggleVisibility: (id: string, isPublic: boolean) => void;
    onDelete: (id: string) => void;
    onView: (artwork: ProfileData["artworks"][0]) => void;
    deletingId: string | null;
}) {
    if (artworks.length === 0) {
        return (
            <Card variant="filled" className="text-center py-12">
                <div className="text-5xl mb-4">🖼️</div>
                <h3 className="text-lg font-headline font-bold mb-2">
                    {isOwnProfile ? "No artworks yet" : "No public artworks"}
                </h3>
                <p className="text-on-surface-variant mb-4">
                    {isOwnProfile
                        ? "Start coloring and save your masterpieces!"
                        : "This artist hasn't shared any public artworks yet."}
                </p>
                {isOwnProfile && (
                    <Link href="/library">
                        <Button variant="primary">
                            Browse Sketches
                        </Button>
                    </Link>
                )}
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map((artwork) => {
                const isLiked = interactions.liked.includes(artwork.id);
                const isBookmarked = interactions.bookmarked.includes(artwork.id);

                return (
                    <Card
                        key={artwork.id}
                        variant="elevated"
                        padding="none"
                        className="overflow-hidden group"
                    >
                        <div className="relative aspect-square bg-surface-container">
                            <Image
                                src={artwork.image_url}
                                alt={getSketchTitle(artwork.sketch_id)}
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                className="object-cover"
                                quality={90}
                            />

                            {/* Visibility Badge (own profile only) */}
                            {isOwnProfile && (
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${artwork.is_public
                                    ? "bg-green-500/90 text-white"
                                    : "bg-gray-700/90 text-white"
                                    }`}>
                                    {artwork.is_public ? (
                                        <><Globe className="w-3 h-3" /> Public</>
                                    ) : (
                                        <><Lock className="w-3 h-3" /> Private</>
                                    )}
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* View Button - always show */}
                                <button
                                    onClick={() => onView(artwork)}
                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                    title="View"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>

                                {isOwnProfile ? (
                                    <>
                                        {/* Like Button */}
                                        <button
                                            onClick={() => onLike(artwork.id)}
                                            className={`p-2 rounded-full transition-colors ${isLiked
                                                ? "bg-error text-on-error"
                                                : "bg-white/20 text-white hover:bg-white/30"
                                                }`}
                                            title={isLiked ? "Unlike" : "Like"}
                                        >
                                            <Icons.Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                        </button>

                                        {/* Edit Button - link to canvas */}
                                        <Link
                                            href={`/canvas/${artwork.sketch_id}`}
                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>

                                        {/* Visibility Toggle */}
                                        <button
                                            onClick={() => onToggleVisibility(artwork.id, artwork.is_public)}
                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                            title={artwork.is_public ? "Make Private" : "Make Public"}
                                        >
                                            {artwork.is_public ? (
                                                <Lock className="w-5 h-5" />
                                            ) : (
                                                <Globe className="w-5 h-5" />
                                            )}
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => onDelete(artwork.id)}
                                            disabled={deletingId === artwork.id}
                                            className="p-2 rounded-full bg-error/80 text-white hover:bg-error transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === artwork.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onLike(artwork.id)}
                                            className={`p-2 rounded-full transition-colors ${isLiked
                                                ? "bg-error text-on-error"
                                                : "bg-white/20 text-white hover:bg-white/30"
                                                }`}
                                        >
                                            <Icons.Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                        </button>
                                        <button
                                            onClick={() => onBookmark(artwork.id)}
                                            className={`p-2 rounded-full transition-colors ${isBookmarked
                                                ? "bg-primary text-on-primary"
                                                : "bg-white/20 text-white hover:bg-white/30"
                                                }`}
                                        >
                                            <Icons.Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-3">
                            <p className="font-headline font-medium text-sm truncate mb-1">
                                {getSketchTitle(artwork.sketch_id)}
                            </p>
                            <div className="flex items-center justify-between text-xs text-on-surface-variant">
                                <span className="flex items-center gap-1">
                                    <Icons.Heart className="w-3 h-3" />
                                    {artwork.likes_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icons.Bookmark className="w-3 h-3" />
                                    {artwork.saves_count || 0}
                                </span>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

// ============================================
// Liked Tab Component
// ============================================

function LikedTab({
    artworks,
    isLoading,
    onView
}: {
    artworks: LikedArtwork[];
    isLoading: boolean;
    onView: (artwork: LikedArtwork) => void;
}) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (artworks.length === 0) {
        return (
            <Card variant="filled" className="text-center py-12">
                <div className="text-5xl mb-4">❤️</div>
                <h3 className="text-lg font-headline font-bold mb-2">
                    No liked artworks yet
                </h3>
                <p className="text-on-surface-variant mb-4">
                    Explore the community and like artworks that inspire you!
                </p>
                <Link href="/home">
                    <Button variant="primary">
                        Explore Gallery
                    </Button>
                </Link>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
                <Card
                    key={artwork.id}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden group"
                >
                    <div className="relative aspect-square bg-surface-container">
                        <Image
                            src={artwork.image_url}
                            alt={getSketchTitle(artwork.sketch_id)}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover"
                            quality={90}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => onView(artwork)}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                title="View"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                            <Link
                                href={`/profile/${artwork.user_id}`}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                title="View Artist Profile"
                            >
                                <Icons.Profile className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="font-headline font-medium text-sm truncate mb-1">
                            {getSketchTitle(artwork.sketch_id)}
                        </p>

                        {/* Artist Info */}
                        <Link href={`/profile/${artwork.user_id}`} className="flex items-center gap-1.5 mb-2 hover:opacity-80">
                            {artwork.artist_avatar ? (
                                <Image
                                    src={artwork.artist_avatar}
                                    alt={artwork.artist_name}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-[8px]">🎨</span>
                                </div>
                            )}
                            <span className="text-xs text-on-surface-variant truncate">
                                {artwork.artist_name}
                            </span>
                        </Link>

                        <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1">
                                <Icons.Heart className="w-3 h-3 fill-current text-error" />
                                {artwork.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Icons.Bookmark className="w-3 h-3" />
                                {artwork.saves_count || 0}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ============================================
// Reposts Tab Component (Placeholder)
// ============================================

function RepostsTab() {
    return (
        <Card variant="filled" className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-lg font-headline font-bold mb-2">
                Reposts Coming Soon
            </h3>
            <p className="text-on-surface-variant">
                Soon you&apos;ll be able to repost your favorite artworks to share with your followers!
            </p>
        </Card>
    );
}

// ============================================
// Edit Profile Modal
// ============================================

function EditProfileModal({
    profile,
    onClose,
    onSave
}: {
    profile: ProfileData["profile"];
    onClose: () => void;
    onSave: (updates: { name?: string; bio?: string; avatar_url?: string }) => Promise<{ success?: boolean; error?: string }>;
}) {
    const [name, setName] = useState(profile.name || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        const result = await onSave({
            name: name || undefined,
            bio: bio || undefined,
            avatar_url: avatarUrl || undefined,
        });

        if (result.error) {
            setError(result.error);
            setIsSaving(false);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container transition-colors"
                >
                    <X className="h-5 w-5 text-on-surface-variant" />
                </button>

                <h2 className="text-xl font-headline font-bold mb-6">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">
                            Display Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your display name"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={160}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-surface-container border-none outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none"
                        />
                        <p className="text-xs text-on-surface-variant text-right mt-1">
                            {bio.length}/160
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">
                            Avatar URL
                        </label>
                        <Input
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            type="url"
                        />
                        <p className="text-xs text-on-surface-variant mt-1">
                            Paste a link to your avatar image
                        </p>
                    </div>

                    {error && (
                        <p className="text-error text-sm">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
