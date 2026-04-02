"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full
            bg-surface-container-lowest
            border-none
            input-ring
            focus:outline-none
            rounded-xl
            py-4 px-6
            text-on-surface
            font-body
            placeholder:text-on-surface-variant/50
            transition-all duration-150
            ${error ? "!shadow-[inset_0_0_0_2px_var(--error)]" : ""}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-error ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
