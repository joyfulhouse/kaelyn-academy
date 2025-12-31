import { createQuizConfig } from "../defaults";
import type { QuizConfig } from "../../types";

export const grade11Quizzes: Record<string, QuizConfig> = {
  "11-exponential-functions": createQuizConfig({
    id: "11-exponential-functions-quiz",
    title: "Exponential Functions Quiz",
    instructions: "Analyze exponential growth and decay.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "An exponential function has the form:",
        options: ["y = mx + b", "y = ax²", "y = a · bˣ", "y = a/x"],
        correctAnswer: "y = a · bˣ",
        explanation: "In exponential functions, the variable is in the exponent.",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question: "If the base b > 1, the function shows exponential growth.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "b > 1 means growth; 0 < b < 1 means decay.",
        points: 10,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "The number e ≈ 2.___ is the base of natural exponentials.",
        correctAnswer: "718",
        explanation:
          "e ≈ 2.718... is an irrational number fundamental to calculus.",
        points: 10,
      },
    ],
  }),

  "11-logarithms": createQuizConfig({
    id: "11-logarithms-quiz",
    title: "Logarithms Quiz",
    instructions: "Understand and apply logarithms.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "log₂(8) = ?",
        options: ["2", "3", "4", "8"],
        correctAnswer: "3",
        explanation: "2³ = 8, so log₂(8) = 3.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "log(100) = ___ (base 10)",
        correctAnswer: "2",
        explanation: "10² = 100, so log₁₀(100) = 2.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Logarithms are the inverse of exponential functions.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "If y = bˣ, then x = log_b(y).",
        points: 10,
      },
    ],
  }),

  "11-probability": createQuizConfig({
    id: "11-probability-quiz",
    title: "Probability Quiz",
    instructions: "Calculate and interpret probability.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is the probability of flipping heads on a fair coin?",
        options: ["1/4", "1/3", "1/2", "2/3"],
        correctAnswer: "1/2",
        explanation: "There are 2 equally likely outcomes; 1 is heads.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "The probability of an event ranges from 0 to ___.",
        correctAnswer: "1",
        explanation: "0 means impossible; 1 means certain.",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "P(A and B) for independent events equals:",
        options: ["P(A) + P(B)", "P(A) × P(B)", "P(A) - P(B)", "P(A) / P(B)"],
        correctAnswer: "P(A) × P(B)",
        explanation:
          "For independent events, multiply the individual probabilities.",
        points: 10,
      },
    ],
  }),

  "11-shakespeare": createQuizConfig({
    id: "11-shakespeare-quiz",
    title: "Shakespeare Quiz",
    instructions: "Explore Shakespearean drama and poetry.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Shakespeare's plays were performed at the:",
        options: ["Colosseum", "Globe Theatre", "Broadway", "Parthenon"],
        correctAnswer: "Globe Theatre",
        explanation:
          "The Globe Theatre was Shakespeare's famous playhouse in London.",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the play type to its characteristic:",
        options: ["Tragedy", "Comedy", "History"],
        matchTargets: ["Ends in death", "Ends in marriage", "Based on real events"],
        correctAnswer: ["Ends in death", "Ends in marriage", "Based on real events"],
        explanation: "Shakespeare wrote in these three main genres.",
        points: 15,
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "A Shakespearean sonnet has ___ lines.",
        correctAnswer: "14",
        explanation: "Sonnets have 14 lines with a specific rhyme scheme.",
        points: 10,
      },
    ],
  }),

  "11-kinematics": createQuizConfig({
    id: "11-kinematics-quiz",
    title: "Kinematics Quiz",
    instructions: "Study motion mathematically.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The kinematic equation d = v₀t + ½at² calculates:",
        options: ["Velocity", "Acceleration", "Displacement", "Time"],
        correctAnswer: "Displacement",
        explanation:
          "This equation finds displacement given initial velocity, acceleration, and time.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question:
          "Acceleration due to gravity on Earth is approximately ___ m/s².",
        correctAnswer: "9.8",
        explanation: "Objects in free fall accelerate at 9.8 m/s² (or ~10 m/s²).",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "An object moving at constant velocity has zero acceleration.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "Acceleration is the change in velocity; no change means zero acceleration.",
        points: 10,
      },
    ],
  }),

  "11-civil-rights": createQuizConfig({
    id: "11-civil-rights-quiz",
    title: "Civil Rights Movement Quiz",
    instructions: "Study the fight for equality.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "The Montgomery Bus Boycott was sparked by:",
        options: [
          "Malcolm X",
          "Rosa Parks",
          "Martin Luther King Jr.",
          "Thurgood Marshall",
        ],
        correctAnswer: "Rosa Parks",
        explanation:
          "Rosa Parks refused to give up her bus seat on December 1, 1955.",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "Martin Luther King Jr.'s famous speech was 'I Have a ___'.",
        correctAnswer: "Dream",
        explanation:
          "King delivered this speech at the March on Washington in 1963.",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question:
          "The Civil Rights Act of 1964 outlawed discrimination based on race.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation:
          "This landmark legislation ended segregation and discrimination.",
        points: 10,
      },
    ],
  }),

  "11-internet": createQuizConfig({
    id: "11-internet-quiz",
    title: "How the Internet Works Quiz",
    instructions: "Understand internet infrastructure.",
    questions: [
      {
        id: "q1",
        type: "matching",
        question: "Match the protocol to its purpose:",
        options: ["HTTP", "TCP/IP", "DNS"],
        matchTargets: [
          "Web page transfer",
          "Data packet delivery",
          "Domain name lookup",
        ],
        correctAnswer: [
          "Web page transfer",
          "Data packet delivery",
          "Domain name lookup",
        ],
        explanation:
          "These protocols work together to make the internet function.",
        points: 15,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "An IP address uniquely identifies a device on a ___.",
        correctAnswer: "network",
        explanation:
          "IP addresses allow devices to find and communicate with each other.",
        points: 10,
      },
    ],
  }),
};
