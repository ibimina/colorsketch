"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FillState } from "@/types";

// ============================================
// Progress Actions
// ============================================

export async function getProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching progress:", error);
    return null;
  }

  return data;
}

export async function syncProgress(progress: {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  streak: number;
  lastActiveDate: string;
  totalSketches: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      level: progress.level,
      xp: progress.xp,
      xp_to_next_level: progress.xpToNextLevel,
      total_xp_earned: progress.totalXPEarned,
      streak: progress.streak,
      last_active_date: progress.lastActiveDate,
      total_sketches: progress.totalSketches,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    console.error("Error syncing progress:", error);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// Achievement Actions
// ============================================

export async function getAchievements() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }

  return data.map((a) => a.achievement_id);
}

export async function unlockAchievement(achievementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("user_achievements").upsert(
    {
      user_id: user.id,
      achievement_id: achievementId,
    },
    {
      onConflict: "user_id,achievement_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    console.error("Error unlocking achievement:", error);
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// Sketch Progress Actions
// ============================================

export async function getSketchProgress(sketchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("sketch_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("sketch_id", sketchId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching sketch progress:", error);
    return null;
  }

  return data;
}

export async function getAllSketchProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("sketch_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching all sketch progress:", error);
    return [];
  }

  return data;
}

export async function saveSketchProgress(
  sketchId: string,
  fills: FillState,
  drawingData?: string | null,
  completed?: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("sketch_progress").upsert(
    {
      user_id: user.id,
      sketch_id: sketchId,
      fills: fills as unknown as Record<string, unknown>,
      drawing_data: drawingData,
      completed_at: completed ? new Date().toISOString() : null,
    },
    {
      onConflict: "user_id,sketch_id",
    },
  );

  if (error) {
    console.error("Error saving sketch progress:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteSketchProgress(sketchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sketch_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("sketch_id", sketchId);

  if (error) {
    console.error("Error deleting sketch progress:", error);
    return { error: error.message };
  }

  revalidatePath("/library");
  return { success: true };
}

// ============================================
// Saved Artworks Actions
// ============================================

export async function getSavedArtworks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_artworks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved artworks:", error);
    return [];
  }

  return data;
}

