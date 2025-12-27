/**
 * AI Parent Recommendations Generator
 * Generates personalized learning recommendations for parents based on child progress
 */

import { generateText } from "ai";
import { getModelForCapability, getDefaultProvider } from "./providers";

export interface ChildProgressData {
  childName: string;
  gradeLevel: number;
  overallProgress: number;
  subjects: {
    subjectName: string;
    masteryLevel: number;
    completedLessons: number;
    totalLessons: number;
    recentTrend?: "improving" | "stable" | "declining";
  }[];
  weeklyActivity: {
    totalMinutes: number;
    totalLessons: number;
    averageDailyMinutes: number;
    mostActiveDay: string;
    leastActiveDay: string;
  };
  recentAchievements?: string[];
  streakDays?: number;
}

export interface Recommendation {
  type: "focus" | "celebrate" | "encourage" | "challenge" | "routine";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems?: string[];
}

export interface ParentRecommendations {
  recommendations: Recommendation[];
  summary: string;
  generatedAt: Date;
}

function buildRecommendationPrompt(progress: ChildProgressData): string {
  const { childName, gradeLevel, overallProgress, subjects, weeklyActivity, recentAchievements, streakDays } = progress;

  // Find strongest and weakest subjects
  const sortedSubjects = [...subjects].sort((a, b) => b.masteryLevel - a.masteryLevel);
  const strongest = sortedSubjects[0];
  const weakest = sortedSubjects[sortedSubjects.length - 1];

  // Calculate subject-specific insights
  const decliningSubjects = subjects.filter(s => s.recentTrend === "declining");
  const improvingSubjects = subjects.filter(s => s.recentTrend === "improving");

  return `You are an educational advisor helping parents support their child's learning journey.

CHILD PROFILE:
- Name: ${childName}
- Grade Level: ${gradeLevel}
- Overall Progress: ${overallProgress}%
- Current Streak: ${streakDays || 0} days

SUBJECT PROGRESS:
${subjects.map(s => `- ${s.subjectName}: ${s.masteryLevel}% mastery (${s.completedLessons}/${s.totalLessons} lessons)${s.recentTrend ? ` [${s.recentTrend}]` : ""}`).join("\n")}

WEEKLY ACTIVITY:
- Total Time: ${weeklyActivity.totalMinutes} minutes
- Lessons Completed: ${weeklyActivity.totalLessons}
- Daily Average: ${weeklyActivity.averageDailyMinutes} minutes
- Most Active: ${weeklyActivity.mostActiveDay}
- Least Active: ${weeklyActivity.leastActiveDay}

${recentAchievements?.length ? `RECENT ACHIEVEMENTS:\n${recentAchievements.map(a => `- ${a}`).join("\n")}` : ""}

KEY OBSERVATIONS:
- Strongest Subject: ${strongest?.subjectName} (${strongest?.masteryLevel}%)
- Subject Needing Focus: ${weakest?.subjectName} (${weakest?.masteryLevel}%)
${decliningSubjects.length > 0 ? `- Declining Performance In: ${decliningSubjects.map(s => s.subjectName).join(", ")}` : ""}
${improvingSubjects.length > 0 ? `- Improving In: ${improvingSubjects.map(s => s.subjectName).join(", ")}` : ""}

Generate 3-4 personalized recommendations for the parent. Each recommendation should be:
1. Specific and actionable
2. Based on the actual data provided
3. Age-appropriate for grade ${gradeLevel}
4. Supportive and encouraging in tone

Return JSON in this format:
{
  "recommendations": [
    {
      "type": "focus" | "celebrate" | "encourage" | "challenge" | "routine",
      "priority": "high" | "medium" | "low",
      "title": "Brief title (max 50 chars)",
      "description": "1-2 sentences explaining the recommendation",
      "actionItems": ["Optional specific action 1", "Optional specific action 2"]
    }
  ],
  "summary": "One sentence overall summary of the child's learning status"
}

Types explained:
- "focus": Subject or skill that needs extra attention
- "celebrate": Achievement or progress to acknowledge
- "encourage": Motivation for areas where child is struggling
- "challenge": Opportunities to stretch a strong area
- "routine": Suggestions for study habits or scheduling

Guidelines:
- Be specific to this child's data, don't give generic advice
- Prioritize actionable recommendations
- Balance positive and constructive feedback
- Consider the grade level when suggesting activities`;
}

/**
 * Generate AI-powered recommendations for parents
 */
export async function generateParentRecommendations(
  progress: ChildProgressData
): Promise<ParentRecommendations> {
  const provider = getDefaultProvider();

  // If no AI provider, use fallback
  if (!provider) {
    return generateFallbackRecommendations(progress);
  }

  try {
    const model = getModelForCapability("general", provider);
    const prompt = buildRecommendationPrompt(progress);

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateFallbackRecommendations(progress);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      recommendations: Recommendation[];
      summary: string;
    };

    // Validate the response has required fields
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return generateFallbackRecommendations(progress);
    }

    return {
      recommendations: parsed.recommendations,
      summary: parsed.summary || "Learning progress is on track.",
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating AI parent recommendations:", error);
    return generateFallbackRecommendations(progress);
  }
}

