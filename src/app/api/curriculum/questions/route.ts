import { NextRequest, NextResponse } from "next/server";
import { getCurriculumStats, getAllSubjects } from "@/data/curriculum";

// Subject-specific example questions mapped from curriculum
const CURRICULUM_QUESTIONS: Record<string, Record<number, string[]>> = {
  math: {
    0: ["What numbers come after 5?", "Can you count to 10 with me?", "How many apples are there?"],
    1: ["What is 5 + 3?", "Count by 2s to 10", "What comes before 7?"],
    2: ["What is 12 - 5?", "How do you add three numbers?", "What is a number line?"],
    3: ["Explain multiplication", "What are fact families?", "How do I read a bar graph?"],
    4: ["What are factors?", "How do fractions work?", "What is long division?"],
    5: ["How do decimals work?", "What is a coordinate plane?", "Explain order of operations"],
    6: ["What are ratios?", "How do I solve for x?", "What are negative numbers?"],
    7: ["How do proportions work?", "What is the Pythagorean theorem?", "Explain linear equations"],
    8: ["What are functions?", "How do I graph inequalities?", "What is a slope?"],
    9: ["What is algebra?", "How do quadratic equations work?", "Explain polynomials"],
    10: ["What is geometry?", "How do I prove theorems?", "What are trigonometric ratios?"],
    11: ["What is calculus about?", "How do limits work?", "What are sequences?"],
    12: ["How do derivatives work?", "What are integrals?", "Explain probability distributions"],
  },
  reading: {
    0: ["What letter makes the 'ah' sound?", "Can you find the rhyming words?", "What happens in this story?"],
    1: ["What is the main idea?", "Who is the main character?", "What is a noun?"],
    2: ["How do you summarize a story?", "What are adjectives?", "What is a sentence?"],
    3: ["What is a paragraph?", "How do I find the theme?", "What are prefixes?"],
    4: ["What makes a good essay?", "How do I use quotations?", "What are literary devices?"],
    5: ["How do I analyze characters?", "What is point of view?", "How do I cite sources?"],
    6: ["What is an inference?", "How do I compare texts?", "What is a thesis statement?"],
    7: ["How do I write persuasively?", "What is figurative language?", "How do I analyze poetry?"],
    8: ["What makes effective arguments?", "How do I identify bias?", "What is dramatic irony?"],
    9: ["How do I analyze rhetoric?", "What is literary criticism?", "How do I write a research paper?"],
    10: ["What is the hero's journey?", "How do I analyze symbolism?", "What makes a reliable source?"],
    11: ["How do I write a college essay?", "What is critical theory?", "How do I analyze speeches?"],
    12: ["What is postmodernism?", "How do I synthesize sources?", "What makes effective commentary?"],
  },
  science: {
    0: ["What is living and non-living?", "How do plants grow?", "What is weather?"],
    1: ["What are the seasons?", "How do animals survive?", "What is matter?"],
    2: ["How does the water cycle work?", "What are habitats?", "What is the solar system?"],
    3: ["How do ecosystems work?", "What is energy?", "How do rocks form?"],
    4: ["What are the states of matter?", "How does electricity work?", "What is the food chain?"],
    5: ["How do cells work?", "What is the scientific method?", "What causes earthquakes?"],
    6: ["What is photosynthesis?", "How do forces work?", "What is the atmosphere?"],
    7: ["What is cellular respiration?", "How does genetics work?", "What are chemical reactions?"],
    8: ["How does the periodic table work?", "What is evolution?", "How does motion work?"],
    9: ["What is atomic structure?", "How do chemical bonds form?", "What are Newton's laws?"],
    10: ["How does organic chemistry work?", "What is thermodynamics?", "How do waves work?"],
    11: ["What is quantum mechanics?", "How does molecular biology work?", "What is electromagnetism?"],
    12: ["How does calculus apply to physics?", "What is biochemistry?", "What is nuclear physics?"],
  },
  history: {
    0: ["What is a family?", "Who are community helpers?", "What are rules?"],
    1: ["What is a timeline?", "Who were important leaders?", "What is a map?"],
    2: ["What is government?", "How did people live long ago?", "What are symbols?"],
    3: ["What makes a community?", "Who were the first Americans?", "What are traditions?"],
    4: ["What caused the Revolutionary War?", "Who were the founding fathers?", "What is the Constitution?"],
    5: ["What was westward expansion?", "How did the Civil War start?", "What is immigration?"],
    6: ["What were ancient civilizations?", "How did empires rise and fall?", "What is democracy?"],
    7: ["What was the Renaissance?", "How did exploration change the world?", "What is capitalism?"],
    8: ["What caused the Industrial Revolution?", "How did World War I start?", "What is imperialism?"],
    9: ["What caused the Great Depression?", "How did World War II end?", "What is communism?"],
    10: ["What was the Cold War?", "How did civil rights movements develop?", "What is globalization?"],
    11: ["What is historical analysis?", "How do we evaluate sources?", "What shapes historical narratives?"],
    12: ["How do we understand historiography?", "What are historical interpretations?", "What is revisionist history?"],
  },
  general: {
    0: ["How do I make friends?", "What should I do when I'm sad?", "How can I be a good listener?"],
    1: ["How do I organize my backpack?", "What makes a good student?", "How do I ask for help?"],
    2: ["How can I improve my focus?", "What are good study habits?", "How do I manage my time?"],
    3: ["How do I take good notes?", "What makes a good presentation?", "How do I work in a group?"],
    4: ["How do I prepare for tests?", "What is critical thinking?", "How do I set goals?"],
    5: ["How do I manage stress?", "What makes a good argument?", "How do I research a topic?"],
    6: ["How do I study effectively?", "What is growth mindset?", "How do I handle challenges?"],
    7: ["How do I balance activities?", "What is self-advocacy?", "How do I learn from mistakes?"],
    8: ["How do I prepare for high school?", "What are learning styles?", "How do I stay motivated?"],
    9: ["How do I plan for college?", "What is time management?", "How do I handle pressure?"],
    10: ["How do I prepare for standardized tests?", "What makes a good college essay?", "How do I explore careers?"],
    11: ["How do I apply to college?", "What is networking?", "How do I develop leadership?"],
    12: ["How do I prepare for adulthood?", "What is financial literacy?", "How do I make important decisions?"],
  },
};

// GET /api/curriculum/questions - Get example questions for a subject/grade
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subject = searchParams.get("subject") || "general";
  const gradeStr = searchParams.get("gradeLevel");
  const gradeLevel = gradeStr ? parseInt(gradeStr) : 5;

  // Get questions for this subject and grade level
  const subjectQuestions = CURRICULUM_QUESTIONS[subject] || CURRICULUM_QUESTIONS.general;

  // Get questions for the grade level, falling back to closest available
  let questions = subjectQuestions[gradeLevel];
  if (!questions) {
    // Find closest grade level
    const availableGrades = Object.keys(subjectQuestions).map(Number);
    const closest = availableGrades.reduce((prev, curr) =>
      Math.abs(curr - gradeLevel) < Math.abs(prev - gradeLevel) ? curr : prev
    );
    questions = subjectQuestions[closest];
  }

  // Include some general questions if we have room
  const generalQuestions = CURRICULUM_QUESTIONS.general[gradeLevel] || [];
  const mixed = [
    ...questions.slice(0, 3),
    ...(subject !== "general" ? generalQuestions.slice(0, 2) : []),
  ].slice(0, 5);

  return NextResponse.json({
    questions: mixed,
    subject,
    gradeLevel,
    stats: getCurriculumStats(),
  });
}
