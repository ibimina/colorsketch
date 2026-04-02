"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FillState } from "@/types";

export interface SketchProgressData {
    sketch_id: string;
    fills: FillState;
    drawing_data: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Hook to fetch all sketch progress for the current user
 * Returns a map of sketch_id -> progress data
 */
export function useSketchProgress() {
    const [progressMap, setProgressMap] = useState<Record<string, SketchProgressData>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProgress() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("sketch_progress")
                    .select("*")
                    .eq("user_id", user.id);

                if (error) {
                    console.error("Error fetching sketch progress:", error);
                    setIsLoading(false);
                    return;
                }

                // Convert array to map for easy lookup
                const map: Record<string, SketchProgressData> = {};
                data?.forEach((item) => {
                    map[item.sketch_id] = {
                        sketch_id: item.sketch_id,
                        fills: (item.fills as FillState) || {},
                        drawing_data: item.drawing_data,
                        completed_at: item.completed_at,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    };
                });

                setProgressMap(map);
            } catch (err) {
                console.error("Error loading sketch progress:", err);
            }

            setIsLoading(false);
        }

        loadProgress();
    }, []);

    return { progressMap, isLoading };
}
