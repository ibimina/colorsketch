"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { X, Download, FileImage, FileText, Check, Loader2 } from "lucide-react";
import {
    GalleryArtwork,
    generateGalleryAlbumPdf,
    generateGalleryAlbumZip,
    downloadBlob,
} from "@/lib/album-generator";

interface Artwork {
    id: string;
    sketch_id: string;
    image_url: string;
    thumbnail_url: string | null;
    is_public: boolean;
    created_at: string;
    title?: string;
}

interface GalleryAlbumModalProps {
    artworks: Artwork[];
    artistName: string;
    onClose: () => void;
}

type FilterType = "all" | "public" | "private";

const sketchTitles: Record<string, string> = {
    butterfly: "Monarch Butterfly",
    rose: "Elegant Rose",
    mandala: "Sacred Mandala",
    hummingbird: "Hummingbird Garden",
    "koi-fish": "Japanese Koi",
    owl: "Wise Owl",
    lotus: "Lotus Bloom",
    fox: "Woodland Fox",
};

function getSketchTitle(sketchId: string): string {
    return (
        sketchTitles[sketchId] ||
        sketchId
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
    );
}

export function GalleryAlbumModal({
    artworks,
    artistName,
    onClose,
}: GalleryAlbumModalProps) {
    const [albumTitle, setAlbumTitle] = useState("My ColorSketch Gallery");
    const [filter, setFilter] = useState<FilterType>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(artworks.map((a) => a.id))
    );
    const [format, setFormat] = useState<"pdf" | "zip">("pdf");
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const filteredArtworks = useMemo(() => {
        switch (filter) {
            case "public":
                return artworks.filter((a) => a.is_public);
            case "private":
                return artworks.filter((a) => !a.is_public);
            default:
                return artworks;
        }
    }, [artworks, filter]);

    const selectedArtworks = useMemo(() => {
        return artworks.filter((a) => selectedIds.has(a.id));
    }, [artworks, selectedIds]);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        setSelectedIds(new Set(filteredArtworks.map((a) => a.id)));
    };

    const selectNone = () => {
        setSelectedIds(new Set());
    };

    const handleGenerate = async () => {
        if (selectedArtworks.length === 0) return;

        setIsGenerating(true);
        setProgress({ current: 0, total: selectedArtworks.length });

        try {
            const albumArtworks: GalleryArtwork[] = selectedArtworks.map((a) => ({
                id: a.id,
                sketchId: a.sketch_id,
                title: a.title || getSketchTitle(a.sketch_id),
                imageUrl: a.image_url,
                createdAt: a.created_at,
                isPublic: a.is_public,
            }));

            const config = {
                title: albumTitle,
                artistName,
                artworks: albumArtworks,
                format,
            };

            const onProgress = (current: number, total: number) => {
                setProgress({ current, total });
            };

            let blob: Blob;
            let filename: string;

            if (format === "pdf") {
                blob = await generateGalleryAlbumPdf(config, onProgress);
                filename = `${albumTitle.replace(/[^a-zA-Z0-9 ]/g, "")}.pdf`;
            } else {
                blob = await generateGalleryAlbumZip(config, onProgress);
                filename = `${albumTitle.replace(/[^a-zA-Z0-9 ]/g, "")}.zip`;
            }

            downloadBlob(blob, filename);
            onClose();
        } catch (error) {
            console.error("Failed to generate album:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-surface">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-outline-variant">
                    <h2 className="text-xl font-semibold text-on-surface">
                        Create Album
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                        disabled={isGenerating}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Album Title */}
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">
                            Album Title
                        </label>
                        <input
                            type="text"
                            value={albumTitle}
                            onChange={(e) => setAlbumTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="My ColorSketch Gallery"
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">
                            Download Format
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFormat("pdf")}
                                disabled={isGenerating}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${format === "pdf"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-outline-variant hover:border-outline"
                                    }`}
                            >
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">PDF Album</span>
                            </button>
                            <button
                                onClick={() => setFormat("zip")}
                                disabled={isGenerating}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${format === "zip"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-outline-variant hover:border-outline"
                                    }`}
                            >
                                <FileImage className="w-5 h-5" />
                                <span className="font-medium">ZIP Images</span>
                            </button>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-2">
                            {format === "pdf"
                                ? "Creates a beautifully designed photo album with covers"
                                : "Downloads all images as separate PNG files"}
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">
                            Filter Artworks
                        </label>
                        <div className="flex gap-2">
                            {(["all", "public", "private"] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    disabled={isGenerating}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                            ? "bg-primary text-on-primary"
                                            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selection Controls */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant">
                            {selectedIds.size} of {artworks.length} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectAll}
                                disabled={isGenerating}
                            >
                                Select All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectNone}
                                disabled={isGenerating}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Artwork Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {filteredArtworks.map((artwork) => {
                            const isSelected = selectedIds.has(artwork.id);
                            return (
                                <button
                                    key={artwork.id}
                                    onClick={() => toggleSelection(artwork.id)}
                                    disabled={isGenerating}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected
                                            ? "border-primary ring-2 ring-primary/30"
                                            : "border-transparent hover:border-outline-variant"
                                        }`}
                                >
                                    <Image
                                        src={artwork.thumbnail_url || artwork.image_url}
                                        alt={artwork.title || getSketchTitle(artwork.sketch_id)}
                                        fill
                                        className="object-cover"
                                    />
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-on-primary" />
                                        </div>
                                    )}
                                    {!artwork.is_public && (
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] bg-black/60 text-white rounded">
                                            Private
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredArtworks.length === 0 && (
                        <div className="text-center py-8 text-on-surface-variant">
                            No artworks match this filter
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-outline-variant space-y-3">
                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">
                                    Generating album...
                                </span>
                                <span className="text-primary font-medium">
                                    {progress.current} / {progress.total}
                                </span>
                            </div>
                            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{
                                        width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleGenerate}
                            disabled={selectedArtworks.length === 0 || isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download {format.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
