"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

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

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setHasSession(!!data.user);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setError(error.message);
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/home");
                router.refresh();
            }, 2000);
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (hasSession === false) {
        return (
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-3 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-error/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                        Link expired or invalid
                    </h1>
                    <p className="text-on-surface-variant text-base">
                        Your password reset link is no longer valid. Please request a new one.
                    </p>
                </div>

                <Link href="/forgot-password" className="block">
                    <Button size="lg" className="w-full rounded-2xl! py-4!">
                        Request new link
                    </Button>
                </Link>

                <Link
                    href="/login"
                    className="block text-center text-sm font-headline font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                    Back to sign in
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-3 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                        Password updated!
                    </h1>
                    <p className="text-on-surface-variant text-base">
                        Redirecting you to your atélier…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Almost there
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-background">
                    Choose a new{" "}
                    <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                        password
                    </span>
                </h1>
                <p className="text-on-surface-variant text-base">
                    Pick a strong password you haven&apos;t used before. It should be at least 8 characters long.
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
                        <p className="text-sm font-medium text-error">Couldn&apos;t update password</p>
                        <p className="text-xs text-error/80">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        New Password
                    </label>
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
                            minLength={8}
                            autoComplete="new-password"
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

                <div className="space-y-2">
                    <label className="block text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                        Confirm Password
                    </label>
                    <div className={`relative group transition-all duration-300 ${focusedField === 'confirm' ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                            <LockIcon />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField('confirm')}
                            onBlur={() => setFocusedField(null)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="w-full bg-surface-container-lowest border-2 border-transparent focus:border-primary/50 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    disabled={hasSession === null}
                    className="w-full rounded-2xl! py-4! group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {!isLoading && (
                            <>
                                Update password
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </span>
                </Button>
            </form>
        </div>
    );
}
