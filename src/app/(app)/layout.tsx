"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Icons } from "@/lib/icons";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { createClient } from "@/lib/supabase/client";
import { useProgressStore } from "@/stores/progressStore";
import { ToastContainer } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const navItems = [
    { href: "/home", label: "Home", Icon: Icons.Home },
    { href: "/explore", label: "Explore", Icon: Icons.Search },
    { href: "/library", label: "Library", Icon: Icons.Library },
    { href: "/gallery", label: "Gallery", Icon: Icons.Gallery },
    { href: "/settings", label: "Settings", Icon: Icons.Settings },
];

// Helper to get level title
function getLevelTitle(level: number): string {
    if (level >= 50) return "Master Artist";
    if (level >= 30) return "Expert Artist";
    if (level >= 20) return "Advanced Artist";
    if (level >= 10) return "Skilled Artist";
    if (level >= 5) return "Apprentice Artist";
    return "Beginner Artist";
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);
    const { level } = useProgressStore();

    // Logout handler
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    // Fetch user data from Supabase
    useEffect(() => {
        async function loadUserData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Try to get name from user_profiles first
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("name")
                    .eq("id", user.id)
                    .single();

                if (profile?.name) {
                    setUserName(profile.name);
                } else {
                    // Fallback to email username
                    setUserName(user.email?.split("@")[0] ?? "Artist");
                }
            }
        }

        loadUserData();
    }, []);

    return (
        <SyncProvider>
            <div className="min-h-screen flex bg-surface overflow-x-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-surface-container-low p-6 gap-6">
                    {/* Logo */}
                    <div className="shrink-0 mb-4">
                        <Link href="/explore" className="block">
                            <span className="text-2xl font-bold text-primary font-headline">
                                ColorSketch
                            </span>
                            <span className="block text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                                Digital Atélier
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/explore" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-label={item.label}
                                    className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  font-headline font-medium
                  transition-all duration-150
                  ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                                        }
                `}
                                >
                                    <item.Icon className="w-5 h-5" aria-hidden="true" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="shrink-0 pt-4 border-t border-surface-variant/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                                <Icons.Profile className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-headline font-bold text-sm truncate">
                                    {userName ?? "Guest"}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                    Level {level} • {getLevelTitle(level)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    {/* Top Bar */}
                    <header className={`flex items-center justify-end px-4 sm:px-6 py-4 bg-surface glass sticky top-0 z-40 ${pathname.startsWith('/canvas') ? 'hidden' : ''}`}>
                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                aria-label="Notifications"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                            >
                                <Icons.Notification className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                aria-label="Profile menu"
                                className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                            >
                                <Icons.Profile className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className={`flex-1 ${pathname.startsWith('/canvas') ? '' : 'p-4 sm:p-6'}`}>{children}</div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface glass border-t border-surface-variant/30 px-4 py-2 z-50">
                    <div className="flex justify-around">
                        {navItems.slice(0, 5).map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/explore" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-label={item.label}
                                    className={`
                  flex flex-col items-center gap-1 p-2 rounded-xl
                  ${isActive ? "text-primary" : "text-on-surface-variant"}
                `}
                                >
                                    <item.Icon className="w-5 h-5" aria-hidden="true" />
                                    <span className="text-xs font-headline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Toast Notifications */}
                <ToastContainer />
            </div>
        </SyncProvider>
    );
}
