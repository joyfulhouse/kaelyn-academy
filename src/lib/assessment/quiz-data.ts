/**
 * Quiz Data
 * Sample quiz configurations for curriculum lessons
 */

import type { QuizConfig } from "./types";

/**
 * Quiz configurations mapped by lesson ID
 */
export const quizConfigs: Record<string, QuizConfig> = {
  // Kindergarten Math - Counting
  "k-count-1-10": {
    id: "k-count-1-10-quiz",
    title: "Counting 1 to 10 Quiz",
    instructions: "Answer these questions about counting from 1 to 10.",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "How many apples are in this picture? 🍎🍎🍎",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "Count each apple: 1, 2, 3. There are 3 apples!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "What number comes after 5?",
        options: ["4", "5", "6", "7"],
        correctAnswer: "6",
        explanation: "After 5 comes 6. The sequence is: 5, 6, 7...",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "The number 8 is bigger than the number 6.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! 8 is bigger than 6 because it comes after 6 when counting.",
        points: 10,
      },
      {
        id: "q4",
        type: "ordering",
        question: "Put these numbers in order from smallest to biggest:",
        options: ["3", "1", "5", "2", "4"],
        correctAnswer: ["1", "2", "3", "4", "5"],
        explanation: "The correct order is: 1, 2, 3, 4, 5",
        points: 20,
      },
    ],
  },

  // Kindergarten Math - 2D Shapes
  "k-2d-shapes": {
    id: "k-2d-shapes-quiz",
    title: "2D Shapes Quiz",
    instructions: "Let's see what you learned about shapes!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "A triangle has 3 sides. Tri means three!",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match each shape to its number of sides:",
        options: ["Circle", "Triangle", "Square", "Rectangle"],
        matchTargets: ["0 sides", "3 sides", "4 sides", "4 sides"],
        correctAnswer: ["0 sides", "3 sides", "4 sides", "4 sides"],
        explanation: "Circles have no straight sides, triangles have 3, and both squares and rectangles have 4 sides.",
        points: 20,
      },
      {
        id: "q3",
        type: "true_false",
        question: "A circle has corners.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "A circle is round and has no corners at all!",
        points: 10,
      },
    ],
  },

  // Kindergarten Math - 3D Shapes
  "k-3d-shapes": {
    id: "k-3d-shapes-quiz",
    title: "3D Shapes Quiz",
    instructions: "Test your knowledge of 3D shapes!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Which shape looks like a ball?",
        options: ["Cube", "Sphere", "Cylinder", "Cone"],
        correctAnswer: "Sphere",
        explanation: "A sphere is round like a ball!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "A box is shaped like a:",
        options: ["Sphere", "Cone", "Cube", "Cylinder"],
        correctAnswer: "Cube",
        explanation: "A cube has 6 flat faces, just like a box!",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "A cone has a flat bottom and a point at the top.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Think of an ice cream cone - flat on bottom, pointy on top.",
        points: 10,
      },
    ],
  },

  // Grade 3 - Multiplication Introduction
  "3-mult-intro": {
    id: "3-mult-intro-quiz",
    title: "Introduction to Multiplication Quiz",
    instructions: "Show what you learned about multiplication!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is 3 × 4?",
        options: ["7", "10", "12", "14"],
        correctAnswer: "12",
        explanation: "3 × 4 means 3 groups of 4, which equals 12.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "5 × 2 = ___",
        correctAnswer: "10",
        explanation: "5 × 2 = 10. Think of it as 5 + 5!",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "If you have 4 bags with 3 apples in each bag, how many apples do you have in total?",
        options: ["7", "10", "12", "15"],
        correctAnswer: "12",
        explanation: "4 bags × 3 apples = 12 apples total.",
        points: 15,
      },
      {
        id: "q4",
        type: "true_false",
        question: "2 × 6 gives the same answer as 6 × 2.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! This is called the commutative property. Order doesn't matter in multiplication.",
        points: 10,
      },
      {
        id: "q5",
        type: "ordering",
        question: "Put these products in order from smallest to largest:",
        options: ["2×5", "3×3", "4×2", "1×6"],
        correctAnswer: ["1×6", "4×2", "3×3", "2×5"],
        explanation: "1×6=6, 4×2=8, 3×3=9, 2×5=10. So the order is: 6, 8, 9, 10.",
        points: 15,
      },
    ],
  },

  // Grade 3 - Fractions Introduction
  "3-fractions-intro": {
    id: "3-fractions-intro-quiz",
    title: "Introduction to Fractions Quiz",
    instructions: "Test your understanding of fractions!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "If a pizza is cut into 4 equal pieces and you eat 1 piece, what fraction did you eat?",
        options: ["1/2", "1/3", "1/4", "1/5"],
        correctAnswer: "1/4",
        explanation: "You ate 1 piece out of 4 equal pieces, which is 1/4 (one-fourth).",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question: "In the fraction 3/4, the number 3 is called the numerator.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "The top number in a fraction is called the numerator. The bottom number is the denominator.",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "Which fraction is larger: 1/2 or 1/4?",
        options: ["1/2", "1/4", "They are equal"],
        correctAnswer: "1/2",
        explanation: "1/2 is larger because when you divide something into fewer pieces, each piece is bigger!",
        points: 10,
      },
      {
        id: "q4",
        type: "fill_blank",
        question: "If you have 2/4 of a pie, that's the same as having ___ (write as a fraction like 1/2)",
        correctAnswer: "1/2",
        explanation: "2/4 = 1/2. These are equivalent fractions!",
        points: 15,
      },
    ],
  },

  // Science - Solar System
  "3-solar-system": {
    id: "3-solar-system-quiz",
    title: "Solar System Quiz",
    instructions: "Answer questions about our solar system!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is at the center of our solar system?",
        options: ["Earth", "Moon", "Sun", "Mars"],
        correctAnswer: "Sun",
        explanation: "The Sun is a star at the center of our solar system. All planets orbit around it.",
        points: 10,
      },
      {
        id: "q2",
        type: "ordering",
        question: "Put these planets in order from closest to the Sun to farthest:",
        options: ["Earth", "Mars", "Venus", "Mercury"],
        correctAnswer: ["Mercury", "Venus", "Earth", "Mars"],
        explanation: "The order from the Sun is: Mercury, Venus, Earth, Mars (the inner rocky planets).",
        points: 20,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Earth is the only planet in our solar system with a moon.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Many planets have moons! Mars has 2, Jupiter has at least 95, and Saturn has over 140!",
        points: 10,
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "Which planet is known as the 'Red Planet'?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        explanation: "Mars is called the Red Planet because of the iron oxide (rust) on its surface.",
        points: 10,
      },
    ],
  },

  // Science - Atoms
  "7-atoms": {
    id: "7-atoms-quiz",
    title: "Atomic Structure Quiz",
    instructions: "Test your knowledge of atoms and their structure!",
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What are the three main particles that make up an atom?",
        options: [
          "Protons, neutrons, and electrons",
          "Protons, neurons, and electrons",
          "Positrons, neutrons, and electrons",
          "Protons, neutrons, and positrons",
        ],
        correctAnswer: "Protons, neutrons, and electrons",
        explanation: "Atoms consist of protons (positive), neutrons (neutral), and electrons (negative).",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match each particle to its charge:",
        options: ["Proton", "Neutron", "Electron"],
        matchTargets: ["Positive (+)", "Neutral (0)", "Negative (-)"],
        correctAnswer: ["Positive (+)", "Neutral (0)", "Negative (-)"],
        explanation: "Protons are positive, neutrons have no charge, and electrons are negative.",
        points: 15,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Electrons orbit the nucleus of an atom.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Electrons move around the nucleus in regions called electron shells or orbitals.",
        points: 10,
      },
      {
        id: "q4",
        type: "fill_blank",
        question: "The center of an atom is called the ___.",
        correctAnswer: "nucleus",
        explanation: "The nucleus is the central core of an atom, containing protons and neutrons.",
        points: 10,
      },
      {
        id: "q5",
        type: "multiple_choice",
        question: "What determines the element of an atom?",
        options: [
          "Number of electrons",
          "Number of neutrons",
          "Number of protons",
          "Size of the nucleus",
        ],
        correctAnswer: "Number of protons",
        explanation: "The atomic number (number of protons) determines what element an atom is.",
        points: 15,
      },
    ],
  },
};

/**
 * Get quiz configuration for a lesson
 */
export function getQuizForLesson(lessonId: string): QuizConfig | null {
  return quizConfigs[lessonId] ?? null;
}

/**
 * Check if a lesson has a quiz
 */
export function hasQuiz(lessonId: string): boolean {
  return lessonId in quizConfigs;
}

/**
 * Get all available quiz IDs
 */
export function getAllQuizIds(): string[] {
  return Object.keys(quizConfigs);
}
