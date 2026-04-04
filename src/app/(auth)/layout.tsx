import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-surface">
            {/* Navigation - same as landing page */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-lg">🎨</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-bold font-headline text-on-background">
                                Color<span className="text-primary">Sketch</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-5 sm:px-6 py-2.5 text-sm font-bold font-headline text-white btn-primary-gradient rounded-xl soft-touch shadow-md shadow-primary/20"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
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

            {/* Footer - same as landing page */}
            <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <Link href="/" className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-lg">🎨</span>
                                </div>
                                <span className="text-xl font-bold font-headline text-on-background">
                                    Color<span className="text-primary">Sketch</span>
                                </span>
                            </Link>
                            <p className="text-on-surface-variant text-sm max-w-xs mb-6">
                                Your digital canvas for mindful coloring. Relax, create, and find your calm.
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-3">
                                {["Twitter", "Instagram", "YouTube"].map((social) => (
                                    <a
                                        key={social}
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                                        aria-label={social}
                                    >
                                        {social === "Twitter" && "𝕏"}
                                        {social === "Instagram" && "📷"}
                                        {social === "YouTube" && "▶"}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold font-headline text-on-background mb-4">Product</h4>
                            <ul className="space-y-3 text-sm text-on-surface-variant">
                                <li><Link href="/signup" className="hover:text-primary transition-colors">Get Started</Link></li>
                                <li><Link href="/signup" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link href="/signup" className="hover:text-primary transition-colors">Features</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold font-headline text-on-background mb-4">Support</h4>
                            <ul className="space-y-3 text-sm text-on-surface-variant">
                                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                                <li><span className="opacity-60 cursor-not-allowed">Help Center</span></li>
                                <li><span className="opacity-60 cursor-not-allowed">Contact Us</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
                        <p>© 2026 ColorSketch. Made with 💜 for artists everywhere.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
