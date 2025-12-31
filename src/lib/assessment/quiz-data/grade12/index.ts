import { createQuizConfig } from "../defaults";
import type { QuizConfig } from "../../types";

export const grade12Quizzes: Record<string, QuizConfig> = {
  "12-limits-intro": createQuizConfig({
    id: "12-limits-intro-quiz",
    title: "Introduction to Limits Quiz",
    instructions: "Understand the concept of limits.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The limit as x approaches 2 of (x²) equals:",
        options: ["2", "4", "8", "undefined"],
        correctAnswer: "4",
        explanation: "lim(x→2) x² = 2² = 4.",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question:
          "A limit can exist even if the function is undefined at that point.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "Limits describe behavior approaching a point, not at the point.",
        points: 10,
      },
      {
        id: "q3",
        type: "fill_blank",
        question:
          "If lim(x→a) f(x) = L, the function approaches ___ as x approaches a.",
        correctAnswer: "L",
        explanation: "The limit value L is what the function output approaches.",
        points: 10,
      },
    ],
  }),

  "12-derivatives-intro": createQuizConfig({
    id: "12-derivatives-intro-quiz",
    title: "Introduction to Derivatives Quiz",
    instructions: "Understand rate of change.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The derivative of f(x) = x² is:",
        options: ["x", "2x", "x³", "2"],
        correctAnswer: "2x",
        explanation: "Using the power rule: d/dx(x²) = 2x.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "A derivative represents the ___ of change of a function.",
        correctAnswer: "rate",
        explanation:
          "Derivatives measure how quickly a function's output changes.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "The derivative of a constant is zero.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Constants don't change, so their rate of change is zero.",
        points: 10,
      },
    ],
  }),

  "12-20th-century": createQuizConfig({
    id: "12-20th-century-quiz",
    title: "20th Century Literature Quiz",
    instructions: "Explore Modernism and Postmodernism.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Modernist literature often featured:",
        options: [
          "Traditional narrative structures",
          "Stream of consciousness",
          "Simple plots",
          "Happy endings",
        ],
        correctAnswer: "Stream of consciousness",
        explanation:
          "Modernists experimented with form, including stream of consciousness.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the author to their work:",
        options: ["F. Scott Fitzgerald", "Ernest Hemingway", "Virginia Woolf"],
        matchTargets: [
          "The Great Gatsby",
          "The Old Man and the Sea",
          "Mrs. Dalloway",
        ],
        correctAnswer: [
          "The Great Gatsby",
          "The Old Man and the Sea",
          "Mrs. Dalloway",
        ],
        explanation: "These are iconic works of 20th century literature.",
        points: 15,
      },
    ],
  }),

  "12-evolution": createQuizConfig({
    id: "12-evolution-quiz",
    title: "Evolution Quiz",
    instructions: "Understand evolutionary biology.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Natural selection is the process by which:",
        options: [
          "All organisms survive equally",
          "Organisms with beneficial traits survive and reproduce more",
          "Organisms choose to evolve",
          "Evolution happens randomly",
        ],
        correctAnswer: "Organisms with beneficial traits survive and reproduce more",
        explanation:
          "Natural selection favors traits that improve survival and reproduction.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question:
          "Charles ___ proposed the theory of evolution by natural selection.",
        correctAnswer: "Darwin",
        explanation: "Darwin published 'On the Origin of Species' in 1859.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Mutations are the original source of genetic variation.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "Mutations create new genetic variants that selection acts upon.",
        points: 10,
      },
    ],
  }),

  "12-climate-change": createQuizConfig({
    id: "12-climate-change-quiz",
    title: "Climate Change Quiz",
    instructions: "Understand climate science.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The greenhouse effect is:",
        options: [
          "Always harmful",
          "Natural and essential for life",
          "A recent phenomenon",
          "Only caused by humans",
        ],
        correctAnswer: "Natural and essential for life",
        explanation:
          "The natural greenhouse effect keeps Earth warm; human activities enhance it.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the greenhouse gas to its source:",
        options: ["CO₂", "Methane", "Nitrous oxide"],
        matchTargets: [
          "Burning fossil fuels",
          "Livestock and landfills",
          "Agricultural fertilizers",
        ],
        correctAnswer: [
          "Burning fossil fuels",
          "Livestock and landfills",
          "Agricultural fertilizers",
        ],
        explanation:
          "Different human activities release different greenhouse gases.",
        points: 15,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "The Paris Agreement aims to limit global warming to 1.5-2°___.",
        correctAnswer: "C",
        explanation:
          "The agreement sets targets to limit temperature rise above pre-industrial levels.",
        points: 10,
      },
    ],
  }),

  "12-micro": createQuizConfig({
    id: "12-micro-quiz",
    title: "Microeconomics Quiz",
    instructions: "Understand individual economic decisions.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Supply and demand determine:",
        options: ["Only supply", "Only demand", "Market price", "Government policy"],
        correctAnswer: "Market price",
        explanation:
          "The intersection of supply and demand curves determines equilibrium price.",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question:
          "When demand increases and supply stays the same, price typically rises.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "Higher demand with same supply creates scarcity, raising prices.",
        points: 10,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "The cost of the next best alternative is called ___ cost.",
        correctAnswer: "opportunity",
        explanation: "Opportunity cost is what you give up when making a choice.",
        points: 10,
      },
    ],
  }),

  "12-ai-ml": createQuizConfig({
    id: "12-ai-ml-quiz",
    title: "AI & Machine Learning Quiz",
    instructions: "Understand artificial intelligence concepts.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Machine learning is a subset of:",
        options: [
          "Robotics",
          "Artificial Intelligence",
          "Database Systems",
          "Networking",
        ],
        correctAnswer: "Artificial Intelligence",
        explanation: "ML is one approach to creating intelligent systems.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the ML type to its description:",
        options: [
          "Supervised learning",
          "Unsupervised learning",
          "Reinforcement learning",
        ],
        matchTargets: [
          "Learns from labeled data",
          "Finds patterns in unlabeled data",
          "Learns from rewards/penalties",
        ],
        correctAnswer: [
          "Learns from labeled data",
          "Finds patterns in unlabeled data",
          "Learns from rewards/penalties",
        ],
        explanation: "These are the three main types of machine learning.",
        points: 15,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "A neural network is inspired by the human ___.",
        correctAnswer: "brain",
        explanation:
          "Neural networks mimic how neurons in the brain process information.",
        points: 10,
      },
    ],
  }),

  "12-recursion": createQuizConfig({
    id: "12-recursion-quiz",
    title: "Recursion Quiz",
    instructions: "Understand recursive algorithms.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "A recursive function:",
        options: [
          "Never stops",
          "Calls itself",
          "Uses loops only",
          "Cannot return values",
        ],
        correctAnswer: "Calls itself",
        explanation:
          "Recursion is when a function calls itself to solve smaller subproblems.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question:
          "Every recursive function must have a ___ case to prevent infinite loops.",
        correctAnswer: "base",
        explanation:
          "The base case stops the recursion when a simple condition is met.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Factorial is a classic example of a recursive algorithm.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "n! = n × (n-1)! is naturally recursive.",
        points: 10,
      },
    ],
  }),
};
