"use client";

import { Confetti } from "@/components/Confetti";
import { LevelUpModal } from "@/components/LevelUpModal";
import { useLevelUpStore } from "@/stores/levelUpStore";

export function LevelUpCelebration() {
  const { isOpen, newLevel, confettiTrigger, closeCelebration } = useLevelUpStore();

  return (
    <>
      <Confetti trigger={confettiTrigger} duration={4000} particleCount={150} />
      <LevelUpModal isOpen={isOpen} newLevel={newLevel} onClose={closeCelebration} />
    </>
  );
}
