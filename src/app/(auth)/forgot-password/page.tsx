"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const MailIcon = () => (
    <svg className="w-5 h-5 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setIsSent(true);
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-3 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📬</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                        Check your{" "}
                        <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                            inbox
                        </span>
                    </h1>
                    <p className="text-on-surface-variant text-base">
                        We sent a password reset link to{" "}
                        <span className="font-semibold text-on-background">{email}</span>.
                        Click the link inside to choose a new password.
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-sm text-on-surface-variant">
                        Didn&apos;t receive the email? Check your spam folder or{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSent(false);
                                setError(null);
                            }}
                            className="text-primary font-semibold hover:underline"
                        >
                            try again
                        </button>
                        .
                    </p>
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm font-headline font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                    <ArrowLeftIcon />
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Forgot your password?
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                    Let&apos;s get you back to your{" "}
                    <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                        Atélier
                    </span>
                </h1>
                <p className="text-on-surface-variant text-base">
                    Enter your email and we&apos;ll send you a secure link to reset your password.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-error/10 border border-error/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-error">Something went wrong</p>
                        <p className="text-xs text-error/80">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Email Address
                    </label>
                    <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                            <MailIcon />
                        </div>
                        <input
                            type="email"
                            placeholder="artist@colorsketch.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full bg-surface-container-lowest border-2 border-transparent focus:border-primary/50 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full rounded-2xl! py-4! group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {!isLoading && (
                            <>
                                Send reset link
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </span>
                </Button>
            </form>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-headline font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
                <ArrowLeftIcon />
                Back to sign in
            </Link>
        </div>
    );
}