/**
 * Generate rule-based fallback recommendations when AI is unavailable
 */
function generateFallbackRecommendations(
  progress: ChildProgressData
): ParentRecommendations {
  const recommendations: Recommendation[] = [];
  const { childName, subjects, weeklyActivity, overallProgress, streakDays } = progress;

  // Sort subjects by mastery
  const sortedSubjects = [...subjects].sort((a, b) => a.masteryLevel - b.masteryLevel);
  const weakest = sortedSubjects[0];
  const strongest = sortedSubjects[sortedSubjects.length - 1];

  // Find declining subjects
  const declining = subjects.filter(s => s.recentTrend === "declining");

  // Recommendation 1: Focus on weakest subject (if significantly behind)
  if (weakest && weakest.masteryLevel < 60) {
    recommendations.push({
      type: "focus",
      priority: "high",
      title: `Focus on ${weakest.subjectName}`,
      description: `${childName}'s ${weakest.subjectName} mastery is at ${weakest.masteryLevel}%. Consider adding 15-20 minutes of practice daily to strengthen these skills.`,
      actionItems: [
        `Review ${weakest.subjectName} lessons together`,
        "Set a specific daily practice time",
        "Celebrate small improvements",
      ],
    });
  } else if (weakest && weakest.masteryLevel < 75) {
    recommendations.push({
      type: "focus",
      priority: "medium",
      title: `Strengthen ${weakest.subjectName}`,
      description: `${weakest.subjectName} is ${childName}'s area with the most room for growth. A little extra practice could make a big difference.`,
      actionItems: [
        "Try to complete one extra lesson this week",
        "Review challenging concepts together",
      ],
    });
  }

  // Recommendation 2: Celebrate strongest subject
  if (strongest && strongest.masteryLevel >= 80) {
    recommendations.push({
      type: "celebrate",
      priority: "medium",
      title: `Great Progress in ${strongest.subjectName}!`,
      description: `${childName} is excelling in ${strongest.subjectName} with ${strongest.masteryLevel}% mastery. This is a fantastic achievement!`,
      actionItems: [
        "Consider advanced or enrichment activities",
        "Let them share what they've learned with siblings or friends",
      ],
    });
  }

  // Recommendation 3: Address declining performance
  if (declining.length > 0) {
    const decliningSub = declining[0];
    recommendations.push({
      type: "encourage",
      priority: "high",
      title: `Support in ${decliningSub.subjectName}`,
      description: `${childName}'s performance in ${decliningSub.subjectName} has been declining recently. Extra support and encouragement can help turn this around.`,
      actionItems: [
        "Ask about any challenging topics",
        "Review recent lessons together",
        "Consider shorter, more frequent study sessions",
      ],
    });
  }

  // Recommendation 4: Study routine based on weekly activity
  if (weeklyActivity.averageDailyMinutes < 20) {
    recommendations.push({
      type: "routine",
      priority: "high",
      title: "Establish a Study Routine",
      description: `${childName} is averaging ${Math.round(weeklyActivity.averageDailyMinutes)} minutes of study daily. Aim for at least 20-30 minutes for better progress.`,
      actionItems: [
        "Set a consistent daily study time",
        `Focus especially on ${weeklyActivity.leastActiveDay}s`,
        "Create a quiet, dedicated study space",
      ],
    });
  } else if (weeklyActivity.averageDailyMinutes >= 30) {
    recommendations.push({
      type: "celebrate",
      priority: "low",
      title: "Excellent Study Habits!",
      description: `${childName} is maintaining great study habits with ${Math.round(weeklyActivity.averageDailyMinutes)} minutes daily. Consistency is key to success!`,
    });
  }

  // Recommendation 5: Streak encouragement
  if (streakDays && streakDays >= 7) {
    recommendations.push({
      type: "celebrate",
      priority: "medium",
      title: `${streakDays}-Day Learning Streak!`,
      description: `${childName} has been learning consistently for ${streakDays} days. This dedication will lead to great results!`,
    });
  } else if (!streakDays || streakDays < 3) {
    recommendations.push({
      type: "encourage",
      priority: "medium",
      title: "Build a Learning Streak",
      description: `Help ${childName} develop a habit of daily learning. Even 10-15 minutes each day builds momentum!`,
      actionItems: [
        "Set a reminder for daily practice",
        "Start with easier, fun lessons to build momentum",
      ],
    });
  }

  // Limit to 4 recommendations
  const topRecommendations = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 4);

  // Generate summary
  let summary = "";
  if (overallProgress >= 80) {
    summary = `${childName} is making excellent progress across subjects!`;
  } else if (overallProgress >= 60) {
    summary = `${childName} is progressing well with room to grow in some areas.`;
  } else if (overallProgress >= 40) {
    summary = `${childName} is building foundational skills and needs continued support.`;
  } else {
    summary = `${childName} is at the beginning of their learning journey and needs encouragement.`;
  }

  return {
    recommendations: topRecommendations,
    summary,
    generatedAt: new Date(),
  };
}
