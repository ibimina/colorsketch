"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Card, IconButton } from "@/components/ui";
import { useColoringStore } from "@/stores/coloringStore";
import { useToastStore } from "@/stores/toastStore";
import { useProgressStore } from "@/stores/progressStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useSyncSketch } from "@/hooks/useSyncSketch";
import { DEFAULT_PALETTE } from "@/types";
import { Icons } from "@/lib/icons";
import { provideFeedback, ambientMusic } from "@/lib/feedback";
import { PublishModal } from "@/components/PublishModal";
import { saveArtwork } from "@/lib/actions";
import html2canvas from "html2canvas";

// Sketch metadata
const sketchData: Record<string, { title: string; file: string }> = {
    butterfly: { title: "Monarch Butterfly", file: "/sketches/butterfly.svg" },
    rose: { title: "Elegant Rose", file: "/sketches/rose.svg" },
    mandala: { title: "Sacred Mandala", file: "/sketches/mandala.svg" },
    hummingbird: { title: "Hummingbird Garden", file: "/sketches/hummingbird.svg" },
    "koi-fish": { title: "Japanese Koi", file: "/sketches/koi-fish.svg" },
    owl: { title: "Wise Owl", file: "/sketches/owl.svg" },
    lotus: { title: "Lotus Bloom", file: "/sketches/lotus.svg" },
    fox: { title: "Woodland Fox", file: "/sketches/fox.svg" },
};

interface CanvasPageProps {
    params: Promise<{ id: string }>;
}

