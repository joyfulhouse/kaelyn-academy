import type { Problem, Difficulty, ProblemType, PlaceValueQuiz, MultiplicationQuiz, DivisionQuiz, SetsQuiz, PairsQuiz, CompareQuiz } from '@/types';
import { needsCarry, needsBorrow } from './mathUtils';

/**
 * Get range based on difficulty
 */
function getRange(difficulty: Difficulty): { min: number; max: number } {
  switch (difficulty) {
    case 'easy':
      return { min: 1, max: 10 };
    case 'medium':
      return { min: 10, max: 100 };
    case 'hard':
      return { min: 100, max: 1000 };
    default:
      return { min: 1, max: 10 };
  }
}

/**
 * Generate a random number in range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate an addition problem
 */
export function generateAdditionProblem(difficulty: Difficulty): Problem {
  const { min, max } = getRange(difficulty);
  const num1 = randomInRange(min, max);
  const num2 = randomInRange(min, max);
  return {
    num1,
    num2,
    answer: num1 + num2,
    type: 'addition',
  };
}

/**
 * Generate a subtraction problem (ensures positive result)
 */
export function generateSubtractionProblem(difficulty: Difficulty): Problem {
  const { min, max } = getRange(difficulty);
  let num1 = randomInRange(min, max);
  let num2 = randomInRange(min, max);

  // Ensure num1 >= num2 for positive result
  if (num2 > num1) {
    [num1, num2] = [num2, num1];
  }

  return {
    num1,
    num2,
    answer: num1 - num2,
    type: 'subtraction',
  };
}

/**
 * Generate a multiplication problem (capped at 12x12)
 */
export function generateMultiplicationProblem(_difficulty: Difficulty): Problem {
  // Multiplication is always 1-12 regardless of difficulty
  const num1 = randomInRange(1, 12);
  const num2 = randomInRange(1, 12);
  return {
    num1,
    num2,
    answer: num1 * num2,
    type: 'multiplication',
  };
}

/**
 * Generate a division problem (clean division, capped at 12)
 */
export function generateDivisionProblem(_difficulty: Difficulty): Problem {
  // Generate factors first to ensure clean division
  const num2 = randomInRange(1, 12); // divisor
  const answer = randomInRange(1, 12); // quotient
  const num1 = num2 * answer; // dividend

  return {
    num1,
    num2,
    answer,
    type: 'division',
  };
}

const MAX_ITERATIONS = 100;

/**
 * Generate a problem that requires carrying
 */
export function generateCarryProblem(): Problem {
  let num1: number, num2: number;
  let iterations = 0;

  do {
    num1 = randomInRange(100, 799);
    num2 = randomInRange(100, 799);
    iterations++;
    // Safety guard: if we can't find a valid problem, use fallback values
    if (iterations >= MAX_ITERATIONS) {
      num1 = 156;
      num2 = 278;
      break;
    }
  } while (!needsCarry(num1, num2));

  return {
    num1,
    num2,
    answer: num1 + num2,
    type: 'addition',
  };
}

/**
 * Generate a problem that requires borrowing
 */
export function generateBorrowProblem(): Problem {
  let num1: number, num2: number;
  let iterations = 0;

  do {
    num1 = randomInRange(200, 599);
    num2 = randomInRange(100, num1 - 100);
    iterations++;
    // Safety guard: if we can't find a valid problem, use fallback values
    if (iterations >= MAX_ITERATIONS) {
      num1 = 423;
      num2 = 187;
      break;
    }
  } while (!needsBorrow(num1, num2) || num1 <= num2);

  return {
    num1,
    num2,
    answer: num1 - num2,
    type: 'subtraction',
  };
}

/**
 * Generate a problem based on type and difficulty
 */
