/**
 * Default Achievements Seed Data
 *
 * This file contains the default achievements that should be available
 * in all organizations. Run this seed after database setup.
 */

import { db } from "../index";
import { achievements } from "../schema/progress";

interface AchievementSeed {
  name: string;
  description: string;
  iconUrl: string | null;
  type: string;
  criteria: {
    type: "streak_days" | "lessons_completed" | "mastery_level" | "subject_completion" | "custom";
    threshold: number;
    subjectId?: string;
    gradeLevel?: number;
  };
  points: number;
}

const defaultAchievements: AchievementSeed[] = [
  // Streak Achievements
  {
    name: "First Steps",
    description: "Complete your first day of learning",
    iconUrl: "/achievements/first-steps.svg",
    type: "streak",
    criteria: { type: "streak_days", threshold: 1 },
    points: 10,
  },
  {
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    iconUrl: "/achievements/week-warrior.svg",
    type: "streak",
    criteria: { type: "streak_days", threshold: 7 },
    points: 50,
  },
  {
    name: "Consistent Learner",
    description: "Maintain a 14-day learning streak",
    iconUrl: "/achievements/consistent-learner.svg",
    type: "streak",
    criteria: { type: "streak_days", threshold: 14 },
    points: 100,
  },
  {
    name: "Month Master",
    description: "Maintain a 30-day learning streak",
    iconUrl: "/achievements/month-master.svg",
    type: "streak",
    criteria: { type: "streak_days", threshold: 30 },
    points: 200,
  },
  {
    name: "Unstoppable",
    description: "Maintain a 100-day learning streak",
    iconUrl: "/achievements/unstoppable.svg",
    type: "streak",
    criteria: { type: "streak_days", threshold: 100 },
    points: 500,
  },

  // Lesson Completion Achievements
  {
    name: "Getting Started",
    description: "Complete your first lesson",
    iconUrl: "/achievements/getting-started.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 1 },
    points: 10,
  },
  {
    name: "Lesson Learner",
    description: "Complete 10 lessons",
    iconUrl: "/achievements/lesson-learner.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 10 },
    points: 50,
  },
  {
    name: "Knowledge Seeker",
    description: "Complete 25 lessons",
    iconUrl: "/achievements/knowledge-seeker.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 25 },
    points: 100,
  },
  {
    name: "Dedicated Student",
    description: "Complete 50 lessons",
    iconUrl: "/achievements/dedicated-student.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 50 },
    points: 200,
  },
  {
    name: "Learning Champion",
    description: "Complete 100 lessons",
    iconUrl: "/achievements/learning-champion.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 100 },
    points: 400,
  },
  {
    name: "Scholar",
    description: "Complete 200 lessons",
    iconUrl: "/achievements/scholar.svg",
    type: "completion",
    criteria: { type: "lessons_completed", threshold: 200 },
    points: 750,
  },

  // Mastery Achievements
  {
    name: "Building Blocks",
    description: "Reach 50% mastery in any subject",
    iconUrl: "/achievements/building-blocks.svg",
    type: "mastery",
    criteria: { type: "mastery_level", threshold: 50 },
    points: 75,
  },
  {
    name: "Proficient",
    description: "Reach 75% mastery in any subject",
    iconUrl: "/achievements/proficient.svg",
    type: "mastery",
    criteria: { type: "mastery_level", threshold: 75 },
    points: 150,
  },
  {
    name: "Expert",
    description: "Reach 90% mastery in any subject",
    iconUrl: "/achievements/expert.svg",
    type: "mastery",
    criteria: { type: "mastery_level", threshold: 90 },
    points: 250,
  },
  {
    name: "Master",
    description: "Reach 100% mastery in any subject",
    iconUrl: "/achievements/master.svg",
    type: "mastery",
    criteria: { type: "mastery_level", threshold: 100 },
    points: 500,
  },

  // Subject Specific Achievements
  {
    name: "Math Whiz",
    description: "Complete all Math lessons in your grade level",
    iconUrl: "/achievements/math-whiz.svg",
    type: "special",
    criteria: { type: "subject_completion", threshold: 100 },
    points: 300,
  },
  {
    name: "Reading Rockstar",
    description: "Complete all Reading lessons in your grade level",
    iconUrl: "/achievements/reading-rockstar.svg",
    type: "special",
    criteria: { type: "subject_completion", threshold: 100 },
    points: 300,
  },
  {
    name: "Science Explorer",
    description: "Complete all Science lessons in your grade level",
    iconUrl: "/achievements/science-explorer.svg",
    type: "special",
    criteria: { type: "subject_completion", threshold: 100 },
    points: 300,
  },
  {
    name: "History Buff",
    description: "Complete all History lessons in your grade level",
    iconUrl: "/achievements/history-buff.svg",
    type: "special",
    criteria: { type: "subject_completion", threshold: 100 },
    points: 300,
  },
  {
    name: "Tech Guru",
    description: "Complete all Technology lessons in your grade level",
    iconUrl: "/achievements/tech-guru.svg",
    type: "special",
    criteria: { type: "subject_completion", threshold: 100 },
    points: 300,
  },

  // Special Achievements
  {
    name: "Perfect Score",
    description: "Get a perfect score on any quiz",
    iconUrl: "/achievements/perfect-score.svg",
    type: "special",
    criteria: { type: "custom", threshold: 100 },
    points: 50,
  },
  {
    name: "Early Bird",
    description: "Start learning before 8 AM",
    iconUrl: "/achievements/early-bird.svg",
    type: "special",
    criteria: { type: "custom", threshold: 1 },
    points: 25,
  },
  {
    name: "Night Owl",
    description: "Complete a lesson after 9 PM",
    iconUrl: "/achievements/night-owl.svg",
    type: "special",
    criteria: { type: "custom", threshold: 1 },
    points: 25,
  },
  {
    name: "Weekend Warrior",
    description: "Learn on both Saturday and Sunday",
    iconUrl: "/achievements/weekend-warrior.svg",
    type: "special",
    criteria: { type: "custom", threshold: 2 },
    points: 35,
  },
  {
    name: "Speed Demon",
    description: "Complete 5 lessons in one day",
    iconUrl: "/achievements/speed-demon.svg",
    type: "special",
    criteria: { type: "custom", threshold: 5 },
    points: 75,
  },
  {
    name: "Comeback Kid",
    description: "Return to learning after 7+ days away",
    iconUrl: "/achievements/comeback-kid.svg",
    type: "special",
    criteria: { type: "custom", threshold: 7 },
    points: 30,
  },
  {
    name: "Helpful Friend",
    description: "Help another student (referred a friend who signed up)",
    iconUrl: "/achievements/helpful-friend.svg",
    type: "special",
    criteria: { type: "custom", threshold: 1 },
    points: 100,
  },
];

/**
 * Seed the default achievements
 * This is idempotent - it will skip achievements that already exist
 */
export async function seedAchievements(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  console.log("🎯 Seeding default achievements...");

  for (const achievement of defaultAchievements) {
    try {
      // Check if achievement with this name already exists
      const existing = await db.query.achievements.findFirst({
        where: (achievements, { eq }) => eq(achievements.name, achievement.name),
      });

      if (existing) {
        skipped++;
        console.log(`  ⏭️  Skipped: ${achievement.name} (already exists)`);
        continue;
      }

      await db.insert(achievements).values({
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        type: achievement.type,
        criteria: achievement.criteria,
        points: achievement.points,
      });

      created++;
      console.log(`  ✅ Created: ${achievement.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${achievement.name}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete: ${created} created, ${skipped} skipped`);
  return { created, skipped };
}

/**
 * Run directly with: bun run src/lib/db/seeds/achievements.ts
 */
if (require.main === module) {
  seedAchievements()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export default seedAchievements;
