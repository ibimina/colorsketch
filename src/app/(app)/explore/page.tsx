"use client";

import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { Icons } from "@/lib/icons";
import { Leaderboard } from "@/components/Leaderboard";

const categories = [
    { id: "animals", label: "Animals", emoji: "🦋", href: "/library?category=animals" },
    { id: "botanical", label: "Botanical", emoji: "🌸", href: "/library?category=botanical" },
    { id: "mandalas", label: "Mandalas", emoji: "🔮", href: "/library?category=mandalas" },
    { id: "fantasy", label: "Fantasy", emoji: "🐉", href: "/library?category=fantasy" },
    { id: "geometric", label: "Geometric", emoji: "🔲", href: "/library?category=geometric" },
    { id: "abstract", label: "Abstract", emoji: "🎨", href: "/library?category=abstract" },
];

export default function ExplorePage() {
    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-headline font-bold">
                        Explore Sketches
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
                        Discover beautiful artwork to bring to life with your colors
                    </p>
                </div>

                {/* Search Bar */}
                <Card variant="elevated" className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Icons.Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                        <input
                            type="text"
                            placeholder="Search for sketches, categories, themes..."
                            className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.location.href = '/library';
                                }
                            }}
                        />
                        <Link href="/library">
                            <Button variant="primary" size="sm">
                                Browse All
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Browse Categories */}
                <section>
                    <h2 className="text-xl sm:text-2xl font-headline font-bold mb-6 text-center">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={cat.href}
                                className="group"
                            >
                                <Card
                                    variant="elevated"
                                    className="text-center hover:scale-105 transition-transform"
                                >
                                    <div className="text-4xl sm:text-5xl mb-3">{cat.emoji}</div>
                                    <p className="font-headline font-medium">
                                        {cat.label}
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Top Artists This Week */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-2xl font-headline font-bold">
                            🏆 Top Artists This Week
                        </h2>
                        <Link
                            href="/leaderboard"
                            className="text-primary font-headline font-medium text-sm hover:underline"
                        >
                            View All →
                        </Link>
                    </div>
                    <Leaderboard
                        limit={5}
                        showPeriodToggle={false}
                        defaultPeriod="weekly"
                        title="Top Artists This Week"
                    />
                </section>

                {/* Coming Soon Banner */}
                <Card
                    variant="filled"
                    className="bg-linear-to-br from-primary/10 via-secondary/10 to-tertiary/10 text-center py-12"
                >
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-5xl sm:text-6xl">🎨</div>
                        <h3 className="text-xl sm:text-2xl font-headline font-bold">
                            More Features Coming Soon
                        </h3>
                        <p className="text-on-surface-variant">
                            We're working on featured sketches, curated collections, and artist spotlights.
                            For now, explore our full library of beautiful artwork.
                        </p>
                        <Link href="/library">
                            <Button variant="primary" size="lg">
                                View Full Library
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
