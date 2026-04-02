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

  return data;
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
  revalidatePath("/gallery");
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
  revalidatePath("/gallery");
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
  revalidatePath("/gallery");
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
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

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
  return { success: true };
}
