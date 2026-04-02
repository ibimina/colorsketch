// Database types for Supabase
// These types match the tables defined in supabase/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          tier: "free" | "pro";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          tier?: "free" | "pro";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          tier?: "free" | "pro";
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          level: number;
          xp: number;
          xp_to_next_level: number;
          total_xp_earned: number;
          streak: number;
          last_active_date: string;
          total_sketches: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          total_xp_earned?: number;
          streak?: number;
          last_active_date?: string;
          total_sketches?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          total_xp_earned?: number;
          streak?: number;
          last_active_date?: string;
          total_sketches?: number;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      sketch_progress: {
        Row: {
          id: string;
          user_id: string;
          sketch_id: string;
          fills: Json;
          drawing_data: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sketch_id: string;
          fills?: Json;
          drawing_data?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fills?: Json;
          drawing_data?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      saved_artworks: {
        Row: {
          id: string;
          user_id: string;
          sketch_id: string;
          image_url: string;
          thumbnail_url: string | null;
          is_public: boolean;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sketch_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          is_public?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          image_url?: string;
          thumbnail_url?: string | null;
          is_public?: boolean;
          likes_count?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_tier: "free" | "pro";
    };
  };
}

// Helper types for easier usage
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type UserAchievement =
  Database["public"]["Tables"]["user_achievements"]["Row"];
export type SketchProgress =
  Database["public"]["Tables"]["sketch_progress"]["Row"];
export type SavedArtwork =
  Database["public"]["Tables"]["saved_artworks"]["Row"];
