import { createQuizConfig } from "../defaults";
import type { QuizConfig } from "../../types";

export const grade9Quizzes: Record<string, QuizConfig> = {
  "9-polynomials": createQuizConfig({
    id: "9-polynomials-quiz",
    title: "Polynomials Quiz",
    instructions: "Understand and manipulate polynomials.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is the degree of 3x⁴ + 2x² - 5x + 1?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "4",
        explanation: "The degree is the highest power of x, which is 4.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "(x + 3)(x - 3) = x² - ___",
        correctAnswer: "9",
        explanation: "This is a difference of squares: (a+b)(a-b) = a² - b².",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "Combine: (2x² + 3x) + (x² - 5x)",
        options: ["3x² - 2x", "3x² + 8x", "2x² - 2x", "3x² - 8x"],
        correctAnswer: "3x² - 2x",
        explanation: "Add like terms: 2x² + x² = 3x², and 3x + (-5x) = -2x.",
        points: 10,
      },
    ],
  }),

  "9-slope-intercept": createQuizConfig({
    id: "9-slope-intercept-quiz",
    title: "Slope-Intercept Form Quiz",
    instructions: "Graph and write linear equations.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "In y = mx + b, what does 'm' represent?",
        options: ["Y-intercept", "Slope", "X-intercept", "Origin"],
        correctAnswer: "Slope",
        explanation:
          "In slope-intercept form, m is the slope and b is the y-intercept.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "The y-intercept of y = 2x + 5 is ___.",
        correctAnswer: "5",
        explanation:
          "The y-intercept is the 'b' value, where the line crosses the y-axis.",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "A line with slope 0 is:",
        options: ["Vertical", "Horizontal", "Diagonal", "Undefined"],
        correctAnswer: "Horizontal",
        explanation:
          "Zero slope means no vertical change - a flat horizontal line.",
        points: 10,
      },
    ],
  }),

  "9-rhetorical-analysis": createQuizConfig({
    id: "9-rhetorical-analysis-quiz",
    title: "Rhetorical Analysis Quiz",
    instructions: "Analyze rhetorical strategies in texts.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match the rhetorical appeal to its meaning:",
        options: ["Ethos", "Pathos", "Logos"],
        matchTargets: ["Credibility/ethics", "Emotion", "Logic/reason"],
        correctAnswer: ["Credibility/ethics", "Emotion", "Logic/reason"],
        explanation: "Aristotle identified these three modes of persuasion.",
        points: 15,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question:
          "An advertisement showing a celebrity using a product appeals to:",
        options: ["Logos", "Pathos", "Ethos", "None"],
        correctAnswer: "Ethos",
        explanation: "Celebrity endorsement uses the celebrity's credibility.",
        points: 10,
      },
      {
        id: "q3",
        type: "fill_blank",
        question:
          "Using statistics and facts in an argument is an appeal to ___.",
        correctAnswer: "logos",
        explanation:
          "Logos appeals to the audience's sense of reason and logic.",
        points: 10,
      },
    ],
  }),

  "9-cell-biology": createQuizConfig({
    id: "9-cell-biology-quiz",
    title: "Advanced Cell Biology Quiz",
    instructions: "Test your knowledge of cell processes.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is the function of the cell membrane?",
        options: [
          "Energy production",
          "Protein synthesis",
          "Controlling what enters and exits",
          "DNA storage",
        ],
        correctAnswer: "Controlling what enters and exits",
        explanation:
          "The cell membrane is selectively permeable, regulating transport.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question:
          "The process of cells dividing to form two identical cells is called ___.",
        correctAnswer: "mitosis",
        explanation: "Mitosis produces two genetically identical daughter cells.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "ATP is the main energy currency of cells.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "ATP (adenosine triphosphate) stores and transfers cellular energy.",
        points: 10,
      },
    ],
  }),

  "9-photosynthesis": createQuizConfig({
    id: "9-photosynthesis-quiz",
    title: "Photosynthesis Quiz",
    instructions: "Understand how plants make food.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What are the products of photosynthesis?",
        options: [
          "Carbon dioxide and water",
          "Glucose and oxygen",
          "Oxygen and water",
          "Glucose and carbon dioxide",
        ],
        correctAnswer: "Glucose and oxygen",
        explanation: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "Photosynthesis occurs in the ___ of plant cells.",
        correctAnswer: "chloroplast",
        explanation:
          "Chloroplasts contain chlorophyll which captures light energy.",
        points: 10,
      },
      {
        id: "q3",
        type: "matching",
        question: "Match the reactants of photosynthesis:",
        options: ["Carbon dioxide", "Water"],
        matchTargets: ["From the air", "From the roots"],
        correctAnswer: ["From the air", "From the roots"],
        explanation: "CO₂ enters through stomata; water is absorbed by roots.",
        points: 15,
      },
    ],
  }),

  "9-constitution": createQuizConfig({
    id: "9-constitution-quiz",
    title: "The Constitution Quiz",
    instructions: "Study the U.S. Constitution in depth.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "How many amendments are in the Bill of Rights?",
        options: ["5", "10", "15", "27"],
        correctAnswer: "10",
        explanation: "The first 10 amendments are called the Bill of Rights.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match each branch to its main function:",
        options: ["Legislative", "Executive", "Judicial"],
        matchTargets: ["Makes laws", "Enforces laws", "Interprets laws"],
        correctAnswer: ["Makes laws", "Enforces laws", "Interprets laws"],
        explanation:
          "The separation of powers divides government into three branches.",
        points: 15,
      },
      {
        id: "q3",
        type: "fill_blank",
        question:
          "The First Amendment protects freedom of speech, religion, press, assembly, and ___.",
        correctAnswer: "petition",
        explanation:
          "The right to petition the government for redress of grievances.",
        points: 10,
      },
    ],
  }),

  "9-hardware": createQuizConfig({
    id: "9-hardware-quiz",
    title: "Computer Hardware Quiz",
    instructions: "Understand computer components.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match the component to its function:",
        options: ["CPU", "RAM", "Hard Drive", "GPU"],
        matchTargets: [
          "Processes instructions",
          "Temporary memory",
          "Long-term storage",
          "Graphics processing",
        ],
        correctAnswer: [
          "Processes instructions",
          "Temporary memory",
          "Long-term storage",
          "Graphics processing",
        ],
        explanation: "Each component has a specific role in computer operation.",
        points: 20,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "CPU stands for Central ___ Unit.",
        correctAnswer: "Processing",
        explanation: "The CPU is the 'brain' of the computer.",
        points: 10,
      },
    ],
  }),
};
