"use client";

import { useSyncProgress } from "@/hooks/useSyncProgress";

/**
 * Provider component that initializes Supabase sync for authenticated users
 * Add this to layouts that require data syncing
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
    // Initialize progress sync
    useSyncProgress();

    return <>{children}</>;
}
