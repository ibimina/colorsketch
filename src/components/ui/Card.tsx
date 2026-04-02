"use client";

import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "elevated" | "filled" | "glass";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
    elevated: "bg-surface-container-lowest canvas-shadow",
    filled: "bg-surface-container",
    glass: "glass ghost-border",
};

const paddingStyles: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = "elevated",
            padding = "md",
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`
          rounded-2xl
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";
