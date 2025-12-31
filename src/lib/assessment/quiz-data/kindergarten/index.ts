/**
 * Kindergarten Quiz Data
 *
 * Quiz configurations for kindergarten lessons.
 * Subjects: Math, Reading, Science, History, Technology
 */

import type { QuizConfig } from "../../types";
import { createQuizConfig } from "../defaults";

/**
 * Kindergarten quiz configurations mapped by lesson ID
 */
export const kindergartenQuizzes: Record<string, QuizConfig> = {
  // Math - Counting 1-10
  "k-count-1-10": createQuizConfig({
    id: "k-count-1-10-quiz",
    title: "Counting 1 to 10 Quiz",
    instructions: "Answer these questions about counting from 1 to 10.",
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
  }),

  // Math - 2D Shapes
  "k-2d-shapes": createQuizConfig({
    id: "k-2d-shapes-quiz",
    title: "2D Shapes Quiz",
    instructions: "Let's see what you learned about shapes!",
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
  }),

  // Math - 3D Shapes
  "k-3d-shapes": createQuizConfig({
    id: "k-3d-shapes-quiz",
    title: "3D Shapes Quiz",
    instructions: "Test your knowledge of 3D shapes!",
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
  }),

  // Math - Counting 11-20
  "k-count-11-20": createQuizConfig({
    id: "k-count-11-20-quiz",
    title: "Counting 11 to 20 Quiz",
    instructions: "Let's count bigger numbers! 🔢",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What number comes after 10?",
        options: ["9", "10", "11", "12"],
        correctAnswer: "11",
        explanation: "After 10 comes 11. Keep counting!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "How many stars? ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐",
        options: ["13", "14", "15", "16"],
        correctAnswer: "15",
        explanation: "Count each star: there are 15 stars!",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "The number 18 comes before 17.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "18 comes AFTER 17, not before!",
        points: 10,
      },
      {
        id: "q4",
        type: "ordering",
        question: "Put these numbers in order from smallest to biggest:",
        options: ["15", "12", "18", "11"],
        correctAnswer: ["11", "12", "15", "18"],
        explanation: "The correct order is: 11, 12, 15, 18",
        points: 20,
      },
    ],
  }),

  // Math - Addition Introduction
  "k-addition-intro": createQuizConfig({
    id: "k-addition-intro-quiz",
    title: "Introduction to Addition Quiz",
    instructions: "Let's practice adding! ➕",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "🍎🍎 + 🍎 = How many apples?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "2 apples plus 1 apple equals 3 apples!",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "1 + 1 = ___",
        correctAnswer: "2",
        explanation: "1 plus 1 equals 2!",
        points: 10,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "2 + 2 = ?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "4",
        explanation: "2 plus 2 equals 4!",
        points: 10,
      },
      {
        id: "q4",
        type: "true_false",
        question: "When we add, we put things together.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Adding means putting things together to get more.",
        points: 10,
      },
    ],
  }),

  // Math - Subtraction Introduction
  "k-subtraction-intro": createQuizConfig({
    id: "k-subtraction-intro-quiz",
    title: "Introduction to Subtraction Quiz",
    instructions: "Let's practice taking away! ➖",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "You have 3 cookies 🍪🍪🍪. You eat 1. How many are left?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2",
        explanation: "3 cookies minus 1 cookie equals 2 cookies!",
        points: 10,
      },
      {
        id: "q2",
        type: "fill_blank",
        question: "4 - 1 = ___",
        correctAnswer: "3",
        explanation: "4 minus 1 equals 3!",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "When we subtract, we take things away.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Subtracting means taking away to get less.",
        points: 10,
      },
    ],
  }),

  // Reading - Alphabet
  "k-alphabet": createQuizConfig({
    id: "k-alphabet-quiz",
    title: "The Alphabet Quiz",
    instructions: "Let's test what you know about letters! 🔤",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What letter comes after A?",
        options: ["C", "B", "D", "Z"],
        correctAnswer: "B",
        explanation: "A, B, C! B comes after A.",
        points: 10,
      },
      {
        id: "q2",
        type: "ordering",
        question: "Put these letters in ABC order:",
        options: ["C", "A", "D", "B"],
        correctAnswer: ["A", "B", "C", "D"],
        explanation: "The alphabet goes: A, B, C, D!",
        points: 20,
      },
      {
        id: "q3",
        type: "true_false",
        question: "The letter Z is the last letter of the alphabet.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! The alphabet ends with Z.",
        points: 10,
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "How many letters are in the alphabet?",
        options: ["20", "24", "26", "30"],
        correctAnswer: "26",
        explanation: "There are 26 letters from A to Z!",
        points: 10,
      },
    ],
  }),

  // Reading - Letter Sounds
  "k-letter-sounds": createQuizConfig({
    id: "k-letter-sounds-quiz",
    title: "Letter Sounds Quiz",
    instructions: "Match letters with their sounds! 🔊",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What sound does the letter S make?",
        options: ["sss (like a snake)", "mmm", "bbb", "rrr"],
        correctAnswer: "sss (like a snake)",
        explanation: "S makes the 'sss' sound, like a snake!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "Which letter makes the 'mmmm' sound?",
        options: ["N", "M", "B", "P"],
        correctAnswer: "M",
        explanation: "M makes the 'mmmm' sound!",
        points: 10,
      },
      {
        id: "q3",
        type: "matching",
        question: "Match each letter to its sound:",
        options: ["B", "C", "D"],
        matchTargets: ["buh", "kuh", "duh"],
        correctAnswer: ["buh", "kuh", "duh"],
        explanation: "B says 'buh', C says 'kuh', D says 'duh'!",
        points: 15,
      },
    ],
  }),

  // Reading - Rhyming
  "k-rhyming": createQuizConfig({
    id: "k-rhyming-quiz",
    title: "Rhyming Words Quiz",
    instructions: "Find words that sound alike at the end! 🎵",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Which word rhymes with CAT?",
        options: ["Dog", "Hat", "Cup", "Run"],
        correctAnswer: "Hat",
        explanation: "Cat and Hat both end with 'at' - they rhyme!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "Which word rhymes with SUN?",
        options: ["Moon", "Fun", "Star", "Hot"],
        correctAnswer: "Fun",
        explanation: "Sun and Fun both end with 'un' - they rhyme!",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Dog and Frog rhyme.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Dog and Frog both end with 'og'.",
        points: 10,
      },
    ],
  }),

  // Science - Weather Types
  "k-weather-types": createQuizConfig({
    id: "k-weather-types-quiz",
    title: "Types of Weather Quiz",
    instructions: "What do you know about weather? ☀️🌧️",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What do we call it when water falls from the sky?",
        options: ["Sunny", "Rain", "Wind", "Snow"],
        correctAnswer: "Rain",
        explanation: "When water drops fall from clouds, it's called rain!",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the weather to its picture:",
        options: ["☀️", "🌧️", "❄️"],
        matchTargets: ["Sunny", "Rainy", "Snowy"],
        correctAnswer: ["Sunny", "Rainy", "Snowy"],
        explanation: "Sun means sunny, raindrops mean rainy, snowflake means snowy!",
        points: 15,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Clouds can be in the sky on sunny days.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! We can have sun and some clouds at the same time.",
        points: 10,
      },
    ],
  }),

  // Science - Seasons
  "k-seasons": createQuizConfig({
    id: "k-seasons-quiz",
    title: "Seasons Quiz",
    instructions: "Learn about the four seasons! 🌸☀️🍂❄️",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "In which season do leaves fall from trees?",
        options: ["Spring", "Summer", "Fall", "Winter"],
        correctAnswer: "Fall",
        explanation: "In fall (autumn), leaves change color and fall from trees!",
        points: 10,
      },
      {
        id: "q2",
        type: "ordering",
        question: "Put the seasons in order, starting with Spring:",
        options: ["Winter", "Fall", "Summer", "Spring"],
        correctAnswer: ["Spring", "Summer", "Fall", "Winter"],
        explanation: "The seasons go: Spring, Summer, Fall, Winter!",
        points: 20,
      },
      {
        id: "q3",
        type: "multiple_choice",
        question: "Which season is the coldest?",
        options: ["Spring", "Summer", "Fall", "Winter"],
        correctAnswer: "Winter",
        explanation: "Winter is the coldest season with snow in many places!",
        points: 10,
      },
    ],
  }),

  // Science - Living vs Non-Living
  "k-living-nonliving": createQuizConfig({
    id: "k-living-nonliving-quiz",
    title: "Living vs Non-Living Quiz",
    instructions: "Can you tell what's alive? 🌱🪨",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Which one is a living thing?",
        options: ["Rock", "Tree", "Car", "Table"],
        correctAnswer: "Tree",
        explanation: "Trees are living! They grow, need water, and make seeds.",
        points: 10,
      },
      {
        id: "q2",
        type: "true_false",
        question: "A dog is a living thing.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Dogs are alive - they eat, breathe, grow, and move!",
        points: 10,
      },
      {
        id: "q3",
        type: "matching",
        question: "Is it living or non-living?",
        options: ["Cat", "Flower", "Rock"],
        matchTargets: ["Living", "Living", "Non-living"],
        correctAnswer: ["Living", "Living", "Non-living"],
        explanation: "Cats and flowers are living. Rocks are non-living!",
        points: 15,
      },
    ],
  }),

  // History - Community Helpers
  "k-helpers": createQuizConfig({
    id: "k-helpers-quiz",
    title: "Community Helpers Quiz",
    instructions: "Who helps in our community? 👨‍🚒👩‍⚕️",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Who helps put out fires?",
        options: ["Teacher", "Doctor", "Firefighter", "Chef"],
        correctAnswer: "Firefighter",
        explanation: "Firefighters are brave helpers who put out fires!",
        points: 10,
      },
      {
        id: "q2",
        type: "matching",
        question: "Match each helper to what they do:",
        options: ["Doctor", "Teacher", "Police Officer"],
        matchTargets: ["Helps sick people", "Helps us learn", "Keeps us safe"],
        correctAnswer: ["Helps sick people", "Helps us learn", "Keeps us safe"],
        explanation: "Doctors help sick people, teachers help us learn, police keep us safe!",
        points: 15,
      },
      {
        id: "q3",
        type: "true_false",
        question: "Librarians help us find books.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! Librarians are helpers who work with books!",
        points: 10,
      },
    ],
  }),

  // Technology - Parts of Computer
  "k-parts-computer": createQuizConfig({
    id: "k-parts-computer-quiz",
    title: "Parts of a Computer Quiz",
    instructions: "What are the parts of a computer? 💻",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What part of the computer shows pictures and words?",
        options: ["Mouse", "Keyboard", "Screen/Monitor", "Printer"],
        correctAnswer: "Screen/Monitor",
        explanation: "The screen (or monitor) shows us pictures and words!",
        points: 10,
      },
      {
        id: "q2",
        type: "multiple_choice",
        question: "What do we use to type letters?",
        options: ["Mouse", "Keyboard", "Screen", "Speaker"],
        correctAnswer: "Keyboard",
        explanation: "We type letters and numbers on the keyboard!",
        points: 10,
      },
      {
        id: "q3",
        type: "true_false",
        question: "A mouse helps us click and point on the screen.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Yes! We use the mouse to move the pointer and click!",
        points: 10,
      },
    ],
  }),
};
