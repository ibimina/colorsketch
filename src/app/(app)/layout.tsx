"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Icons } from "@/lib/icons";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { createClient } from "@/lib/supabase/client";
import { useProgressStore } from "@/stores/progressStore";
import { ToastContainer } from "@/components/Toast";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

const navItems = [
    { href: "/home", label: "Home", Icon: Icons.Home },
    { href: "/library", label: "Library", Icon: Icons.Library },
    { href: "/favorites", label: "Favorites", Icon: Icons.Heart },
    { href: "/profile", label: "Profile", Icon: Icons.Profile },
    { href: "/leaderboard", label: "Leaderboard", Icon: Icons.Trophy, desktopOnly: true },
    { href: "/settings", label: "Settings", Icon: Icons.Settings },
];

// Items shown directly in the mobile bottom nav (in order). The rest spill
// into the "More" bottom sheet.
const mobilePrimaryHrefs = new Set(["/home", "/library", "/favorites", "/profile"]);

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
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
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
                // Try to get name and avatar from user_profiles first
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("name, avatar_url")
                    .eq("id", user.id)
                    .single();

                // Set name: profile > auth metadata > email
                if (profile?.name) {
                    setUserName(profile.name);
                } else if (user.user_metadata?.full_name || user.user_metadata?.name) {
                    setUserName(user.user_metadata.full_name || user.user_metadata.name);
                } else {
                    setUserName(user.email?.split("@")[0] ?? "Artist");
                }

                // Set avatar: profile > auth metadata (picture for Google, avatar_url for others)
                if (profile?.avatar_url) {
                    setUserAvatar(profile.avatar_url);
                } else if (user.user_metadata?.picture || user.user_metadata?.avatar_url) {
                    setUserAvatar(user.user_metadata.picture || user.user_metadata.avatar_url);
                }
            }
        }

        loadUserData();
    }, []);

    return (
        <SyncProvider>
            <div className="min-h-screen bg-surface overflow-x-hidden">
                {/* Sidebar - Desktop (Fixed) */}
                <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-surface-container-low p-6 gap-6 z-40">
                    {/* Logo */}
                    <div className="shrink-0 mb-4">
                        <Link href="/home" className="block">
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
                                (item.href !== "/home" && pathname.startsWith(item.href));

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
                            {userAvatar ? (
                                <Image
                                    src={userAvatar}
                                    alt={userName || "Profile"}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                                    <Icons.Profile className="w-5 h-5 text-primary" />
                                </div>
                            )}
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
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
                    {/* Top Bar */}
                    <header className={`flex items-center justify-end px-4 sm:px-6 py-4 bg-surface glass sticky top-0 z-40 ${pathname.startsWith('/canvas') ? 'hidden' : ''}`}>
                        <NotificationBell />
                    </header>

                    {/* Page Content */}
                    <div className={`flex-1 ${pathname.startsWith('/canvas') ? '' : 'p-4 sm:p-6'}`}>{children}</div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className={`lg:hidden fixed bottom-0 left-0 right-0 bg-surface glass border-t border-surface-variant/30 px-4 py-2 z-50 ${pathname.startsWith('/canvas') ? 'hidden' : ''}`}>
                    <div className="flex justify-around">
                        {navItems.filter(item => mobilePrimaryHrefs.has(item.href)).map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/home" && pathname.startsWith(item.href));

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
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen(true)}
                            aria-label="More"
                            aria-expanded={isMoreOpen}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl ${isMoreOpen ? "text-primary" : "text-on-surface-variant"}`}
                        >
                            <Icons.More className="w-5 h-5" aria-hidden="true" />
                            <span className="text-xs font-headline">More</span>
                        </button>
                    </div>
                </nav>

                {/* Mobile More Sheet */}
                {isMoreOpen && (
                    <div className="lg:hidden fixed inset-0 z-60">
                        {/* Backdrop */}
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setIsMoreOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        />
                        {/* Sheet */}
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="More options"
                            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl pt-2 pb-6 px-4 animate-in slide-in-from-bottom duration-200"
                        >
                            {/* Grabber */}
                            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-surface-variant" />

                            {/* Profile preview */}
                            <div className="flex items-center gap-3 px-2 py-3">
                                {userAvatar ? (
                                    <Image
                                        src={userAvatar}
                                        alt={userName || "Profile"}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                                        <Icons.Profile className="w-5 h-5 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-headline font-bold text-sm truncate">
                                        {userName ?? "Guest"}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        Level {level} • {getLevelTitle(level)}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-surface-variant/40 my-2" />

                            {/* Overflow nav items */}
                            <div className="space-y-1">
                                {navItems
                                    .filter(item => !mobilePrimaryHrefs.has(item.href))
                                    .map((item) => {
                                        const isActive = pathname === item.href ||
                                            (item.href !== "/home" && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                aria-label={item.label}
                                                onClick={() => setIsMoreOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-medium transition-colors ${isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-on-surface hover:bg-surface-container"
                                                    }`}
                                            >
                                                <item.Icon className="w-5 h-5" aria-hidden="true" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors font-headline font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notifications */}
                <ToastContainer />

                {/* Level Up Celebration */}
                <LevelUpCelebration />
            </div>
        </SyncProvider>
    );
}
