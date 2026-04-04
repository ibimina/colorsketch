import { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-surface overflow-x-hidden">
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
            <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
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
