import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-surface">
            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 sm:px-8 h-16 sm:h-20 backdrop-blur-xl bg-surface/80 border-b border-surface-variant/20">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary font-headline tracking-tight"
                >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white text-sm sm:text-base">🎨</span>
                    </div>
                    <span className="hidden sm:inline">ColorSketch</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/home"
                        className="text-on-surface-variant hover:text-primary transition-all font-headline font-medium"
                    >
                        Explore
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="hidden sm:inline-flex px-5 py-2 rounded-full font-headline font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-headline font-bold text-white btn-primary-gradient soft-touch text-sm sm:text-base"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="min-h-screen pt-16 sm:pt-20 flex overflow-hidden">
                {/* Left: Illustration Side (hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-primary/5 via-surface-container-low to-secondary/5 items-center justify-center overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        {/* Floating Circles */}
                        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
                        <div className="absolute top-[60%] left-[30%] w-56 h-56 bg-tertiary/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--primary)/5_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)/5_1px,transparent_1px)] bg-size-[4rem_4rem]"></div>
                    </div>

                    {/* Main Content Card */}
                    <div className="relative z-10 w-full max-w-lg mx-12">
                        {/* Featured Art Card */}
                        <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl shadow-primary/10">
                            {/* Card Header with Gradient */}
                            <div className="h-48 bg-linear-to-br from-primary via-secondary to-tertiary relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-8xl opacity-90">🎨</div>
                                </div>
                                {/* Sparkles */}
                                <div className="absolute top-4 left-6 text-2xl animate-bounce [animation-delay:0.5s]">✨</div>
                                <div className="absolute top-8 right-8 text-xl animate-bounce [animation-delay:1s]">⭐</div>
                                <div className="absolute bottom-6 left-12 text-lg animate-bounce [animation-delay:1.5s]">💫</div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8">
                                <h3 className="text-2xl font-headline font-bold text-on-background mb-2">
                                    Unleash Your Creativity
                                </h3>
                                <p className="text-on-surface-variant leading-relaxed">
                                    Join 50,000+ artists creating beautiful digital masterpieces every day with ColorSketch.
                                </p>

                                {/* Stats */}
                                <div className="flex gap-6 mt-6 pt-6 border-t border-surface-variant/30">
                                    <div>
                                        <div className="text-2xl font-bold text-primary">100+</div>
                                        <div className="text-xs text-on-surface-variant uppercase tracking-wider">Sketches</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-secondary">50K+</div>
                                        <div className="text-xs text-on-surface-variant uppercase tracking-wider">Artists</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-tertiary">∞</div>
                                        <div className="text-xs text-on-surface-variant uppercase tracking-wider">Colors</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Mini Cards */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-tertiary/20 backdrop-blur-sm border border-tertiary/30 flex items-center justify-center shadow-xl rotate-12 animate-[float_6s_ease-in-out_infinite]">
                            <span className="text-4xl">🌈</span>
                        </div>
                        <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-xl -rotate-12 animate-[float_5s_ease-in-out_infinite_0.5s]">
                            <span className="text-3xl">✏️</span>
                        </div>
                    </div>
                </div>

                {/* Right: Form Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 bg-surface overflow-y-auto">
                    {children}
                </div>
            </main>

            {/* Minimal Footer - only visible on large screens */}
            <footer className="hidden lg:flex w-full py-6 px-8 justify-between items-center bg-surface text-xs font-body border-t border-surface-variant/20">
                <div className="text-on-surface-variant">
                    © 2026 ColorSketch Atélier
                </div>
                <div className="flex gap-6 text-on-surface-variant">
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
                </div>
            </footer>
        </div>
    );
}
