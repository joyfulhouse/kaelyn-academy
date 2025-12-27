/**
 * Sample Activity Data
 * Rich interactive activities for key lessons across the curriculum
 */

import type { Activity } from "./activities";
import {
  createQuizActivity,
  createVideoActivity,
  createPracticeActivity,
  createReadingActivity,
  createInteractiveActivity,
} from "./activities";

// Map of lesson IDs to their activities
export const sampleActivities: Record<string, Activity[]> = {
  // Kindergarten - Counting 1 to 10
  "k-count-1-10": [
    createReadingActivity(
      "k-count-intro",
      "Introduction to Counting",
      `# Let's Learn to Count!

Counting is one of the most important skills you'll learn. When we count, we say numbers in order to find out "how many" things there are.

## How to Count
1. Point to each object one at a time
2. Say one number for each object
3. The last number you say tells you how many!

**Let's practice:** Look at the stars below and count them with me:
⭐ ⭐ ⭐

That's right! There are **3 stars**!

Remember: We always start counting from **1** (unless there are zero things).`,
      { estimatedMinutes: 3 }
    ),
    createInteractiveActivity(
      "k-count-drag",
      "Count the Objects",
      "drag_drop",
      {},
      {
        description: "Drag the correct number to match how many objects you see",
        estimatedMinutes: 5,
      }
    ),
    createQuizActivity("k-count-quiz", "Counting Check", [
      {
        id: "q1",
        question: "How many apples? 🍎 🍎 🍎 🍎 🍎",
        questionType: "multiple_choice",
        options: ["3", "4", "5", "6"],
        correctAnswer: "5",
        explanation: "There are 5 apples. Let's count: 1, 2, 3, 4, 5!",
        hint: "Point to each apple as you count.",
      },
      {
        id: "q2",
        question: "How many stars? ⭐ ⭐ ⭐",
        questionType: "multiple_choice",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "Great job! There are 3 stars.",
      },
      {
        id: "q3",
        question: "Which number comes after 7?",
        questionType: "multiple_choice",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8",
        explanation: "When we count: 7, 8, 9, 10. So 8 comes after 7!",
      },
    ]),
  ],

  // Grade 1 - Addition within 20
  "1-add-within-20": [
    createReadingActivity(
      "1-add-intro",
      "What is Addition?",
      `# Understanding Addition

Addition is when we **put groups together** to find out how many we have in all.

## The Plus Sign (+)
When we add, we use the **plus sign**: +

For example: 3 + 2 = 5

This means: 3 objects plus 2 more objects equals 5 objects total.

## Ways to Add
1. **Count on** - Start with the bigger number and count up
2. **Use your fingers** - Show the numbers on your hands
3. **Draw pictures** - Draw circles or dots to count

**Example:**
🔵🔵🔵 + 🔵🔵 = 🔵🔵🔵🔵🔵

3 blue circles + 2 blue circles = 5 blue circles!`,
      { estimatedMinutes: 4 }
    ),
    createPracticeActivity("1-add-practice", "Addition Practice", [
      {
        id: "p1",
        prompt: "5 + 3 = ?",
        inputType: "number",
        correctAnswer: "8",
        hints: ["Start at 5 and count up 3 more: 6, 7, 8"],
        solution: "5 + 3 = 8. You can count: 5... 6, 7, 8!",
        difficulty: 1,
      },
      {
        id: "p2",
        prompt: "7 + 4 = ?",
        inputType: "number",
        correctAnswer: "11",
        hints: ["Start at 7 and count up 4 more", "7... 8, 9, 10, 11"],
        solution: "7 + 4 = 11",
        difficulty: 2,
      },
      {
        id: "p3",
        prompt: "9 + 6 = ?",
        inputType: "number",
        correctAnswer: "15",
        hints: ["Make 10 first: 9 + 1 = 10", "Then add 5 more: 10 + 5 = 15"],
        solution: "9 + 6 = 15. One strategy: 9 + 1 = 10, then 10 + 5 = 15",
        difficulty: 2,
      },
      {
        id: "p4",
        prompt: "8 + 8 = ?",
        inputType: "number",
        correctAnswer: "16",
        hints: ["This is a doubles fact!", "8 + 8 is double 8"],
        solution: "8 + 8 = 16. This is called a doubles fact!",
        difficulty: 2,
      },
    ]),
    createQuizActivity("1-add-quiz", "Addition Quiz", [
      {
        id: "q1",
        question: "What is 6 + 7?",
        questionType: "multiple_choice",
        options: ["11", "12", "13", "14"],
        correctAnswer: "13",
        explanation: "6 + 7 = 13. One way: 6 + 6 = 12, then add 1 more = 13",
      },
      {
        id: "q2",
        question: "What is 9 + 9?",
        questionType: "multiple_choice",
        options: ["16", "17", "18", "19"],
        correctAnswer: "18",
        explanation: "9 + 9 = 18. This is the doubles fact for 9!",
      },
      {
        id: "q3",
        question: "Which number sentence equals 15?",
        questionType: "multiple_choice",
        options: ["7 + 7", "8 + 7", "9 + 5", "6 + 8"],
        correctAnswer: "8 + 7",
        explanation: "8 + 7 = 15. Let's check the others: 7+7=14, 9+5=14, 6+8=14",
      },
    ]),
  ],

  // Grade 3 - Introduction to Multiplication
  "3-mult-intro": [
    createReadingActivity(
      "3-mult-reading",
      "Understanding Multiplication",
      `# What is Multiplication?

Multiplication is a faster way to add **equal groups**.

## Example
Instead of adding: 3 + 3 + 3 + 3 = 12

We can multiply: 4 × 3 = 12

This means: 4 groups of 3 equals 12

## The Times Sign (×)
The × symbol means "groups of" or "times"

**5 × 2** means "5 groups of 2" or "5 times 2"

## Arrays
An **array** is objects arranged in rows and columns.

🔵🔵🔵🔵
🔵🔵🔵🔵
🔵🔵🔵🔵

This array shows: 3 rows × 4 columns = 12 total`,
      { estimatedMinutes: 5 }
    ),
    createInteractiveActivity(
      "3-mult-arrays",
      "Build Arrays",
      "game",
      {
        instructions: "Click to build an array that matches the multiplication problem",
      },
      { estimatedMinutes: 8, description: "Create arrays to solve multiplication problems" }
    ),
    createPracticeActivity("3-mult-practice", "Multiplication Practice", [
      {
        id: "p1",
        prompt: "3 × 4 = ?",
        inputType: "number",
        correctAnswer: "12",
        hints: ["Think: 3 groups of 4", "4 + 4 + 4 = ?"],
        solution: "3 × 4 = 12. That's 4 + 4 + 4 = 12",
        difficulty: 1,
      },
      {
        id: "p2",
        prompt: "5 × 6 = ?",
        inputType: "number",
        correctAnswer: "30",
        hints: ["Count by 5s six times: 5, 10, 15...", "Or count by 6s five times"],
        solution: "5 × 6 = 30",
        difficulty: 2,
      },
      {
        id: "p3",
        prompt: "7 × 8 = ?",
        inputType: "number",
        correctAnswer: "56",
        hints: ["Think: 7 × 8 is close to 7 × 10 = 70", "Subtract 7 × 2 = 14 from 70"],
        solution: "7 × 8 = 56. Memory trick: 5, 6, 7, 8... 56 = 7 × 8!",
        difficulty: 3,
      },
    ]),
    createQuizActivity("3-mult-quiz", "Multiplication Check", [
      {
        id: "q1",
        question: "What multiplication fact does this array show?\n🍎🍎🍎\n🍎🍎🍎\n🍎🍎🍎\n🍎🍎🍎",
        questionType: "multiple_choice",
        options: ["3 × 4 = 12", "4 × 3 = 12", "Both are correct", "Neither"],
        correctAnswer: "Both are correct",
        explanation: "Arrays can be read both ways! 4 rows of 3 = 4 × 3 = 12, or 3 columns of 4 = 3 × 4 = 12",
      },
      {
        id: "q2",
        question: "6 × 7 = ?",
        questionType: "fill_blank",
        correctAnswer: "42",
        explanation: "6 × 7 = 42. This is an important fact to memorize!",
      },
      {
        id: "q3",
        question: "If you have 5 bags with 9 marbles each, how many marbles in total?",
        questionType: "multiple_choice",
        options: ["14", "36", "45", "54"],
        correctAnswer: "45",
        explanation: "5 bags × 9 marbles = 5 × 9 = 45 marbles",
      },
    ]),
  ],

  // Grade 5 - Fractions Operations
  "5-add-sub-fractions": [
    createVideoActivity(
      "5-frac-video",
      "Adding Fractions with Unlike Denominators",
      "https://www.youtube.com/watch?v=example",
      480,
      {
        description: "Learn the step-by-step process for adding fractions with different denominators",
      }
    ),
    createReadingActivity(
      "5-frac-reading",
      "Adding and Subtracting Fractions",
      `# Adding Fractions with Unlike Denominators

When fractions have **different denominators**, we need to find a **common denominator** first.

## Steps to Add Fractions

1. **Find the Least Common Denominator (LCD)**
2. **Convert each fraction** to an equivalent fraction with the LCD
3. **Add the numerators** (the denominator stays the same)
4. **Simplify** if needed

## Example: 1/2 + 1/3

**Step 1:** Find LCD of 2 and 3 = 6

**Step 2:** Convert fractions:
- 1/2 = 3/6 (multiply top and bottom by 3)
- 1/3 = 2/6 (multiply top and bottom by 2)

**Step 3:** Add: 3/6 + 2/6 = 5/6

**Answer:** 1/2 + 1/3 = 5/6

## Subtracting Fractions
The process is the same, just subtract the numerators instead!`,
      { estimatedMinutes: 6 }
    ),
    createPracticeActivity("5-frac-practice", "Fraction Practice", [
      {
        id: "p1",
        prompt: "1/4 + 1/2 = ? (Enter as a fraction like 3/4)",
        inputType: "text",
        correctAnswer: "3/4",
        hints: [
          "Convert 1/2 to fourths: 1/2 = 2/4",
          "Now add: 1/4 + 2/4 = ?",
        ],
        solution: "1/4 + 2/4 = 3/4",
        difficulty: 1,
      },
      {
        id: "p2",
        prompt: "2/3 + 1/6 = ? (Enter as a fraction)",
        inputType: "text",
        correctAnswer: ["5/6"],
        hints: [
          "The LCD of 3 and 6 is 6",
          "Convert 2/3 to sixths: 2/3 = 4/6",
        ],
        solution: "2/3 + 1/6 = 4/6 + 1/6 = 5/6",
        difficulty: 2,
      },
      {
        id: "p3",
        prompt: "3/4 - 1/3 = ? (Enter as a fraction)",
        inputType: "text",
        correctAnswer: "5/12",
        hints: [
          "The LCD of 4 and 3 is 12",
          "3/4 = 9/12 and 1/3 = 4/12",
        ],
        solution: "3/4 - 1/3 = 9/12 - 4/12 = 5/12",
        difficulty: 2,
      },
    ]),
    createQuizActivity("5-frac-quiz", "Fraction Operations Quiz", [
      {
        id: "q1",
        question: "What is 1/3 + 1/4?",
        questionType: "multiple_choice",
        options: ["2/7", "7/12", "2/12", "1/7"],
        correctAnswer: "7/12",
        explanation: "LCD is 12. 1/3 = 4/12, 1/4 = 3/12. 4/12 + 3/12 = 7/12",
      },
      {
        id: "q2",
        question: "What is 5/6 - 1/2?",
        questionType: "multiple_choice",
        options: ["4/6", "1/3", "2/3", "4/4"],
        correctAnswer: "1/3",
        explanation: "1/2 = 3/6. 5/6 - 3/6 = 2/6 = 1/3 (simplified)",
      },
      {
        id: "q3",
        question: "Sarah ate 1/4 of a pizza and Tom ate 2/5. How much did they eat together?",
        questionType: "multiple_choice",
        options: ["3/9", "3/20", "13/20", "5/20"],
        correctAnswer: "13/20",
        explanation: "LCD is 20. 1/4 = 5/20, 2/5 = 8/20. 5/20 + 8/20 = 13/20",
      },
    ]),
  ],

  // Grade 8 - Pythagorean Theorem
  "8-pythagorean": [
    createReadingActivity(
      "8-pyth-intro",
      "The Pythagorean Theorem",
      `# The Pythagorean Theorem

The Pythagorean Theorem is one of the most famous formulas in mathematics!

## The Formula

For any **right triangle**:

**a² + b² = c²**

Where:
- **a** and **b** are the lengths of the two shorter sides (legs)
- **c** is the length of the longest side (hypotenuse)

## What is the Hypotenuse?
The hypotenuse is always:
- The longest side
- Opposite the right angle (90°)

## Example
If a = 3 and b = 4, find c:
- 3² + 4² = c²
- 9 + 16 = c²
- 25 = c²
- c = √25 = 5

So the hypotenuse is **5 units** long!

## Common Pythagorean Triples
- 3, 4, 5
- 5, 12, 13
- 8, 15, 17
- 7, 24, 25`,
      { estimatedMinutes: 6 }
    ),
    createPracticeActivity("8-pyth-practice", "Pythagorean Theorem Practice", [
      {
        id: "p1",
        prompt: "A right triangle has legs of 6 and 8. What is the hypotenuse?",
        inputType: "number",
        correctAnswer: "10",
        hints: [
          "Use a² + b² = c²",
          "6² + 8² = 36 + 64 = 100",
          "c = √100",
        ],
        solution: "6² + 8² = 36 + 64 = 100. c = √100 = 10",
        difficulty: 1,
      },
      {
        id: "p2",
        prompt: "A ladder 13 feet long leans against a wall. The base is 5 feet from the wall. How high up the wall does it reach?",
        inputType: "number",
        correctAnswer: "12",
        hints: [
          "The ladder is the hypotenuse (c = 13)",
          "The distance from wall is one leg (a = 5)",
          "Use a² + b² = c² to find b",
        ],
        solution: "5² + b² = 13². 25 + b² = 169. b² = 144. b = 12 feet",
        difficulty: 2,
      },
      {
        id: "p3",
        prompt: "Is a triangle with sides 9, 12, and 15 a right triangle? (yes/no)",
        inputType: "text",
        correctAnswer: ["yes", "Yes", "YES"],
        hints: [
          "Check if the Pythagorean theorem works",
          "Does 9² + 12² = 15²?",
        ],
        solution: "9² + 12² = 81 + 144 = 225 = 15². Yes, it's a right triangle!",
        difficulty: 2,
      },
    ]),
    createQuizActivity("8-pyth-quiz", "Pythagorean Theorem Quiz", [
      {
        id: "q1",
        question: "In the Pythagorean theorem a² + b² = c², what does c represent?",
        questionType: "multiple_choice",
        options: ["The shortest side", "Any side", "The hypotenuse", "The right angle"],
        correctAnswer: "The hypotenuse",
        explanation: "In the Pythagorean theorem, c always represents the hypotenuse - the longest side, opposite the right angle.",
      },
      {
        id: "q2",
        question: "A right triangle has legs of 5 and 12. What is the hypotenuse?",
        questionType: "fill_blank",
        correctAnswer: "13",
        explanation: "5² + 12² = 25 + 144 = 169. √169 = 13. (5, 12, 13) is a Pythagorean triple!",
      },
      {
        id: "q3",
        question: "Which set of numbers forms a Pythagorean triple?",
        questionType: "multiple_choice",
        options: ["2, 3, 4", "5, 12, 13", "4, 5, 6", "6, 7, 8"],
        correctAnswer: "5, 12, 13",
        explanation: "5² + 12² = 25 + 144 = 169 = 13². The other options don't satisfy a² + b² = c².",
      },
    ]),
  ],

  // Grade 10 - Quadratic Formula
  "10-quadratic-formula": [
    createReadingActivity(
      "10-quad-intro",
      "The Quadratic Formula",
      `# The Quadratic Formula

When factoring doesn't work easily, we can always use the **Quadratic Formula** to solve any quadratic equation!

## The Formula

For any equation in the form **ax² + bx + c = 0**:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Understanding the Parts

- **a** = coefficient of x²
- **b** = coefficient of x
- **c** = constant term
- **±** means we get TWO solutions (usually)

## The Discriminant

The expression **b² - 4ac** is called the **discriminant**:
- If b² - 4ac > 0: Two real solutions
- If b² - 4ac = 0: One real solution
- If b² - 4ac < 0: No real solutions (complex numbers)

## Example

Solve: x² + 5x + 6 = 0

Here: a = 1, b = 5, c = 6

x = (-5 ± √(25-24)) / 2
x = (-5 ± √1) / 2
x = (-5 ± 1) / 2

x = -4/2 = -2  OR  x = -6/2 = -3`,
      { estimatedMinutes: 8 }
    ),
    createPracticeActivity("10-quad-practice", "Quadratic Formula Practice", [
      {
        id: "p1",
        prompt: "For x² - 5x + 6 = 0, what are a, b, and c? (Enter as: a,b,c)",
        inputType: "text",
        correctAnswer: ["1,-5,6", "1, -5, 6"],
        hints: [
          "a is the coefficient of x²",
          "b is the coefficient of x (watch the sign!)",
          "c is the constant",
        ],
        solution: "a = 1, b = -5, c = 6",
        difficulty: 1,
      },
      {
        id: "p2",
        prompt: "Solve x² - 4x - 5 = 0. What are the solutions? (Enter smaller first, separated by comma)",
        inputType: "text",
        correctAnswer: ["-1,5", "-1, 5"],
        hints: [
          "a=1, b=-4, c=-5",
          "Discriminant = 16 + 20 = 36",
          "√36 = 6",
        ],
        solution: "x = (4 ± 6)/2, so x = 5 or x = -1",
        difficulty: 2,
      },
      {
        id: "p3",
        prompt: "For 2x² + 3x - 2 = 0, calculate the discriminant b² - 4ac",
        inputType: "number",
        correctAnswer: "25",
        hints: [
          "a=2, b=3, c=-2",
          "b² = 9",
          "4ac = 4(2)(-2) = -16",
        ],
        solution: "b² - 4ac = 9 - 4(2)(-2) = 9 + 16 = 25",
        difficulty: 2,
      },
    ]),
    createQuizActivity("10-quad-quiz", "Quadratic Formula Quiz", [
      {
        id: "q1",
        question: "What does the discriminant tell us?",
        questionType: "multiple_choice",
        options: [
          "The value of x",
          "The number and type of solutions",
          "The vertex of the parabola",
          "The y-intercept",
        ],
        correctAnswer: "The number and type of solutions",
        explanation: "The discriminant (b² - 4ac) tells us: positive = 2 real solutions, zero = 1 real solution, negative = no real solutions.",
      },
      {
        id: "q2",
        question: "If the discriminant is negative, how many real solutions are there?",
        questionType: "multiple_choice",
        options: ["2", "1", "0", "Infinite"],
        correctAnswer: "0",
        explanation: "A negative discriminant means we'd need to take the square root of a negative number, which gives complex (not real) solutions.",
      },
      {
        id: "q3",
        question: "What are the solutions to x² - 6x + 9 = 0?",
        questionType: "multiple_choice",
        options: ["x = 3 only", "x = -3 only", "x = 3 or x = -3", "No real solutions"],
        correctAnswer: "x = 3 only",
        explanation: "Discriminant = 36 - 36 = 0, so one solution. x = 6/2 = 3. (This factors as (x-3)² = 0)",
      },
    ]),
  ],
};

/**
 * Get activities for a lesson by ID
 */
export function getActivitiesForLesson(lessonId: string): Activity[] {
  return sampleActivities[lessonId] ?? [];
}

/**
 * Check if a lesson has activities
 */
export function lessonHasActivities(lessonId: string): boolean {
  return lessonId in sampleActivities && sampleActivities[lessonId].length > 0;
}
