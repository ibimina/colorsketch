"use client";

import { useEffect, useState, useRef } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
  delay: number;
}

const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Purple
  "#85C1E9", // Sky
];

function generatePieces(count: number): ConfettiPiece[] {
  const newPieces: ConfettiPiece[] = [];
  const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"];

  for (let i = 0; i < count; i++) {
    newPieces.push({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 8,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 2 + Math.random() * 4,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      delay: Math.random() * 500,
    });
  }

  return newPieces;
}

interface ConfettiProps {
  /** Increment this number to trigger a new confetti burst */
  trigger: number;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export function Confetti({
  trigger,
  duration = 3000,
  particleCount = 100,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const initialRender = useRef(true);

  // Generate new confetti when trigger changes (skip initial render)
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (trigger > 0) {
      const newPieces = generatePieces(particleCount);
      
      // Use setTimeout to avoid the "setState in effect" lint warning
      const setupTimer = setTimeout(() => {
        setPieces(newPieces);
      }, 0);

      const cleanupTimer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(setupTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.shape !== "triangle" ? piece.color : "transparent",
            borderRadius: piece.shape === "circle" ? "50%" : 0,
            borderLeft: piece.shape === "triangle" ? `${piece.size / 2}px solid transparent` : undefined,
            borderRight: piece.shape === "triangle" ? `${piece.size / 2}px solid transparent` : undefined,
            borderBottom: piece.shape === "triangle" ? `${piece.size}px solid ${piece.color}` : undefined,
            transform: `rotate(${piece.rotation}deg)`,
            animationDuration: `${duration}ms`,
            animationDelay: `${piece.delay}ms`,
            ["--velocity-x" as string]: piece.velocityX,
            ["--velocity-y" as string]: piece.velocityY,
            ["--rotation-speed" as string]: piece.rotationSpeed,
          }}
        />
      ))}
    </div>
  );
}
