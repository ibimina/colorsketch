"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "primary" | "secondary" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    label?: string; // For accessibility
}

const variantStyles: Record<IconButtonVariant, string> = {
    primary: "btn-primary-gradient text-white",
    secondary: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
    ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-low",
};

const sizeStyles: Record<IconButtonSize, string> = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            icon,
            variant = "ghost",
            size = "md",
            label,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                aria-label={label}
                className={`
          inline-flex items-center justify-center
          rounded-full
          soft-touch
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                {...props}
            >
                {icon}
            </button>
        );
    }
);

IconButton.displayName = "IconButton";
