import { generateText, streamText } from "ai";
import { getModelForCapability, getDefaultProvider } from "./providers";

export interface LessonContentRequest {
  title: string;
  subject: string;
  gradeLevel: number; // 0 = K, 1-12
  description?: string;
  learningObjectives?: string[];
  estimatedMinutes?: number;
  difficultyLevel?: number; // 1-5
  includeVisualization?: boolean;
}

export interface GeneratedLessonContent {
  title: string;
  introduction: string;
  concepts: Array<{
    title: string;
    explanation: string;
    examples: string[];
    keyTerms?: Array<{ term: string; definition: string }>;
    visualizationSuggestion?: string;
  }>;
  activities: Array<{
    title: string;
    type: "quiz" | "exercise" | "practice" | "game";
    description: string;
    questions?: Array<{
      question: string;
      type: "multiple_choice" | "true_false" | "fill_blank";
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  }>;
  summary: string;
  furtherReading?: string[];
}

function getGradeDescription(gradeLevel: number): string {
  if (gradeLevel === 0) return "Kindergarten (ages 5-6)";
  if (gradeLevel <= 2) return `${gradeLevel}${gradeLevel === 1 ? "st" : "nd"} Grade (ages ${5 + gradeLevel}-${6 + gradeLevel})`;
  if (gradeLevel === 3) return "3rd Grade (ages 8-9)";
  if (gradeLevel <= 5) return `${gradeLevel}th Grade (ages ${5 + gradeLevel}-${6 + gradeLevel}) - Elementary`;
  if (gradeLevel <= 8) return `${gradeLevel}th Grade (ages ${5 + gradeLevel}-${6 + gradeLevel}) - Middle School`;
  return `${gradeLevel}th Grade (ages ${5 + gradeLevel}-${6 + gradeLevel}) - High School`;
}

function buildContentPrompt(request: LessonContentRequest): string {
  const gradeDesc = getGradeDescription(request.gradeLevel);
  const difficulty = request.difficultyLevel
    ? ["beginner", "easy", "medium", "hard", "advanced"][request.difficultyLevel - 1]
    : "appropriate for grade level";

  return `You are an expert K-12 curriculum designer creating educational content for ${gradeDesc} students studying ${request.subject}.

Create comprehensive lesson content for: "${request.title}"

${request.description ? `Lesson Description: ${request.description}` : ""}
${request.learningObjectives?.length ? `Learning Objectives:\n${request.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}` : ""}
${request.estimatedMinutes ? `Target Duration: ${request.estimatedMinutes} minutes` : ""}
Difficulty Level: ${difficulty}

Generate content that is:
- Age-appropriate for ${gradeDesc}
- Engaging and interactive
- Clear and well-structured
- Progressive in complexity (building on prior concepts)
${request.includeVisualization ? "- Include suggestions for 3D visualizations or interactive elements" : ""}

Return a JSON object with this exact structure:
{
  "title": "Lesson title",
  "introduction": "An engaging 2-3 paragraph introduction that hooks students and explains why this topic matters",
  "concepts": [
    {
      "title": "Concept title",
      "explanation": "Clear, age-appropriate explanation with examples",
      "examples": ["Example 1", "Example 2"],
      "keyTerms": [{"term": "vocabulary word", "definition": "simple definition"}],
      "visualizationSuggestion": "Description of potential 3D visualization or animation"
    }
  ],
  "activities": [
    {
      "title": "Activity title",
      "type": "quiz|exercise|practice|game",
      "description": "What students will do",
      "questions": [
        {
          "question": "Question text",
          "type": "multiple_choice|true_false|fill_blank",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why this is correct"
        }
      ]
    }
  ],
  "summary": "Key takeaways from this lesson",
  "furtherReading": ["Optional additional resources"]
}

Important:
- Use language and vocabulary appropriate for ${gradeDesc}
- Include 2-4 main concepts
- Include at least 2 activities with 3-5 questions each
- Make explanations concrete with real-world examples
- Ensure content is accurate and educationally sound`;
}

export async function generateLessonContent(
  request: LessonContentRequest
): Promise<GeneratedLessonContent> {
  const provider = getDefaultProvider();
  if (!provider) {
    throw new Error("No AI provider configured");
  }

  const model = getModelForCapability("practice", provider);
  const prompt = buildContentPrompt(request);

  const result = await generateText({
    model,
    prompt,
    temperature: 0.7,
    maxOutputTokens: 4000,
  });

  // Parse the JSON response
  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  try {
    const content = JSON.parse(jsonMatch[0]) as GeneratedLessonContent;
    return content;
  } catch {
    throw new Error("Invalid JSON in AI response");
  }
}

export async function* streamLessonContent(
  request: LessonContentRequest
): AsyncGenerator<string, void, unknown> {
  const provider = getDefaultProvider();
  if (!provider) {
    throw new Error("No AI provider configured");
  }

  const model = getModelForCapability("practice", provider);
  const prompt = buildContentPrompt(request);

  const result = streamText({
    model,
    prompt,
    temperature: 0.7,
    maxOutputTokens: 4000,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

export interface TopicSuggestion {
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedMinutes: number;
}

export async function suggestLessonTopics(
  subject: string,
  gradeLevel: number,
  unitTitle?: string,
  existingTopics?: string[]
): Promise<TopicSuggestion[]> {
  const provider = getDefaultProvider();
  if (!provider) {
    throw new Error("No AI provider configured");
  }

  const model = getModelForCapability("general", provider);
  const gradeDesc = getGradeDescription(gradeLevel);

  const prompt = `You are a K-12 curriculum designer. Suggest 5 lesson topics for:
Subject: ${subject}
Grade Level: ${gradeDesc}
${unitTitle ? `Unit: ${unitTitle}` : ""}
${existingTopics?.length ? `Already covered: ${existingTopics.join(", ")}` : ""}

Return a JSON array of lesson suggestions:
[
  {
    "title": "Lesson title",
    "description": "Brief description of what students will learn",
    "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
    "estimatedMinutes": 30
  }
]

Make suggestions:
- Age-appropriate and engaging
- Progressively building on each other
- Aligned with educational standards
- Practical with real-world connections`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.8,
    maxOutputTokens: 2000,
  });

  const jsonMatch = result.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse topic suggestions");
  }

  return JSON.parse(jsonMatch[0]) as TopicSuggestion[];
}