export async function getPublicArtworks(limit: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_artworks")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching public artworks:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch artist profiles
  const userIds = [...new Set(data.map((artwork) => artwork.user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return data.map((artwork) => {
    const artistProfile = profileMap.get(artwork.user_id);
    return {
      ...artwork,
      artist_name: artistProfile?.name || "Anonymous Artist",
      artist_avatar: artistProfile?.avatar_url || null,
    };
  });
}

export async function saveArtwork(
  sketchId: string,
  imageUrl: string,
  thumbnailUrl?: string,
  isPublic: boolean = false,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("saved_artworks")
    .insert({
      user_id: user.id,
      sketch_id: sketchId,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving artwork:", error);
    return { error: error.message };
  }

  revalidatePath("/library");
  revalidatePath("/profile");
  return { success: true, data };
}

export async function toggleArtworkVisibility(
  artworkId: string,
  isPublic: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_artworks")
    .update({ is_public: isPublic })
    .eq("id", artworkId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating artwork visibility:", error);
    return { error: error.message };
  }

  revalidatePath("/library");
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("saved_artworks")
    .delete()
    .eq("id", artworkId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting artwork:", error);
    return { error: error.message };
  }

  revalidatePath("/library");
  revalidatePath("/profile");
  return { success: true };
}

// ============================================
// User Profile Actions
// ============================================

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(updates: {
  name?: string;
  avatar_url?: string;
  bio?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate bio length
  if (updates.bio && updates.bio.length > 160) {
    return { error: "Bio must be 160 characters or less" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}

// ============================================
// Favorites Actions
// ============================================

export async function getFavorites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_favorites")
    .select("sketch_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data.map((f) => f.sketch_id);
}

export async function addFavorite(sketchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    sketch_id: sketchId,
  });

  if (error) {
    // Ignore duplicate key errors
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error adding favorite:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function removeFavorite(sketchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("sketch_id", sketchId);

  if (error) {
    console.error("Error removing favorite:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function toggleFavorite(sketchId: string, isFavorited: boolean) {
  if (isFavorited) {
    return removeFavorite(sketchId);
  } else {
    return addFavorite(sketchId);
  }
}

// ============================================
// Leaderboard Actions
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  totalXP: number;
  streak: number;
  totalSketches: number;
  isCurrentUser: boolean;
}

export async function getLeaderboard(
  limit: number = 10,
  period: "daily" | "weekly" | "all-time" = "all-time",
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("user_progress")
    .select(
      `
      user_id,
      level,
      total_xp_earned,
      streak,
      total_sketches,
      last_active_date
    `,
    )
    .order("total_xp_earned", { ascending: false })
    .limit(limit);

  // Filter by period - use local date to match client-stored dates
  const getLocalISODate = (date: Date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  if (period === "daily") {
    const today = getLocalISODate(new Date());
    query = query.eq("last_active_date", today);
  } else if (period === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("last_active_date", getLocalISODate(weekAgo));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch profiles separately for all users in the leaderboard
  const userIds = data.map((entry) => entry.user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return data.map((entry, index) => {
    const profile = profileMap.get(entry.user_id);

    return {
      rank: index + 1,
      userId: entry.user_id,
      name: profile?.name || "Anonymous Artist",
      avatarUrl: profile?.avatar_url || null,
      level: entry.level,
      totalXP: entry.total_xp_earned,
      streak: entry.streak,
      totalSketches: entry.total_sketches,
      isCurrentUser: user?.id === entry.user_id,
    };
  });
}

export async function getUserRank(): Promise<{
  rank: number;
  totalUsers: number;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user's XP
  const { data: userProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("total_xp_earned")
    .eq("user_id", user.id)
    .single();

  if (progressError || !userProgress) {
    return null;
  }

  // Count users with more XP
  const { count: higherCount, error: countError } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .gt("total_xp_earned", userProgress.total_xp_earned);

  if (countError) {
    console.error("Error getting user rank:", countError);
    return null;
  }

  // Get total users
  const { count: totalUsers, error: totalError } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("Error getting total users:", totalError);
    return null;
  }

  return {
    rank: (higherCount || 0) + 1,
    totalUsers: totalUsers || 0,
  };
}

// ============================================
// Artwork Likes Actions
// ============================================

export async function likeArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("artwork_likes").insert({
    user_id: user.id,
    artwork_id: artworkId,
  });

  if (error) {
    // Ignore duplicate key errors (already liked)
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error liking artwork:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function unlikeArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("artwork_likes")
    .delete()
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId);

  if (error) {
    console.error("Error unliking artwork:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function toggleArtworkLike(artworkId: string, isLiked: boolean) {
  if (isLiked) {
    return unlikeArtwork(artworkId);
  } else {
    return likeArtwork(artworkId);
  }
}

export async function getUserLikedArtworks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("artwork_likes")
    .select(
      `
      artwork_id,
      created_at,
      saved_artworks!inner (
        id,
        user_id,
        sketch_id,
        image_url,
        thumbnail_url,
        likes_count,
        saves_count,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching liked artworks:", error);
    return [];
  }

  return data.map((item) => ({
    ...item.saved_artworks,
    liked_at: item.created_at,
  }));
}

// ============================================
// Artwork Saves/Bookmarks Actions
// ============================================

export async function bookmarkArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("artwork_saves").insert({
    user_id: user.id,
    artwork_id: artworkId,
  });

  if (error) {
    // Ignore duplicate key errors (already saved)
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error bookmarking artwork:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function unbookmarkArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("artwork_saves")
    .delete()
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId);

  if (error) {
    console.error("Error unbookmarking artwork:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function toggleArtworkBookmark(
  artworkId: string,
  isBookmarked: boolean,
) {
  if (isBookmarked) {
    return unbookmarkArtwork(artworkId);
  } else {
    return bookmarkArtwork(artworkId);
  }
}

export async function getUserBookmarkedArtworks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("artwork_saves")
    .select(
      `
      artwork_id,
      created_at,
      saved_artworks!inner (
        id,
        user_id,
        sketch_id,
        image_url,
        thumbnail_url,
        likes_count,
        saves_count,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarked artworks:", error);
    return [];
  }

  return data.map((item) => ({
    ...item.saved_artworks,
    bookmarked_at: item.created_at,
  }));
}

// ============================================
// Artwork Interactions (for UI state)
// ============================================

export async function getArtworkInteractions(artworkIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || artworkIds.length === 0) {
    return { liked: [], bookmarked: [], reposted: [] };
  }

  const [likesResult, savesResult, repostsResult] = await Promise.all([
    supabase
      .from("artwork_likes")
      .select("artwork_id")
      .eq("user_id", user.id)
      .in("artwork_id", artworkIds),
    supabase
      .from("artwork_saves")
      .select("artwork_id")
      .eq("user_id", user.id)
      .in("artwork_id", artworkIds),
    supabase
      .from("artwork_reposts")
      .select("artwork_id")
      .eq("user_id", user.id)
      .in("artwork_id", artworkIds),
  ]);

  return {
    liked: likesResult.data?.map((l) => l.artwork_id) || [],
    bookmarked: savesResult.data?.map((s) => s.artwork_id) || [],
    reposted: repostsResult.data?.map((r) => r.artwork_id) || [],
  };
}

// ============================================
// Public Profile Actions
// ============================================

export async function getProfileData(userId: string) {
  const supabase = await createClient();

  // Check if viewing own profile
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === userId;

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("level, total_xp_earned, total_sketches")
    .eq("user_id", userId)
    .single();

  // Get actual count of completed sketches from sketch_progress table
  const { count: completedSketchesCount } = await supabase
    .from("sketch_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  // If own profile, get ALL artworks (public + private)
  // If viewing someone else, only get public artworks
  let artworksQuery = supabase
    .from("saved_artworks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!isOwnProfile) {
    artworksQuery = artworksQuery.eq("is_public", true);
  }

  const { data: artworks, error: artworksError } = await artworksQuery;

  if (artworksError) {
    console.error("Error fetching artworks:", artworksError);
  }

  return {
    profile,
    progress: {
      level: progress?.level || 1,
      total_xp_earned: progress?.total_xp_earned || 0,
      // Use actual count of completed sketches instead of incrementing counter
      total_sketches: completedSketchesCount || 0,
    },
    artworks: artworks || [],
    isOwnProfile,
  };
}

// Alias for backward compatibility
export async function getPublicProfile(userId: string) {
  return getProfileData(userId);
}

export async function getProfileLikedArtworks(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artwork_likes")
    .select(
      `
      artwork_id,
      created_at,
      saved_artworks!inner (
        id,
        user_id,
        sketch_id,
        image_url,
        thumbnail_url,
        likes_count,
        saves_count,
        is_public,
        created_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching liked artworks for profile:", error);
    return [];
  }

  // Filter to only public artworks
  const publicArtworks = data.filter((item) => {
    const artwork = item.saved_artworks as unknown as { is_public: boolean };
    return artwork.is_public;
  });

  // Fetch artist profiles for all artworks
  const artistIds = [
    ...new Set(
      publicArtworks.map((item) => {
        const artwork = item.saved_artworks as unknown as { user_id: string };
        return artwork.user_id;
      }),
    ),
  ];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", artistIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return publicArtworks.map((item) => {
    const artwork = item.saved_artworks as unknown as {
      id: string;
      user_id: string;
      sketch_id: string;
      image_url: string;
      thumbnail_url: string | null;
      likes_count: number;
      saves_count: number;
      is_public: boolean;
      created_at: string;
    };
    const artistProfile = profileMap.get(artwork.user_id);
    return {
      ...artwork,
      liked_at: item.created_at,
      artist_name: artistProfile?.name || "Anonymous Artist",
      artist_avatar: artistProfile?.avatar_url || null,
    };
  });
}

export async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function getProfileCompletedSketches(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sketch_progress")
    .select("sketch_id, fills, completed_at, updated_at")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });
  return data || [];
}

// ============================================
// Notifications
// ============================================

export type NotificationType =
  | "like"
  | "save"
  | "follow"
  | "repost"
  | "comment"
  | "level_up"
  | "achievement"
  | "system";

export interface NotificationRow {
  id: string;
  type: NotificationType;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
}

export async function listNotifications(
  limit = 30,
): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, type, target_type, target_id, payload, read_at, created_at, actor_id",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Hydrate actor profile in one round-trip
  const actorIds = Array.from(
    new Set(data.map((n) => n.actor_id).filter((id): id is string => !!id)),
  );

  let actorMap = new Map<
    string,
    { name: string | null; avatar_url: string | null }
  >();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, name, avatar_url")
      .in("id", actorIds);
    actorMap = new Map(
      (profiles || []).map((p) => [
        p.id,
        { name: p.name, avatar_url: p.avatar_url },
      ]),
    );
  }

  return data.map((n) => {
    const actor = n.actor_id ? actorMap.get(n.actor_id) : undefined;
    return {
      ...n,
      payload: (n.payload as Record<string, unknown>) ?? {},
      actor_name: actor?.name ?? null,
      actor_avatar: actor?.avatar_url ?? null,
    };
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

export async function markNotificationsRead(ids?: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  const { error } =
    ids && ids.length > 0 ? await query.in("id", ids) : await query;
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function clearAllNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============================================
// Follows
// ============================================

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (user.id === targetUserId) return { error: "Cannot follow yourself" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return { error: error.message };
  }
  revalidatePath(`/profile/${targetUserId}`);
  return { success: true };
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);
  if (error) return { error: error.message };
  revalidatePath(`/profile/${targetUserId}`);
  return { success: true };
}

export async function getFollowStats(userId: string) {
  const supabase = await createClient();
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isFollowing = false;
  if (user && user.id !== userId) {
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();
    isFollowing = !!data;
  }

  return {
    followers: followers ?? 0,
    following: following ?? 0,
    isFollowing,
  };
}

export async function listFollowers(userId: string, limit: number = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id, created_at")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return [];

  const ids = data.map((f) => f.follower_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url, bio")
    .in("id", ids);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myFollowing = new Set<string>();
  if (user) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", ids);
    myFollowing = new Set((myFollows ?? []).map((f) => f.following_id));
  }

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  return data
    .map((f) => {
      const p = profileMap.get(f.follower_id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        isFollowing: myFollowing.has(p.id),
        isSelf: user?.id === p.id,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function listFollowing(userId: string, limit: number = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("following_id, created_at")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return [];

  const ids = data.map((f) => f.following_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url, bio")
    .in("id", ids);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myFollowing = new Set<string>();
  if (user) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", ids);
    myFollowing = new Set((myFollows ?? []).map((f) => f.following_id));
  }

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  return data
    .map((f) => {
      const p = profileMap.get(f.following_id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        isFollowing: myFollowing.has(p.id),
        isSelf: user?.id === p.id,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function getFollowingArtworks(limit: number = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find who the current user follows
  const { data: followsData } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (followsData ?? []).map((f) => f.following_id);
  if (followingIds.length === 0) return [];

  const { data, error } = await supabase
    .from("saved_artworks")
    .select("*")
    .eq("is_public", true)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching following artworks:", error);
    return [];
  }
  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((artwork) => artwork.user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return data.map((artwork) => {
    const artistProfile = profileMap.get(artwork.user_id);
    return {
      ...artwork,
      artist_name: artistProfile?.name || "Anonymous Artist",
      artist_avatar: artistProfile?.avatar_url || null,
    };
  });
}

export async function getTrendingArtworks(limit: number = 20) {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("saved_artworks")
    .select("*")
    .eq("is_public", true)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false })
    .limit(Math.max(limit * 5, 50));

  if (error) {
    console.error("Error fetching trending artworks:", error);
    return [];
  }
  if (!data || data.length === 0) return [];

  const now = Date.now();
  const ranked = [...data]
    .map((a) => {
      const ageHours = Math.max(
        2,
        (now - new Date(a.created_at).getTime()) / 3_600_000,
      );
      const engagement =
        (a.likes_count || 0) +
        2 * (a.saves_count || 0) +
        3 * (a.reposts_count || 0) +
        2 * (a.comments_count || 0);
      const score = engagement / Math.pow(ageHours + 2, 1.4);
      return { artwork: a, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((r) => r.artwork);

  const userIds = [...new Set(ranked.map((a) => a.user_id))];
  const { data: trendingProfiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const trendingProfileMap = new Map(
    trendingProfiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return ranked.map((artwork) => {
    const artistProfile = trendingProfileMap.get(artwork.user_id);
    return {
      ...artwork,
      artist_name: artistProfile?.name || "Anonymous Artist",
      artist_avatar: artistProfile?.avatar_url || null,
    };
  });
}

// ============================================
// Reposts
// ============================================

export async function repostArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("artwork_reposts")
    .insert({ user_id: user.id, artwork_id: artworkId });
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return { error: error.message };
  }
  return { success: true };
}

export async function unrepostArtwork(artworkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("artwork_reposts")
    .delete()
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getProfileReposts(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artwork_reposts")
    .select(
      `
      artwork_id,
      created_at,
      saved_artworks!inner (
        id,
        user_id,
        sketch_id,
        image_url,
        thumbnail_url,
        likes_count,
        saves_count,
        reposts_count,
        is_public,
        created_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reposted artworks for profile:", error);
    return [];
  }

  const publicArtworks = data.filter((item) => {
    const artwork = item.saved_artworks as unknown as { is_public: boolean };
    return artwork.is_public;
  });

  const artistIds = [
    ...new Set(
      publicArtworks.map((item) => {
        const artwork = item.saved_artworks as unknown as { user_id: string };
        return artwork.user_id;
      }),
    ),
  ];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", artistIds);

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ||
      [],
  );

  return publicArtworks.map((item) => {
    const artwork = item.saved_artworks as unknown as {
      id: string;
      user_id: string;
      sketch_id: string;
      image_url: string;
      thumbnail_url: string | null;
      likes_count: number;
      saves_count: number;
      reposts_count: number;
      is_public: boolean;
      created_at: string;
    };
    const artistProfile = profileMap.get(artwork.user_id);
    return {
      ...artwork,
      reposted_at: item.created_at,
      artist_name: artistProfile?.name || "Anonymous Artist",
      artist_avatar: artistProfile?.avatar_url || null,
    };
  });
}

// ============================================
// Comments
// ============================================

export interface CommentRow {
  id: string;
  artwork_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

export async function listComments(
  artworkId: string,
  limit: number = 100,
): Promise<CommentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artwork_comments")
    .select("id, artwork_id, user_id, body, created_at, updated_at")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error || !data || data.length === 0) return [];

  const userIds = [...new Set(data.map((c) => c.user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  return data.map((c) => {
    const p = profileMap.get(c.user_id);
    return {
      ...c,
      author_name: p?.name ?? null,
      author_avatar: p?.avatar_url ?? null,
    };
  });
}

export async function addComment(artworkId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = body.trim();
  if (trimmed.length === 0) return { error: "Comment is empty" };
  if (trimmed.length > 500) return { error: "Comment is too long (max 500)" };

  const { data, error } = await supabase
    .from("artwork_comments")
    .insert({
      artwork_id: artworkId,
      user_id: user.id,
      body: trimmed,
    })
    .select("id, artwork_id, user_id, body, created_at, updated_at")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to add comment" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const row: CommentRow = {
    ...data,
    author_name: profile?.name ?? null,
    author_avatar: profile?.avatar_url ?? null,
  };
  return { success: true, comment: row };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("artwork_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============================================
// Search
// ============================================

export interface ArtistSearchResult {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  isFollowing: boolean;
  isSelf: boolean;
}

export interface ArtworkSearchResult {
  id: string;
  user_id: string;
  sketch_id: string;
  image_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  saves_count: number;
  reposts_count: number;
  comments_count: number;
  created_at: string;
  artist_name: string;
  artist_avatar: string | null;
}

function escapeIlike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function searchArtists(
  query: string,
  limit: number = 20,
): Promise<ArtistSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const escaped = escapeIlike(trimmed);

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url, bio")
    .ilike("name", `%${escaped}%`)
    .limit(limit);

  if (error || !data || data.length === 0) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myFollowing = new Set<string>();
  if (user) {
    const ids = data.map((p) => p.id);
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", ids);
    myFollowing = new Set((myFollows ?? []).map((f) => f.following_id));
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    isFollowing: myFollowing.has(p.id),
    isSelf: user?.id === p.id,
  }));
}

export async function searchArtworks(
  query: string,
  limit: number = 30,
): Promise<ArtworkSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const escaped = escapeIlike(trimmed);

  // Match artwork rows whose sketch_id contains the query (acts as title proxy).
  const { data: byTitle } = await supabase
    .from("saved_artworks")
    .select("*")
    .eq("is_public", true)
    .ilike("sketch_id", `%${escaped}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Match artwork rows authored by users whose name contains the query.
  const { data: matchingArtists } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("name", `%${escaped}%`)
    .limit(limit);
  const artistIds = (matchingArtists ?? []).map((p) => p.id);

  let byArtist: typeof byTitle = [];
  if (artistIds.length > 0) {
    const { data } = await supabase
      .from("saved_artworks")
      .select("*")
      .eq("is_public", true)
      .in("user_id", artistIds)
      .order("created_at", { ascending: false })
      .limit(limit);
    byArtist = data ?? [];
  }

  const merged = new Map<string, NonNullable<typeof byTitle>[number]>();
  for (const row of [...(byTitle ?? []), ...(byArtist ?? [])]) {
    merged.set(row.id, row);
  }
  const rows = [...merged.values()]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return rows.map((r) => {
    const p = profileMap.get(r.user_id);
    return {
      id: r.id,
      user_id: r.user_id,
      sketch_id: r.sketch_id,
      image_url: r.image_url,
      thumbnail_url: r.thumbnail_url,
      likes_count: r.likes_count ?? 0,
      saves_count: r.saves_count ?? 0,
      reposts_count: r.reposts_count ?? 0,
      comments_count: r.comments_count ?? 0,
      created_at: r.created_at,
      artist_name: p?.name || "Anonymous Artist",
      artist_avatar: p?.avatar_url || null,
    };
  });
}