export function generateProblem(type: ProblemType, difficulty: Difficulty): Problem {
  switch (type) {
    case 'addition':
      return generateAdditionProblem(difficulty);
    case 'subtraction':
      return generateSubtractionProblem(difficulty);
    case 'multiplication':
      return generateMultiplicationProblem(difficulty);
    case 'division':
      return generateDivisionProblem(difficulty);
    case 'mixed':
      const types: ProblemType[] = ['addition', 'subtraction', 'multiplication', 'division'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return generateProblem(randomType, difficulty);
    default:
      return generateAdditionProblem(difficulty);
  }
}

/**
 * Generate multiple problems
 */
export function generateProblems(
  type: ProblemType,
  count: number,
  difficulty: Difficulty
): Problem[] {
  return Array.from({ length: count }, () => generateProblem(type, difficulty));
}

/**
 * Generate a place value quiz question
 */
export function generatePlaceValueQuiz(maxNumber: number = 9999): PlaceValueQuiz {
  const number = randomInRange(1, maxNumber);

  // Only ask about places that exist in the number
  const numDigits = number.toString().length;
  const availablePlaces: ('thousands' | 'hundreds' | 'tens' | 'ones')[] = [];
  if (numDigits >= 4) availablePlaces.push('thousands');
  if (numDigits >= 3) availablePlaces.push('hundreds');
  if (numDigits >= 2) availablePlaces.push('tens');
  availablePlaces.push('ones'); // ones always exists

  const place = availablePlaces[Math.floor(Math.random() * availablePlaces.length)];

  const placeValues = {
    thousands: Math.floor(number / 1000) % 10,
    hundreds: Math.floor(number / 100) % 10,
    tens: Math.floor(number / 10) % 10,
    ones: number % 10,
  };

  const answer = placeValues[place];

  // Generate options - ALWAYS include the correct answer first
  const digits = number.toString().split('').map(Number);

  // Start with the answer
  const options: number[] = [answer];

  // Add other digits from the number
  for (const d of digits) {
    if (!options.includes(d) && options.length < 4) {
      options.push(d);
    }
  }

  // If we still need more options, add random digits
  while (options.length < 4) {
    const randomDigit = randomInRange(0, 9);
    if (!options.includes(randomDigit)) {
      options.push(randomDigit);
    }
  }

  // Shuffle the options so the answer isn't always first
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    number,
    place,
    answer,
    options: options.slice(0, 4),
  };
}

/**
 * Generate a multiplication quiz
 */
export function generateMultiplicationQuiz(): MultiplicationQuiz {
  const a = randomInRange(1, 12);
  const b = randomInRange(1, 12);
  return {
    a,
    b,
    answer: a * b,
  };
}

/**
 * Generate a division quiz (clean division)
 */
export function generateDivisionQuiz(): DivisionQuiz {
  const groups = randomInRange(1, 12);
  const answer = randomInRange(1, 12);
  const total = groups * answer;

  return {
    total,
    groups,
    answer,
  };
}

/**
 * Fisher-Yates shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a sets quiz question (count sets, items per set, or total)
 */
export function generateSetsQuiz(): SetsQuiz {
  const numSets = randomInRange(2, 6);
  const itemsPerSet = randomInRange(2, 8);
  const total = numSets * itemsPerSet;

  // Randomly choose question type
  const questionTypes: SetsQuiz['questionType'][] = ['find-total', 'find-sets', 'find-items'];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  // Generate answer based on question type
  let answer: number;
  switch (questionType) {
    case 'find-total':
      answer = total;
      break;
    case 'find-sets':
      answer = numSets;
      break;
    case 'find-items':
      answer = itemsPerSet;
      break;
  }

  // Generate options including the correct answer
  const optionsSet = new Set<number>([answer]);

  // Add plausible wrong answers
  while (optionsSet.size < 4) {
    let wrongAnswer: number;
    if (questionType === 'find-total') {
      // Wrong totals: ±1-3 from correct, or numSets + itemsPerSet
      const offsets = [-3, -2, -1, 1, 2, 3, numSets + itemsPerSet - total];
      wrongAnswer = total + offsets[Math.floor(Math.random() * offsets.length)];
    } else {
      // Wrong counts: ±1-2 from correct
      wrongAnswer = answer + randomInRange(-2, 2);
    }
    if (wrongAnswer > 0 && wrongAnswer !== answer) {
      optionsSet.add(wrongAnswer);
    }
  }

  return {
    numSets,
    itemsPerSet,
    total,
    questionType,
    options: shuffleArray([...optionsSet]),
  };
}

/**
 * Generate a pairs/even-odd quiz question
 */
export function generatePairsQuiz(): PairsQuiz {
  const number = randomInRange(1, 20);
  const isEven = number % 2 === 0;
  const numPairs = Math.floor(number / 2);
  const leftover = number % 2;

  return {
    number,
    isEven,
    numPairs,
    leftover,
  };
}

/**
 * Generate a comparison quiz question (more/fewer/same)
 */
export function generateCompareQuiz(): CompareQuiz {
  // Ensure variety: sometimes equal, sometimes different
  const shouldBeEqual = Math.random() < 0.25; // 25% chance of equal sets

  let setA: number;
  let setB: number;

  if (shouldBeEqual) {
    setA = randomInRange(2, 10);
    setB = setA;
  } else {
    setA = randomInRange(2, 10);
    // Ensure setB is different from setA
    do {
      setB = randomInRange(2, 10);
    } while (setB === setA);
  }

  let answer: CompareQuiz['answer'];
  if (setA > setB) {
    answer = 'more';
  } else if (setA < setB) {
    answer = 'fewer';
  } else {
    answer = 'same';
  }

  return {
    setA,
    setB,
    answer,
  };
}
