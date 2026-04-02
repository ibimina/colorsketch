"use client";

import { useEffect, useRef, useState } from "react";
import { FillState } from "@/types";

interface ColoredSketchPreviewProps {
    sketchPath: string;
    fills: FillState;
    className?: string;
}

/**
 * Renders an SVG sketch with applied fill colors
 * Used for thumbnails in Library and Gallery pages
 */
export function ColoredSketchPreview({ sketchPath, fills, className = "" }: ColoredSketchPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        fetch(sketchPath)
            .then((res) => res.text())
            .then((svgContent) => {
                if (!containerRef.current) return;
                
                containerRef.current.innerHTML = svgContent;
                const svg = containerRef.current.querySelector("svg");
                
                if (svg) {
                    // Make SVG responsive
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "100%");
                    svg.style.maxWidth = "100%";
                    svg.style.maxHeight = "100%";
                    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

                    // Apply fills to all elements
                    const fillableElements = svg.querySelectorAll("path, rect, circle, ellipse, polygon");
                    let autoIdCounter = 0;

                    fillableElements.forEach((el) => {
                        const element = el as SVGElement;
                        
                        // Generate ID for elements without one (same logic as canvas)
                        let regionId = element.id;
                        if (!regionId) {
                            regionId = `auto-${element.tagName.toLowerCase()}-${autoIdCounter++}`;
                        }

                        // Apply saved fill color if exists
                        if (fills[regionId]) {
                            element.setAttribute("fill", fills[regionId]);
                        }
                    });

                    // Apply background fill if exists
                    if (fills["background"]) {
                        const viewBox = svg.getAttribute("viewBox");
                        if (viewBox) {
                            const [, , width, height] = viewBox.split(" ").map(Number);
                            const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                            bgRect.setAttribute("x", "0");
                            bgRect.setAttribute("y", "0");
                            bgRect.setAttribute("width", String(width));
                            bgRect.setAttribute("height", String(height));
                            bgRect.setAttribute("fill", fills["background"]);
                            svg.insertBefore(bgRect, svg.firstChild);
                        }
                    }
                }
                
                setLoaded(true);
            })
            .catch((err) => {
                console.error("Failed to load SVG for preview:", err);
            });
    }, [sketchPath, fills]);

    return (
        <div 
            ref={containerRef} 
            className={`${className} ${loaded ? "" : "animate-pulse bg-surface-container"}`}
        />
    );
}

/**
 * Calculate coloring progress percentage
 */
export function calculateProgress(fills: FillState, totalRegions?: number): number {
    const filledCount = Object.keys(fills).filter(k => k !== "background").length;
    if (totalRegions && totalRegions > 0) {
        return Math.min(100, Math.round((filledCount / totalRegions) * 100));
    }
    // Rough estimate if total regions unknown
    return filledCount > 0 ? Math.min(100, filledCount * 5) : 0;
}
