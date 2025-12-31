import { createQuizConfig } from "../defaults";
import type { QuizConfig } from "../../types";

export const grade10Quizzes: Record<string, QuizConfig> = {
  "10-quadratic-intro": createQuizConfig({
    id: "10-quadratic-intro-quiz",
    title: "Quadratic Functions Quiz",
    instructions: "Understand quadratic functions.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The graph of a quadratic function is a:",
        options: ["Line", "Circle", "Parabola", "Hyperbola"],
        correctAnswer: "Parabola",
        explanation: "Quadratic functions produce U-shaped parabola graphs.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "In f(x) = ax² + bx + c, if a < 0, the parabola opens ___.",
        correctAnswer: "downward",
        explanation: "Negative 'a' flips the parabola to open downward.",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "The vertex of a parabola is its:",
        options: [
          "Y-intercept",
          "Highest or lowest point",
          "X-intercept",
          "Slope",
        ],
        correctAnswer: "Highest or lowest point",
        explanation:
          "The vertex is the maximum or minimum point of the parabola.",
        points: 10,
      },
    ],
  }),

  "10-factoring": createQuizConfig({
    id: "10-factoring-quiz",
    title: "Factoring Quadratics Quiz",
    instructions: "Factor quadratic expressions.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Factor: x² + 5x + 6",
        options: [
          "(x + 2)(x + 3)",
          "(x + 1)(x + 6)",
          "(x - 2)(x - 3)",
          "(x + 5)(x + 1)",
        ],
        correctAnswer: "(x + 2)(x + 3)",
        explanation:
          "Find two numbers that multiply to 6 and add to 5: 2 and 3.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "x² - 9 = (x + 3)(x - ___)",
        correctAnswer: "3",
        explanation: "This is a difference of squares: a² - b² = (a+b)(a-b).",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "Factor: x² - 4x - 12",
        options: [
          "(x - 6)(x + 2)",
          "(x + 6)(x - 2)",
          "(x - 4)(x + 3)",
          "(x + 4)(x - 3)",
        ],
        correctAnswer: "(x - 6)(x + 2)",
        explanation:
          "Find numbers that multiply to -12 and add to -4: -6 and 2.",
        points: 15,
      },
    ],
  }),

  "10-quadratic-formula": createQuizConfig({
    id: "10-quadratic-formula-quiz",
    title: "Quadratic Formula Quiz",
    instructions: "Apply the quadratic formula.",
    questions: [
      {
        id: "q1",
        type: "fill_blank",
        question:
          "The quadratic formula is x = (-b ± √(b² - 4ac)) / (2___).",
        correctAnswer: "a",
        explanation: "The formula is x = (-b ± √(b² - 4ac)) / 2a.",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "The discriminant (b² - 4ac) determines:",
        options: [
          "The vertex",
          "The number of real solutions",
          "The y-intercept",
          "The axis of symmetry",
        ],
        correctAnswer: "The number of real solutions",
        explanation:
          "Positive = 2 solutions, zero = 1 solution, negative = no real solutions.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "If the discriminant is negative, there are no real solutions.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Negative discriminant means the roots are complex numbers.",
        points: 10,
      },
    ],
  }),

  "10-realism": createQuizConfig({
    id: "10-realism-quiz",
    title: "American Realism Quiz",
    instructions: "Explore the Realism literary movement.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Realism as a literary movement emphasized:",
        options: [
          "Fantasy and imagination",
          "Everyday life and ordinary people",
          "Romantic ideals",
          "Supernatural elements",
        ],
        correctAnswer: "Everyday life and ordinary people",
        explanation: "Realism depicted life accurately without romanticizing it.",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question: "Mark Twain is considered a Realist writer.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "Twain's works like Huckleberry Finn exemplify American Realism.",
        points: 10,
      },
    ],
  }),

  "10-bonding": createQuizConfig({
    id: "10-bonding-quiz",
    title: "Chemical Bonding Quiz",
    instructions: "Understand how atoms bond.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match the bond type to its description:",
        options: ["Ionic bond", "Covalent bond", "Metallic bond"],
        matchTargets: [
          "Transfer of electrons",
          "Sharing of electrons",
          "Sea of shared electrons",
        ],
        correctAnswer: [
          "Transfer of electrons",
          "Sharing of electrons",
          "Sea of shared electrons",
        ],
        explanation:
          "Different types of bonds form based on electron behavior.",
        points: 15,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "Ionic bonds typically form between:",
        options: [
          "Two metals",
          "Two nonmetals",
          "A metal and a nonmetal",
          "Noble gases",
        ],
        correctAnswer: "A metal and a nonmetal",
        explanation: "Metals give electrons to nonmetals, forming ionic bonds.",
        points: 10,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "Covalent bonds involve the ___ of electrons.",
        correctAnswer: "sharing",
        explanation: "In covalent bonds, atoms share electron pairs.",
        points: 10,
      },
    ],
  }),

  "10-reactions": createQuizConfig({
    id: "10-reactions-quiz",
    title: "Chemical Reactions Quiz",
    instructions: "Identify and balance chemical reactions.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match the reaction type:",
        options: ["Synthesis", "Decomposition", "Single replacement"],
        matchTargets: ["A + B → AB", "AB → A + B", "A + BC → AC + B"],
        correctAnswer: ["A + B → AB", "AB → A + B", "A + BC → AC + B"],
        explanation: "Different patterns indicate different reaction types.",
        points: 15,
      },
      {
        id: "q2",
        type: "true_false",
        question: "In a balanced equation, atoms are conserved.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "The Law of Conservation of Mass: atoms cannot be created or destroyed.",
        points: 10,
      },
    ],
  }),

  "10-enlightenment": createQuizConfig({
    id: "10-enlightenment-quiz",
    title: "Age of Enlightenment Quiz",
    instructions: "Explore Enlightenment ideas.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The Enlightenment emphasized:",
        options: [
          "Faith over reason",
          "Reason and scientific thinking",
          "Divine right of kings",
          "Return to medieval values",
        ],
        correctAnswer: "Reason and scientific thinking",
        explanation:
          "The Enlightenment valued rational thought and questioning authority.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the thinker to their idea:",
        options: ["Locke", "Montesquieu", "Rousseau"],
        matchTargets: ["Natural rights", "Separation of powers", "Social contract"],
        correctAnswer: [
          "Natural rights",
          "Separation of powers",
          "Social contract",
        ],
        explanation: "These philosophers shaped modern political thought.",
        points: 15,
      },
    ],
  }),

  "10-oop": createQuizConfig({
    id: "10-oop-quiz",
    title: "OOP Concepts Quiz",
    instructions: "Understand object-oriented programming.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match OOP concept to its meaning:",
        options: ["Encapsulation", "Inheritance", "Polymorphism"],
        matchTargets: [
          "Hiding internal details",
          "Deriving from parent class",
          "Same interface, different behavior",
        ],
        correctAnswer: [
          "Hiding internal details",
          "Deriving from parent class",
          "Same interface, different behavior",
        ],
        explanation: "These are the pillars of object-oriented programming.",
        points: 15,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "A ___ is a blueprint for creating objects.",
        correctAnswer: "class",
        explanation: "Classes define properties and methods that objects will have.",
        points: 10,
      },
    ],
  }),
};
