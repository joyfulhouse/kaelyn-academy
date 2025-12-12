/**
 * Comprehensive Math Validation Tests
 * These tests verify all math calculations are correct for young learners
 */

import {
  calculateCarryPositions,
  calculateBorrowAdjustments,
  getDigitAtPlace,
  parseIntoPlaceValues,
  padNumber,
  needsCarry,
  needsBorrow,
} from './mathUtils';

import {
  generateAdditionProblem,
  generateSubtractionProblem,
  generateMultiplicationProblem,
  generateDivisionProblem,
  generateCarryProblem,
  generateBorrowProblem,
  generatePlaceValueQuiz,
  generateMultiplicationQuiz,
  generateDivisionQuiz,
} from './problemGenerators';

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: (e as Error).message });
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} <= ${expected}`);
      }
    },
    toBeTrue() {
      if (actual !== true) {
        throw new Error(`Expected true, got ${actual}`);
      }
    },
    toBeFalse() {
      if (actual !== false) {
        throw new Error(`Expected false, got ${actual}`);
      }
    },
  };
}

// ============================================================
// PLACE VALUE TESTS
// ============================================================

test('parseIntoPlaceValues: 1234 should parse correctly', () => {
  const result = parseIntoPlaceValues(1234);
  expect(result.thousands).toBe(1);
  expect(result.hundreds).toBe(2);
  expect(result.tens).toBe(3);
  expect(result.ones).toBe(4);
});

test('parseIntoPlaceValues: 5678 should parse correctly', () => {
  const result = parseIntoPlaceValues(5678);
  expect(result.thousands).toBe(5);
  expect(result.hundreds).toBe(6);
  expect(result.tens).toBe(7);
  expect(result.ones).toBe(8);
});

test('parseIntoPlaceValues: 42 should have 0 thousands and hundreds', () => {
  const result = parseIntoPlaceValues(42);
  expect(result.thousands).toBe(0);
  expect(result.hundreds).toBe(0);
  expect(result.tens).toBe(4);
  expect(result.ones).toBe(2);
});

test('parseIntoPlaceValues: 7 should be all zeros except ones', () => {
  const result = parseIntoPlaceValues(7);
  expect(result.thousands).toBe(0);
  expect(result.hundreds).toBe(0);
  expect(result.tens).toBe(0);
  expect(result.ones).toBe(7);
});

test('getDigitAtPlace: 2447 hundreds should be 4', () => {
  expect(getDigitAtPlace(2447, 'hundreds')).toBe(4);
});

test('getDigitAtPlace: 2447 tens should be 4', () => {
  expect(getDigitAtPlace(2447, 'tens')).toBe(4);
});

test('getDigitAtPlace: 2447 ones should be 7', () => {
  expect(getDigitAtPlace(2447, 'ones')).toBe(7);
});

test('getDigitAtPlace: 2447 thousands should be 2', () => {
  expect(getDigitAtPlace(2447, 'thousands')).toBe(2);
});

// ============================================================
// ADDITION TESTS
// ============================================================

test('Addition: 7 + 9 = 16', () => {
  expect(7 + 9).toBe(16);
});

test('Addition: 156 + 278 = 434', () => {
  expect(156 + 278).toBe(434);
});

test('Addition: 999 + 1 = 1000', () => {
  expect(999 + 1).toBe(1000);
});

test('generateAdditionProblem: answer should be num1 + num2', () => {
  for (let i = 0; i < 20; i++) {
    const problem = generateAdditionProblem('easy');
    expect(problem.answer).toBe(problem.num1 + problem.num2);
  }
});

// ============================================================
// SUBTRACTION TESTS
// ============================================================

test('Subtraction: 16 - 9 = 7', () => {
  expect(16 - 9).toBe(7);
});

test('Subtraction: 432 - 187 = 245', () => {
  expect(432 - 187).toBe(245);
});

test('generateSubtractionProblem: answer should be num1 - num2', () => {
  for (let i = 0; i < 20; i++) {
    const problem = generateSubtractionProblem('easy');
    expect(problem.answer).toBe(problem.num1 - problem.num2);
    // Result should be non-negative
    expect(problem.answer).toBeGreaterThanOrEqual(0);
  }
});

// ============================================================
// CARRY TESTS
// ============================================================

test('needsCarry: 7 + 9 needs carry (7+9=16 >= 10)', () => {
  expect(needsCarry(7, 9)).toBeTrue();
});

test('needsCarry: 2 + 3 does not need carry', () => {
  expect(needsCarry(2, 3)).toBeFalse();
});

test('needsCarry: 156 + 278 needs carry', () => {
  expect(needsCarry(156, 278)).toBeTrue();
});

test('calculateCarryPositions: 156 + 278', () => {
  // 156 + 278 = 434
  // Ones: 6 + 8 = 14 >= 10, carry to tens
  // Tens: 5 + 7 + 1 = 13 >= 10, carry to hundreds
  // Hundreds: 1 + 2 + 1 = 4
  const carries = calculateCarryPositions(156, 278, 3);
  // carries[i] = true means there's a carry INTO position i
  expect(carries[0]).toBeTrue();  // carry into hundreds
  expect(carries[1]).toBeTrue();  // carry into tens
  expect(carries[2]).toBeFalse(); // no carry into ones (ones don't receive carries from right)
});

test('calculateCarryPositions: 23 + 45', () => {
  // 23 + 45 = 68
  // Ones: 3 + 5 = 8 < 10, no carry
  // Tens: 2 + 4 = 6 < 10, no carry
  const carries = calculateCarryPositions(23, 45, 2);
  expect(carries[0]).toBeFalse();
  expect(carries[1]).toBeFalse();
});

test('generateCarryProblem: should require carry', () => {
  for (let i = 0; i < 10; i++) {
    const problem = generateCarryProblem();
    expect(needsCarry(problem.num1, problem.num2)).toBeTrue();
    expect(problem.answer).toBe(problem.num1 + problem.num2);
  }
});

// ============================================================
// BORROW TESTS
// ============================================================

test('needsBorrow: 16 - 9 needs borrow (6 < 9)', () => {
  expect(needsBorrow(16, 9)).toBeTrue();
});

test('needsBorrow: 25 - 13 does not need borrow', () => {
  expect(needsBorrow(25, 13)).toBeFalse();
});

test('needsBorrow: 432 - 187 needs borrow', () => {
  expect(needsBorrow(432, 187)).toBeTrue();
});

test('calculateBorrowAdjustments: 432 - 187', () => {
  // 432 - 187 = 245
  // Ones: 2 < 7, borrow from tens
  // After borrow: 12 - 7 = 5 (ones)
  // Tens: 3-1=2 < 8, borrow from hundreds
  // After borrow: 12 - 8 = 4 (tens)
  // Hundreds: 4-1=3 - 1 = 2 (hundreds)
  const { borrows } = calculateBorrowAdjustments(432, 187, 3);
  expect(borrows[2]).toBeTrue();  // borrow for ones column
  expect(borrows[1]).toBeTrue();  // borrow for tens column
});

test('calculateBorrowAdjustments: 100 - 1', () => {
  // 100 - 1 = 99
  // Ones: 0 < 1, need to borrow
  // Tens: 0 is 0, need to cascade borrow from hundreds
  const { adjusted } = calculateBorrowAdjustments(100, 1, 3);
  // After borrowing: [0, 9, 10] (hundreds reduced, tens became 9, ones got +10)
  expect(adjusted[0]).toBe(0);
  expect(adjusted[1]).toBe(9);
  expect(adjusted[2]).toBe(10);
});

test('generateBorrowProblem: should require borrow and have correct answer', () => {
  for (let i = 0; i < 10; i++) {
    const problem = generateBorrowProblem();
    expect(needsBorrow(problem.num1, problem.num2)).toBeTrue();
    expect(problem.answer).toBe(problem.num1 - problem.num2);
    expect(problem.answer).toBeGreaterThanOrEqual(0);
  }
});

// ============================================================
// MULTIPLICATION TESTS
// ============================================================

test('Multiplication: 3 × 4 = 12', () => {
  expect(3 * 4).toBe(12);
});

test('Multiplication: 7 × 8 = 56', () => {
  expect(7 * 8).toBe(56);
});

test('Multiplication: 12 × 12 = 144', () => {
  expect(12 * 12).toBe(144);
});

test('generateMultiplicationProblem: answer should be num1 × num2', () => {
  for (let i = 0; i < 20; i++) {
    const problem = generateMultiplicationProblem('easy');
    expect(problem.answer).toBe(problem.num1 * problem.num2);
    expect(problem.num1).toBeGreaterThanOrEqual(1);
    expect(problem.num1).toBeLessThanOrEqual(12);
    expect(problem.num2).toBeGreaterThanOrEqual(1);
    expect(problem.num2).toBeLessThanOrEqual(12);
  }
});

test('generateMultiplicationQuiz: answer should be a × b', () => {
  for (let i = 0; i < 20; i++) {
    const quiz = generateMultiplicationQuiz();
    expect(quiz.answer).toBe(quiz.a * quiz.b);
  }
});

// ============================================================
// DIVISION TESTS
// ============================================================

test('Division: 12 ÷ 3 = 4', () => {
  expect(Math.floor(12 / 3)).toBe(4);
});

test('Division: 56 ÷ 7 = 8', () => {
  expect(Math.floor(56 / 7)).toBe(8);
});

test('Division: 144 ÷ 12 = 12', () => {
  expect(Math.floor(144 / 12)).toBe(12);
});

test('generateDivisionProblem: should be clean division (no remainder)', () => {
  for (let i = 0; i < 20; i++) {
    const problem = generateDivisionProblem('easy');
    expect(problem.answer).toBe(problem.num1 / problem.num2);
    expect(problem.num1 % problem.num2).toBe(0); // Clean division
  }
});

test('generateDivisionQuiz: total ÷ groups = answer (clean division)', () => {
  for (let i = 0; i < 20; i++) {
    const quiz = generateDivisionQuiz();
    expect(quiz.answer).toBe(quiz.total / quiz.groups);
    expect(quiz.total % quiz.groups).toBe(0);
  }
});

// ============================================================
// PLACE VALUE QUIZ TESTS
// ============================================================

test('generatePlaceValueQuiz: answer matches digit at place', () => {
  for (let i = 0; i < 20; i++) {
    const quiz = generatePlaceValueQuiz(9999);
    const expectedAnswer = getDigitAtPlace(quiz.number, quiz.place);
    expect(quiz.answer).toBe(expectedAnswer);
  }
});

test('generatePlaceValueQuiz: answer is in options', () => {
  for (let i = 0; i < 20; i++) {
    const quiz = generatePlaceValueQuiz(9999);
    const hasAnswer = quiz.options.includes(quiz.answer);
    if (!hasAnswer) {
      throw new Error(`Answer ${quiz.answer} not in options ${JSON.stringify(quiz.options)} for number ${quiz.number} place ${quiz.place}`);
    }
  }
});

// ============================================================
// PADDING TESTS
// ============================================================

test('padNumber: 5 padded to 3 digits is "005"', () => {
  expect(padNumber(5, 3)).toBe('005');
});

test('padNumber: 42 padded to 3 digits is "042"', () => {
  expect(padNumber(42, 3)).toBe('042');
});

test('padNumber: 123 padded to 3 digits is "123"', () => {
  expect(padNumber(123, 3)).toBe('123');
});

// ============================================================
// RUN ALL TESTS
// ============================================================

console.log('\n========================================');
console.log('  MATH VALIDATION TEST RESULTS');
console.log('========================================\n');

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

results.forEach(r => {
  if (r.passed) {
    console.log(`✓ ${r.name}`);
  } else {
    console.log(`✗ ${r.name}`);
    console.log(`  ERROR: ${r.error}`);
  }
});

console.log('\n----------------------------------------');
console.log(`Total: ${results.length} tests`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('----------------------------------------\n');

if (failed > 0) {
  process.exit(1);
}
