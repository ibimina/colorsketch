"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Globe, Lock, X, Upload, Loader2 } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (isPublic: boolean) => Promise<void>;
  sketchTitle: string;
  isPublishing: boolean;
}

export function PublishModal({
  isOpen,
  onClose,
  onPublish,
  sketchTitle,
  isPublishing,
}: PublishModalProps) {
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  if (!isOpen) return null;

  const handlePublish = async () => {
    await onPublish(visibility === "public");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={isPublishing}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Save to Gallery
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Save &quot;{sketchTitle}&quot; to your gallery
          </p>
        </div>

        {/* Visibility Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setVisibility("public")}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              visibility === "public"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            disabled={isPublishing}
          >
            <div
              className={`p-2 rounded-full ${
                visibility === "public"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              }`}
            >
              <Globe className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Public
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Anyone can see your artwork in the community
              </p>
            </div>
          </button>

          <button
            onClick={() => setVisibility("private")}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              visibility === "private"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            disabled={isPublishing}
          >
            <div
              className={`p-2 rounded-full ${
                visibility === "private"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              }`}
            >
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Private
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Only you can see this artwork
              </p>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
