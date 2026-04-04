"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { X, Download, FileImage, FileText, Check, Loader2 } from "lucide-react";
import { sketches } from "@/data/sketches";
import {
  AlbumArtwork,
  generateAlbumPdf,
  generateAlbumZip,
  downloadBlob,
} from "@/lib/album-generator";
import { FillState } from "@/types";

interface CompletedSketch {
  sketch_id: string;
  fills: FillState;
  completed_at: string;
  updated_at: string;
  isPublic?: boolean;
}

interface AlbumCreatorModalProps {
  completedSketches: CompletedSketch[];
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

export function AlbumCreatorModal({
  completedSketches,
  artistName,
  onClose,
}: AlbumCreatorModalProps) {
  const [albumTitle, setAlbumTitle] = useState("My ColorSketch Collection");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(completedSketches.map((s) => s.sketch_id))
  );
  const [format, setFormat] = useState<"pdf" | "zip">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });

  const filteredSketches = useMemo(() => {
    if (filter === "all") return completedSketches;
    if (filter === "public") return completedSketches.filter((s) => s.isPublic);
    return completedSketches.filter((s) => !s.isPublic);
  }, [completedSketches, filter]);

  const publicCount = completedSketches.filter((s) => s.isPublic).length;
  const privateCount = completedSketches.length - publicCount;

  const toggleSelection = (sketchId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sketchId)) next.delete(sketchId);
      else next.add(sketchId);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(filteredSketches.map((s) => s.sketch_id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleGenerate = async () => {
    if (selectedIds.size === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: 0, stage: "Preparing..." });

    const artworks: AlbumArtwork[] = completedSketches
      .filter((s) => selectedIds.has(s.sketch_id))
      .map((s) => {
        const sketchData = sketches.find((sk) => sk.id === s.sketch_id);
        return {
          sketchId: s.sketch_id,
          title: getSketchTitle(s.sketch_id),
          fills: s.fills || {},
          completedAt: s.completed_at,
          thumbnailPath:
            sketchData?.thumbnail || `/sketches/${s.sketch_id}.svg`,
          isPublic: s.isPublic,
        };
      });

    try {
      let blob: Blob;
      const safeTitle =
        albumTitle.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "ColorSketch Album";

      if (format === "pdf") {
        blob = await generateAlbumPdf(
          { title: albumTitle, artistName, artworks, format: "pdf" },
          (current, total, stage) => setProgress({ current, total, stage })
        );
        downloadBlob(blob, `${safeTitle}.pdf`);
      } else {
        blob = await generateAlbumZip(
          { title: albumTitle, artistName, artworks, format: "zip" },
          (current, total) =>
            setProgress({
              current,
              total,
              stage: `Exporting image ${current}/${total}`,
            })
        );
        downloadBlob(blob, `${safeTitle}.zip`);
      }

      onClose();
    } catch (error) {
      console.error("Album generation failed:", error);
      alert("Failed to generate album. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card
        variant="elevated"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="text-xl font-headline font-bold">Create Your Album</h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Album Title
            </label>
            <input
              type="text"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="My ColorSketch Collection"
              disabled={isGenerating}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              {
                id: "all" as FilterType,
                label: "All",
                count: completedSketches.length,
              },
              { id: "public" as FilterType, label: "Public", count: publicCount },
              {
                id: "private" as FilterType,
                label: "Private",
                count: privateCount,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Selection Actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              {selectedIds.size} of {completedSketches.length} artworks selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={isGenerating}
                className="text-sm text-primary hover:underline"
              >
                Select All
              </button>
              <span className="text-on-surface-variant">|</span>
              <button
                onClick={deselectAll}
                disabled={isGenerating}
                className="text-sm text-primary hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Artwork Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredSketches.map((sketch) => {
              const sketchData = sketches.find((s) => s.id === sketch.sketch_id);
              const isSelected = selectedIds.has(sketch.sketch_id);

              return (
                <button
                  key={sketch.sketch_id}
                  onClick={() => toggleSelection(sketch.sketch_id)}
                  disabled={isGenerating}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-outline-variant"
                  }`}
                >
                  <div className="w-full h-full bg-surface-container">
                    {sketchData?.thumbnail && (
                      <Image
                        src={sketchData.thumbnail}
                        alt={getSketchTitle(sketch.sketch_id)}
                        fill
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-on-primary" />
                    </div>
                  )}
                  {sketch.isPublic && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500/90 text-white text-[10px] rounded">
                      Public
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">
              Download Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat("pdf")}
                disabled={isGenerating}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  format === "pdf"
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant hover:border-outline"
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${format === "pdf" ? "text-primary" : ""}`}
                />
                <div className="text-left">
                  <div className="font-medium">PDF Album</div>
                  <div className="text-xs text-on-surface-variant">
                    Designed with covers
                  </div>
                </div>
              </button>
              <button
                onClick={() => setFormat("zip")}
                disabled={isGenerating}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  format === "zip"
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant hover:border-outline"
                }`}
              >
                <FileImage
                  className={`w-5 h-5 ${format === "zip" ? "text-primary" : ""}`}
                />
                <div className="text-left">
                  <div className="font-medium">ZIP Images</div>
                  <div className="text-xs text-on-surface-variant">
                    Individual PNG files
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="bg-surface-container rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm">{progress.stage}</span>
              </div>
              {progress.total > 0 && (
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-outline-variant">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={selectedIds.size === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Album
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
