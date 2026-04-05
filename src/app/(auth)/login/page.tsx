"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

// Icons
const MailIcon = () => (
    <svg className="w-5 h-5 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push("/home");
            router.refresh();
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: "google" | "apple") => {
        setError(null);
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8">
            {/* Header with animated gradient */}
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Welcome back, Artist
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                    Sign in to your{" "}
                    <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                        Atélier
                    </span>
                </h1>
                <p className="text-on-surface-variant text-base">
                    Continue your creative journey where you left off.
                </p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="group relative w-max flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-surface-container-lowest hover:bg-white border border-transparent hover:border-outline-variant/30 transition-all duration-300 soft-touch text-on-background font-headline font-semibold overflow-hidden"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-[#4285F4]/5 via-[#34A853]/5 to-[#EA4335]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="relative z-10">Google</span>
                </button>
                {/* <button
                    type="button"
                    onClick={() => handleOAuthLogin("apple")}
                    className="group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-surface-container-lowest hover:bg-on-background border border-transparent hover:border-on-background transition-all duration-300 soft-touch text-on-background hover:text-surface font-headline font-semibold overflow-hidden"
                >
                    <svg className="w-5 h-5 relative z-10 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span className="relative z-10">Apple</span>
                </button> */}
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-4">
                <div className="grow h-px bg-linear-to-r from-transparent via-surface-variant to-transparent"></div>
                <span className="text-on-surface-variant/70 text-xs font-headline uppercase tracking-[0.2em]">
                    or continue with email
                </span>
                <div className="grow h-px bg-linear-to-r from-transparent via-surface-variant to-transparent"></div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-error/10 border border-error/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-error">Authentication failed</p>
                        <p className="text-xs text-error/80">{error}</p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
                {/* Email Field */}
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

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="block text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-headline font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                            <LockIcon />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full bg-surface-container-lowest border-2 border-transparent focus:border-primary/50 focus:bg-white rounded-2xl py-4 pl-12 pr-12 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-6 h-6 rounded-lg border-2 border-surface-variant bg-surface-container-lowest transition-all duration-200 peer-checked:bg-primary peer-checked:border-primary group-hover:border-primary/50 flex items-center justify-center">
                            <span className={`text-white transition-all duration-200 ${rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                <CheckIcon />
                            </span>
                        </div>
                    </div>
                    <span className="text-sm font-headline font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                        Keep me signed in for 30 days
                    </span>
                </label>

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full rounded-2xl! py-4! group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {!isLoading && (
                            <>
                                Enter Atélier
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </span>
                </Button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-on-surface-variant pt-2">
                New to ColorSketch?{" "}
                <Link
                    href="/signup"
                    className="text-primary font-bold font-headline hover:underline underline-offset-4 transition-all"
                >
                    Create an account
                </Link>
            </p>
        </div>
    );
}