export default function CanvasPage({ params }: CanvasPageProps) {
    const { id } = use(params);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const artworkRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const { addToast } = useToastStore();
    const { addXP, incrementSketches, checkAndUnlockAchievements } = useProgressStore();
    const { hapticFeedback, soundEffects } = usePreferencesStore();

    // Sync sketch progress with Supabase
    const { saveDrawingData, markComplete, resetSketchProgress } = useSyncSketch(id);

    const {
        fills,
        selectedColor,
        history,
        redoStack,
        setColor,
        fillRegion,
        undo,
        redo,
        reset,
    } = useColoringStore();

    const [mode, setMode] = useState<"fill" | "draw">("fill");
    const [zoom, setZoom] = useState(100);
    const [brushSize, setBrushSize] = useState<number>(8);

    // Brush sizes
    const brushSizes = [
        { name: "S", size: 4 },
        { name: "M", size: 8 },
        { name: "L", size: 16 },
        { name: "XL", size: 32 },
    ];

    // Storage key for this sketch's drawing
    const drawingStorageKey = `colorsketch-drawing-${id}`;

    // Save drawing to localStorage and Supabase
    const saveDrawing = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        // Only save if there's actual content (not blank)
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasContent = imageData.data.some((channel, index) =>
                index % 4 === 3 && channel > 0 // Check alpha channel
            );
            if (hasContent) {
                localStorage.setItem(drawingStorageKey, dataUrl);
                // Also sync to Supabase
                saveDrawingData(dataUrl);
            } else {
                localStorage.removeItem(drawingStorageKey);
                saveDrawingData(null);
            }
        }
    };

    // Initialize drawing canvas
    useEffect(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match SVG container
        canvas.width = 600;
        canvas.height = 600;

        // Restore saved drawing after canvas is ready
        const savedDrawing = localStorage.getItem(drawingStorageKey);
        if (savedDrawing) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedDrawing;
        }
    }, [svgContent, drawingStorageKey]);

    // Drawing handlers
    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Handle both mouse and touch events
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (mode !== "draw") return;
        e.preventDefault();
        setIsDrawing(true);
        const coords = getCanvasCoords(e);
        lastPos.current = coords;

        // Draw a dot at the start position
        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx) {
            ctx.fillStyle = selectedColor;
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || mode !== "draw") return;
        e.preventDefault();

        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !lastPos.current) return;

        const coords = getCanvasCoords(e);

        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        lastPos.current = coords;
    };

    const stopDrawing = () => {
        if (isDrawing) {
            // Save drawing when stroke ends
            saveDrawing();
        }
        setIsDrawing(false);
        lastPos.current = null;
    };

    const clearDrawing = () => {
        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Clear saved drawing from localStorage
            localStorage.removeItem(drawingStorageKey);
        }
    };

    // Track if SVG DOM setup is complete
    const svgSetupDone = useRef(false);
    const elementsSetupDone = useRef(false);
    const svgInjected = useRef(false);

    // Get sketch info - use sketchData if available, otherwise generate from ID
    const sketch = sketchData[id] || {
        title: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        file: `/sketches/${id}.svg`
    };

    // Load SVG content
    useEffect(() => {
        if (!sketch.file) {
            setLoading(false);
            return;
        }

        fetch(sketch.file)
            .then((res) => res.text())
            .then((content) => {
                setSvgContent(content);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load SVG:", err);
                setLoading(false);
            });
    }, [sketch.file]);

    // Inject SVG content only once
    useEffect(() => {
        if (!svgContainerRef.current || !svgContent || svgInjected.current) return;

        svgContainerRef.current.innerHTML = svgContent;
        svgInjected.current = true;
        console.log("SVG injected once");
    }, [svgContent]);

    // Initial SVG setup (runs once when SVG loads)
    useEffect(() => {
        if (!svgContainerRef.current || !svgContent) return;

        const container = svgContainerRef.current;
        const svg = container.querySelector("svg");
        if (!svg || svgSetupDone.current) return;

        console.log("Initial SVG setup...");

        // Make SVG responsive and preserve aspect ratio
        const viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
            svg.setAttribute("viewBox", viewBox);
        }

        // Set fixed sizing
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = "100%";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Add background rectangle for coloring
        if (viewBox) {
            const [, , width, height] = viewBox.split(" ").map(Number);
            const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bgRect.setAttribute("id", "background");
            bgRect.setAttribute("x", "0");
            bgRect.setAttribute("y", "0");
            bgRect.setAttribute("width", String(width));
            bgRect.setAttribute("height", String(height));
            bgRect.setAttribute("fill", fills["background"] || "#ffffff");
            // Insert as first child so it's behind everything
            svg.insertBefore(bgRect, svg.firstChild);
        }

        svgSetupDone.current = true;
    }, [svgContent, fills]);

    // Setup fillable elements (runs once)
    useEffect(() => {
        if (!svgContainerRef.current || !svgInjected.current) return;

        const container = svgContainerRef.current;
        const svg = container.querySelector("svg");
        if (!svg || elementsSetupDone.current) return;

        console.log("Setting up fillable elements...");

        // Find all potentially fillable elements (not just those with IDs)
        const fillableElements = svg.querySelectorAll("path, rect, circle, ellipse, polygon");
        console.log(`Found ${fillableElements.length} fillable elements`);

        let autoIdCounter = 0;
        fillableElements.forEach((el) => {
            const element = el as SVGElement;

            // Generate ID for elements without one
            let regionId = element.id;
            if (!regionId) {
                regionId = `auto-${element.tagName.toLowerCase()}-${autoIdCounter++}`;
                element.id = regionId;
            }

            console.log(`Making ${element.tagName} fillable: ${regionId}`);

            // Apply saved fill color if exists
            if (fills[regionId]) {
                element.setAttribute("fill", fills[regionId]);
            }

            // Add cursor and interaction styles
            element.style.cursor = "pointer";

            // Store element reference for later use
            (element as SVGElement & { __regionId?: string }).__regionId = regionId;
        });

        elementsSetupDone.current = true;
    }, [svgContent, fills]);

    // Update event handlers when mode or color changes
    useEffect(() => {
        if (!svgContainerRef.current || !svgInjected.current || !elementsSetupDone.current) return;

        const container = svgContainerRef.current;
        const svg = container.querySelector("svg");
        if (!svg) return;

        console.log("Updating event handlers...", { mode, selectedColor });

        const fillableElements = svg.querySelectorAll("path, rect, circle, ellipse, polygon");

        fillableElements.forEach((el) => {
            const element = el as SVGElement;
            const regionId = element.id;

            // Skip elements without IDs (shouldn't happen after setup)
            if (!regionId) return;

            // Remove old handler if exists
            const oldHandler = (element as SVGElement & { __clickHandler?: EventListener }).__clickHandler;
            if (oldHandler) {
                element.removeEventListener('click', oldHandler);
            }

            // Click handler with current mode and color
            const clickHandler = (e: Event) => {
                e.stopPropagation();
                console.log(`Clicked region: ${regionId}, mode: ${mode}, color: ${selectedColor}`);

                if (mode === "fill") {
                    // Immediately apply the color to DOM
                    element.setAttribute("fill", selectedColor);

                    // Update the store for persistence
                    fillRegion(regionId);

                    // Provide haptic feedback
                    provideFeedback({
                        haptic: hapticFeedback,
                        hapticType: 'light',
                        sound: soundEffects,
                        soundName: 'click',
                    });
                }
            };

            element.addEventListener('click', clickHandler);
            (element as SVGElement & { __clickHandler?: EventListener }).__clickHandler = clickHandler;

            // Hover handlers
            element.onmouseenter = () => {
                element.style.opacity = "0.8";
            };

            element.onmouseleave = () => {
                element.style.opacity = "1";
            };
        });
    }, [mode, selectedColor, fillRegion, hapticFeedback, soundEffects]);

    // Sync fills from store (for undo/redo)
    useEffect(() => {
        if (!svgContainerRef.current || !elementsSetupDone.current) return;

        const svg = svgContainerRef.current.querySelector("svg");
        if (!svg) return;

        Object.entries(fills).forEach(([regionId, color]) => {
            const element = svg.querySelector(`#${CSS.escape(regionId)}`);
            if (element) {
                element.setAttribute("fill", color);
            }
        });
    }, [fills]);

    const handleExport = async () => {
        if (!artworkRef.current || isExporting) return;

        setIsExporting(true);
        addToast('Preparing your artwork...', 'info');

        // Temporarily reset zoom for consistent export
        const originalZoom = zoom;
        setZoom(100);

        // Wait for zoom animation to complete
        await new Promise(resolve => setTimeout(resolve, 250));

        try {
            const canvas = await html2canvas(artworkRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality export
                logging: false,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${sketch.title}-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    addToast('✨ Artwork exported successfully!', 'success');
                    addXP(50); // Reward for completing and exporting
                    incrementSketches(); // Track completion

                    // Check for new achievements
                    const newAchievements = checkAndUnlockAchievements();
                    newAchievements.forEach((achievement) => {
                        setTimeout(() => {
                            addToast(`🏆 Achievement Unlocked: ${achievement.title}!`, 'success');
                        }, 500);
                    });

                    // Provide feedback
                    provideFeedback({
                        haptic: hapticFeedback,
                        hapticType: 'heavy',
                        sound: soundEffects,
                        soundName: 'success',
                    });
                }
            }, 'image/png');
        } catch (error) {
            console.error('Export failed:', error);
            addToast('Export failed. Please try again.', 'error');

            provideFeedback({
                haptic: hapticFeedback,
                hapticType: 'medium',
                sound: soundEffects,
                soundName: 'error',
            });
        } finally {
            setIsExporting(false);
            setZoom(originalZoom); // Restore original zoom
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            // Zustand already persists to localStorage automatically
            // Also mark as a save point in Supabase
            await markComplete();

            addToast('💾 Progress saved!', 'success');
            addXP(10); // Small reward for saving progress

            // Provide haptic feedback
            provideFeedback({
                haptic: hapticFeedback,
                hapticType: 'medium',
                sound: soundEffects,
                soundName: 'success',
            });
        } catch (error) {
            console.error('Save failed:', error);
            addToast('Save failed. Please try again.', 'error');
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleShare = async () => {
        if (!artworkRef.current || isSharing) return;

        setIsSharing(true);
        addToast('Preparing to share...', 'info');

        try {
            const canvas = await html2canvas(artworkRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
            });

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (!blob) {
                addToast('Failed to generate image', 'error');
                setIsSharing(false);
                return;
            }

            const file = new File([blob], `${sketch.title}.png`, { type: 'image/png' });

            // Share text
            const shareText = `✨ Look what I colored on ColorSketch!\n\n🎨 "${sketch.title}"\n\nTry it yourself!`;

            // Check if Web Share API is available (mainly mobile)
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: `My ${sketch.title} Artwork`,
                    text: shareText,
                    files: [file],
                });
                addToast('Shared successfully! 🎉', 'success');
            } else {
                // Fallback: download the image
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ColorSketch-${sketch.title}.png`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Image saved! Share it anywhere 📤', 'success');
            }

            provideFeedback({
                haptic: hapticFeedback,
                hapticType: 'medium',
                sound: soundEffects,
                soundName: 'success',
            });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
                addToast('Share failed. Please try again.', 'error');
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handlePublishToGallery = async (isPublic: boolean) => {
        if (!artworkRef.current || isPublishing) return;

        setIsPublishing(true);

        // Temporarily reset zoom for consistent image
        const originalZoom = zoom;
        setZoom(100);
        await new Promise(resolve => setTimeout(resolve, 250));

        try {
            const canvas = await html2canvas(artworkRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
            });

            // Convert to base64 data URL
            const imageDataUrl = canvas.toDataURL('image/png');

            // Create thumbnail (smaller size)
            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 200;
            thumbnailCanvas.height = 200;
            const thumbCtx = thumbnailCanvas.getContext('2d');
            if (thumbCtx) {
                thumbCtx.drawImage(canvas, 0, 0, 200, 200);
            }
            const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.8);

            // Save to database
            const result = await saveArtwork(id, imageDataUrl, thumbnailDataUrl, isPublic);

            if (result.error) {
                throw new Error(result.error);
            }

            // Mark as complete
            await markComplete();

            addToast(
                isPublic
                    ? '🎨 Artwork published to community!'
                    : '💾 Artwork saved to your gallery!',
                'success'
            );

            addXP(isPublic ? 75 : 50); // More XP for sharing publicly
            incrementSketches();

            // Check for new achievements
            const newAchievements = checkAndUnlockAchievements();
            newAchievements.forEach((achievement) => {
                setTimeout(() => {
                    addToast(`🏆 Achievement Unlocked: ${achievement.title}!`, 'success');
                }, 500);
            });

            provideFeedback({
                haptic: hapticFeedback,
                hapticType: 'heavy',
                sound: soundEffects,
                soundName: 'success',
            });

            setShowPublishModal(false);
        } catch (error) {
            console.error('Publish failed:', error);
            addToast('Failed to save artwork. Please try again.', 'error');

            provideFeedback({
                haptic: hapticFeedback,
                hapticType: 'medium',
                sound: soundEffects,
                soundName: 'error',
            });
        } finally {
            setIsPublishing(false);
            setZoom(originalZoom);
        }
    };

    const handleReset = () => {
        // Reset fills from store
        reset();
        // Clear drawing canvas
        clearDrawing();
        // Reset Supabase progress for this sketch
        resetSketchProgress();
        addToast('Canvas reset!', 'info');
    };

    // Toggle ambient music
    const toggleMusic = () => {
        if (isMusicPlaying) {
            ambientMusic.stop();
            setIsMusicPlaying(false);
        } else {
            ambientMusic.start();
            setIsMusicPlaying(true);
        }
    };

    // Stop music when leaving the page
    useEffect(() => {
        return () => {
            ambientMusic.stop();
        };
    }, []);

    // Get sketch title based on ID (mock data)
    const sketchTitle = sketch.title;

    return (
        <div className="flex flex-col h-screen lg:h-[calc(100vh-4rem)] relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between py-3 px-4 bg-surface glass sticky top-0 z-40">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/library">
                        <IconButton
                            icon={<Icons.Back className="w-4 h-4 sm:w-5 sm:h-5" />}
                            variant="ghost"
                            label="Back to library"
                        />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-xl font-headline font-bold">{sketchTitle}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <IconButton
                        icon={isMusicPlaying
                            ? <Icons.Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            : <Icons.MusicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        }
                        variant="ghost"
                        label={isMusicPlaying ? "Stop music" : "Play ambient music"}
                        onClick={toggleMusic}
                    />
                    <IconButton
                        icon={<Icons.Export className="w-4 h-4 sm:w-5 sm:h-5" />}
                        variant="ghost"
                        label="Export artwork"
                        onClick={handleExport}
                        disabled={isExporting}
                    />
                    <IconButton
                        icon={<Icons.Share className="w-4 h-4 sm:w-5 sm:h-5" />}
                        variant="ghost"
                        label="Share artwork"
                        onClick={handleShare}
                        disabled={isSharing}
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 sm:px-4 flex items-center whitespace-nowrap"
                    >
                        <Icons.Save className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" />
                        <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowPublishModal(true)}
                        className="px-3 sm:px-4 flex items-center whitespace-nowrap"
                    >
                        <span className="mr-1.5 sm:mr-2 shrink-0">✓</span>
                        <span className="hidden sm:inline">Done</span>
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-4 bg-surface-container-low rounded-2xl m-4 overflow-auto">
                <div
                    className="flex items-center justify-center"
                    style={{
                        minHeight: "100%",
                        minWidth: "100%"
                    }}
                >
                    <div
                        style={{
                            width: `${600 * (zoom / 100)}px`,
                            height: `${600 * (zoom / 100)}px`,
                            padding: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <Card
                            variant="elevated"
                            padding="none"
                            className="bg-white w-full h-full flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-on-surface-variant">Loading sketch...</p>
                                </div>
                            ) : svgContent ? (
                                <div
                                    ref={artworkRef}
                                    style={{
                                        position: "relative",
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: "center",
                                        transition: "transform 0.2s ease-out",
                                        width: "600px",
                                        height: "600px",
                                    }}
                                >
                                    {/* SVG Layer */}
                                    <div
                                        ref={svgContainerRef}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            pointerEvents: mode === "fill" ? "auto" : "none",
                                        }}
                                    />
                                    {/* Drawing Canvas Layer */}
                                    <canvas
                                        ref={drawingCanvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        onTouchCancel={stopDrawing}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            width: "100%",
                                            height: "100%",
                                            cursor: mode === "draw" ? "crosshair" : "default",
                                            pointerEvents: mode === "draw" ? "auto" : "none",
                                            touchAction: mode === "draw" ? "none" : "auto",
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-4xl mb-4">🎨</p>
                                    <p className="text-on-surface-variant">
                                        Sketch not found. Try another one from the library.
                                    </p>
                                    <Link href="/library" className="mt-4 inline-block">
                                        <Button variant="primary">Browse Library</Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Left Sidebar - Colors */}
            <div className="fixed left-2 sm:left-6 lg:left-76 top-1/2 -translate-y-1/2 z-40">
                <div className="bg-surface/95 backdrop-blur-lg border border-surface-variant/30 rounded-2xl shadow-lg p-1.5">
                    <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        {/* Custom Color Picker */}
                        <label className="relative cursor-pointer mb-1">
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => setColor(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                title="Pick custom color"
                            />
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-linear-to-br from-red-500 via-green-500 to-blue-500 hover:scale-105 transition-transform"
                                title="Pick custom color"
                            >
                                <span className="text-white text-sm drop-shadow-md">🎨</span>
                            </div>
                        </label>

                        {/* Divider */}
                        <div className="w-6 h-px bg-surface-variant/50 mx-auto my-0.5"></div>

                        {/* Preset Colors */}
                        {DEFAULT_PALETTE.map((swatch) => (
                            <button
                                key={swatch.id}
                                onClick={() => setColor(swatch.hex)}
                                className={`
                w-8 h-8 rounded-lg shrink-0 transition-all duration-150
                ${selectedColor === swatch.hex
                                        ? "ring-2 ring-primary ring-inset shadow-inner"
                                        : "border border-black/10 hover:opacity-100 opacity-90"
                                    }
              `}
                                style={{ backgroundColor: swatch.hex }}
                                title={swatch.name}
                                aria-label={`Select ${swatch.name} color`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Tools */}
            <div className="fixed right-2 sm:right-12 top-1/2 -translate-y-1/2 z-40">
                <div className="bg-surface/95 backdrop-blur-lg border border-surface-variant/30 rounded-2xl shadow-lg p-2.5">
                    <div className="flex flex-col gap-1.5">
                        {/* Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode("fill")}
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${mode === "fill"
                                    ? "bg-primary text-on-primary"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Fill Mode"
                            >
                                <span className="text-sm">🪣</span>
                            </button>

                            <button
                                onClick={() => setMode("draw")}
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${mode === "draw"
                                    ? "bg-primary text-on-primary"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Draw Mode"
                            >
                                <span className="text-sm">🖌️</span>
                            </button>
                        </div>

                        {/* Brush Size (only show in draw mode) */}
                        {mode === "draw" && (
                            <>
                                <div className="h-px bg-surface-variant/50"></div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {brushSizes.map(({ name, size }) => (
                                        <button
                                            key={name}
                                            onClick={() => setBrushSize(size)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${brushSize === size
                                                ? "bg-secondary text-on-secondary"
                                                : "hover:bg-surface-container-high"
                                                }`}
                                            title={`Brush ${name}`}
                                        >
                                            <div
                                                className="rounded-full bg-current"
                                                style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={clearDrawing}
                                    className="w-full h-8 rounded-lg flex items-center justify-center transition-all hover:bg-surface-container-high active:scale-95 text-xs"
                                    title="Clear Drawing"
                                >
                                    <span>🗑️ Clear</span>
                                </button>
                            </>
                        )}

                        <div className="h-px bg-surface-variant/50"></div>

                        {/* Undo/Redo */}
                        <div className="flex gap-1.5">
                            <button
                                onClick={undo}
                                disabled={history.length === 0}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${history.length === 0
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Undo"
                            >
                                <span className="text-sm">↶</span>
                            </button>

                            <button
                                onClick={redo}
                                disabled={redoStack.length === 0}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${redoStack.length === 0
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Redo"
                            >
                                <span className="text-sm">↷</span>
                            </button>
                        </div>

                        <div className="h-px bg-surface-variant/50"></div>

                        {/* Zoom */}
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setZoom(Math.max(25, zoom - 25))}
                                disabled={zoom <= 25}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${zoom <= 25
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Zoom Out"
                            >
                                <span className="text-sm">−</span>
                            </button>

                            <button
                                onClick={() => setZoom(Math.min(200, zoom + 25))}
                                disabled={zoom >= 200}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${zoom >= 200
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-surface-container-high active:scale-95"
                                    }`}
                                title="Zoom In"
                            >
                                <span className="text-sm">+</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setZoom(100)}
                            disabled={zoom === 100}
                            className={`w-full h-6 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${zoom === 100
                                ? "opacity-50"
                                : "hover:bg-surface-container-high active:scale-95"
                                }`}
                            title="Reset Zoom"
                        >
                            {zoom}%
                        </button>

                        <div className="h-px bg-surface-variant/50"></div>

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="w-full h-8 rounded-lg flex items-center justify-center hover:bg-error/10 hover:text-error transition-all active:scale-95 text-xs"
                            title="Reset All"
                        >
                            <span>🔄</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Publish Modal */}
            <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onPublish={handlePublishToGallery}
                sketchTitle={sketchTitle}
                isPublishing={isPublishing}
            />
        </div>
    );
}
