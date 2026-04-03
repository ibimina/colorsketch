"use client";

import { Button } from "@/components/ui";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

// Level titles based on level number
function getLevelTitle(level: number): string {
  if (level >= 50) return "Master Artist";
  if (level >= 30) return "Expert Artist";
  if (level >= 20) return "Advanced Artist";
  if (level >= 10) return "Skilled Artist";
  if (level >= 5) return "Apprentice Artist";
  return "Beginner Artist";
}

// Level colors for visual flair
function getLevelColor(level: number): string {
  if (level >= 50) return "from-amber-400 to-yellow-500";
  if (level >= 30) return "from-purple-400 to-pink-500";
  if (level >= 20) return "from-blue-400 to-cyan-500";
  if (level >= 10) return "from-green-400 to-emerald-500";
  if (level >= 5) return "from-orange-400 to-red-500";
  return "from-gray-400 to-slate-500";
}

export function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  if (!isOpen) return null;

  const levelTitle = getLevelTitle(newLevel);
  const levelColor = getLevelColor(newLevel);

  return (
    <div 
      className="fixed inset-0 z-90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative bg-surface-container-low rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all duration-500 scale-100 opacity-100 animate-in zoom-in-95"
      >
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-linear-to-r ${levelColor} rounded-3xl blur-lg opacity-30 animate-pulse`} />
        
        <div className="relative">
          {/* Star burst decoration */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="text-6xl animate-bounce">⭐</div>
          </div>

          {/* Content */}
          <div className="text-center pt-8">
            <p className="text-on-surface-variant text-sm uppercase tracking-wider mb-2">
              Congratulations!
            </p>
            
            <h2 
              id="level-up-title"
              className={`text-4xl font-headline font-bold bg-linear-to-r ${levelColor} bg-clip-text text-transparent mb-2`}
            >
              Level {newLevel}
            </h2>
            
            <p className="text-xl font-medium text-on-surface mb-4">
              {levelTitle}
            </p>

            {/* Progress indicator */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(Math.min(newLevel, 10))].map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full bg-linear-to-r ${levelColor}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>

            {/* Unlocks info */}
            {(newLevel === 3 || newLevel === 5 || newLevel === 8) && (
              <div className="bg-surface-container rounded-xl p-4 mb-6">
                <p className="text-sm text-on-surface-variant mb-1">🎁 New Unlocks!</p>
                <p className="text-on-surface font-medium">
                  {newLevel === 3 && "Featured Sketches now available!"}
                  {newLevel === 5 && "Editor's Choice Sketches unlocked!"}
                  {newLevel === 8 && "Premium Collection unlocked!"}
                </p>
              </div>
            )}

            {/* Close button */}
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onClose}
              className="w-full"
            >
              Continue Creating! 🎨
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
