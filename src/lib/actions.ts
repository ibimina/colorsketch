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
    return { liked: [], bookmarked: [] };
  }

  const [likesResult, savesResult] = await Promise.all([
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
  ]);

  return {
    liked: likesResult.data?.map((l) => l.artwork_id) || [],
    bookmarked: savesResult.data?.map((s) => s.artwork_id) || [],
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
