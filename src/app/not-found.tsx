import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4 sm:p-8">
            <div className="max-w-md text-center space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                    <div className="text-6xl sm:text-7xl md:text-8xl">🎨</div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">404</h1>
                    <h2 className="text-xl sm:text-2xl font-headline font-bold">Page Not Found</h2>
                    <p className="text-on-surface-variant text-base sm:text-lg">
                        Looks like this canvas doesn&apos;t exist yet. Let&apos;s get you back to the atélier.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/home">
                        <Button variant="primary" size="lg">
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/library">
                        <Button variant="secondary" size="lg">
                            Browse Library
                        </Button>
                    </Link>
                </div>

                <div className="pt-8 text-sm text-on-surface-variant">
                    <p>Lost? Try one of these:</p>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        <Link href="/explore" className="text-primary hover:underline">
                            Explore
                        </Link>
                        <Link href="/profile" className="text-primary hover:underline">
                            Profile
                        </Link>
                        <Link href="/settings" className="text-primary hover:underline">
                            Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
