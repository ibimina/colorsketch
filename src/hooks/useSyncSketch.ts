"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useColoringStore } from "@/stores/coloringStore";
import { createClient } from "@/lib/supabase/client";
import type { FillState } from "@/types";

// Inline debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Hook to sync sketch coloring progress with Supabase
 * - Loads saved fills from Supabase when switching sketches
 * - Auto-saves fills to Supabase with debouncing
 * - Handles drawing data (canvas) separately
 */
export function useSyncSketch(sketchId: string) {
  const hasLoadedRef = useRef(false);
  const isSyncingRef = useRef(false);
  const prevSketchIdRef = useRef<string | null>(null);

  const { fills, setActiveSketch } = useColoringStore();

  // Debounce fills to avoid too many saves
  const debouncedFills = useDebounce(fills, 1500);

  // Load sketch progress from Supabase
  const loadSketchProgress = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      hasLoadedRef.current = true;
      return null;
    }

    try {
      const { data } = await supabase
        .from("sketch_progress")
        .select("fills, drawing_data")
        .eq("user_id", user.id)
        .eq("sketch_id", sketchId)
        .single();

      return data;
    } catch {
      return null;
    }
  }, [sketchId]);

  // Load on sketch change
  useEffect(() => {
    if (prevSketchIdRef.current === sketchId && hasLoadedRef.current) return;

    prevSketchIdRef.current = sketchId;
    hasLoadedRef.current = false;

    async function load() {
      const data = await loadSketchProgress();

      if (data?.fills && typeof data.fills === "object") {
        // Merge server fills with any current local fills
        const serverFills = data.fills as FillState;
        setActiveSketch(sketchId, serverFills);
      } else {
        setActiveSketch(sketchId, {});
      }

      hasLoadedRef.current = true;
    }

    load();
  }, [sketchId, loadSketchProgress, setActiveSketch]);

  // Save fills to Supabase when they change
  useEffect(() => {
    if (!hasLoadedRef.current || isSyncingRef.current) return;
    if (Object.keys(debouncedFills).length === 0) return;

    async function sync() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      isSyncingRef.current = true;

      try {
        await supabase.from("sketch_progress").upsert(
          {
            user_id: user.id,
            sketch_id: sketchId,
            fills: debouncedFills as unknown as Record<string, unknown>,
          },
          {
            onConflict: "user_id,sketch_id",
          },
        );
      } catch (error) {
        console.error("Failed to sync sketch progress:", error);
      }

      isSyncingRef.current = false;
    }

    sync();
  }, [debouncedFills, sketchId]);

  // Function to save drawing data (called manually after drawing)
  const saveDrawingData = useCallback(
    async (drawingData: string | null) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        await supabase.from("sketch_progress").upsert(
          {
            user_id: user.id,
            sketch_id: sketchId,
            drawing_data: drawingData,
          },
          {
            onConflict: "user_id,sketch_id",
          },
        );
      } catch (error) {
        console.error("Failed to save drawing data:", error);
      }
    },
    [sketchId],
  );

  // Function to mark sketch as complete
  const markComplete = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      await supabase.from("sketch_progress").upsert(
        {
          user_id: user.id,
          sketch_id: sketchId,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,sketch_id",
        },
      );
    } catch (error) {
      console.error("Failed to mark sketch complete:", error);
    }
  }, [sketchId]);

  // Function to reset/delete sketch progress
  const resetSketchProgress = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      await supabase
        .from("sketch_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("sketch_id", sketchId);
    } catch (error) {
      console.error("Failed to reset sketch progress:", error);
    }
  }, [sketchId]);

  return {
    saveDrawingData,
    markComplete,
    resetSketchProgress,
    loadSketchProgress,
  };
}
