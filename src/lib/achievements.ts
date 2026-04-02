export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: "sketches" | "streak" | "level" | "xp";
    value: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-sketch",
    title: "First Masterpiece",
    description: "Complete your first sketch",
    icon: "🎨",
    requirement: { type: "sketches", value: 1 },
  },
  {
    id: "sketcher",
    title: "Sketcher",
    description: "Complete 5 sketches",
    icon: "✏️",
    requirement: { type: "sketches", value: 5 },
  },
  {
    id: "artist",
    title: "Artist",
    description: "Complete 10 sketches",
    icon: "🖌️",
    requirement: { type: "sketches", value: 10 },
  },
  {
    id: "master-artist",
    title: "Master Artist",
    description: "Complete 25 sketches",
    icon: "🎭",
    requirement: { type: "sketches", value: 25 },
  },
  {
    id: "picasso",
    title: "Picasso",
    description: "Complete 50 sketches",
    icon: "👨‍🎨",
    requirement: { type: "sketches", value: 50 },
  },
  {
    id: "streak-3",
    title: "Getting Started",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    requirement: { type: "streak", value: 3 },
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    requirement: { type: "streak", value: 7 },
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "🌟",
    requirement: { type: "streak", value: 30 },
  },
  {
    id: "streak-100",
    title: "Dedication Legend",
    description: "Maintain a 100-day streak",
    icon: "💎",
    requirement: { type: "streak", value: 100 },
  },
  {
    id: "level-5",
    title: "Apprentice",
    description: "Reach level 5",
    icon: "⭐",
    requirement: { type: "level", value: 5 },
  },
  {
    id: "level-10",
    title: "Expert",
    description: "Reach level 10",
    icon: "🌟",
    requirement: { type: "level", value: 10 },
  },
  {
    id: "level-25",
    title: "Virtuoso",
    description: "Reach level 25",
    icon: "✨",
    requirement: { type: "level", value: 25 },
  },
  {
    id: "xp-1000",
    title: "XP Collector",
    description: "Earn 1,000 total XP",
    icon: "💰",
    requirement: { type: "xp", value: 1000 },
  },
  {
    id: "xp-5000",
    title: "XP Hoarder",
    description: "Earn 5,000 total XP",
    icon: "💸",
    requirement: { type: "xp", value: 5000 },
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Join the ColorSketch community",
    icon: "🐣",
    requirement: { type: "sketches", value: 0 },
  },
];

export function checkAchievements(
  level: number,
  totalXP: number,
  streak: number,
  totalSketches: number,
  currentAchievements: string[],
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement.id)) continue;

    let isUnlocked = false;

    switch (achievement.requirement.type) {
      case "level":
        isUnlocked = level >= achievement.requirement.value;
        break;
      case "xp":
        isUnlocked = totalXP >= achievement.requirement.value;
        break;
      case "streak":
        isUnlocked = streak >= achievement.requirement.value;
        break;
      case "sketches":
        isUnlocked = totalSketches >= achievement.requirement.value;
        break;
    }

    if (isUnlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
