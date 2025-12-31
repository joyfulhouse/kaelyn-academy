/**
 * Quiz Answer Validation Tests
 *
 * These tests verify that all quiz answers in the curriculum are mathematically
 * and factually correct. This is critical for an educational platform.
 */
import { describe, it, expect } from "vitest";
import { sampleActivities } from "@/data/curriculum/sample-activities";
import type { QuizActivity, PracticeActivity } from "@/data/curriculum/activities";

// Helper to extract quiz activities
function getQuizActivities(): { lessonId: string; quiz: QuizActivity }[] {
  const quizzes: { lessonId: string; quiz: QuizActivity }[] = [];
  for (const [lessonId, activities] of Object.entries(sampleActivities)) {
    for (const activity of activities) {
      if (activity.type === "quiz") {
        quizzes.push({ lessonId, quiz: activity as QuizActivity });
      }
    }
  }
  return quizzes;
}

// Helper to extract practice activities
function getPracticeActivities(): { lessonId: string; practice: PracticeActivity }[] {
  const practices: { lessonId: string; practice: PracticeActivity }[] = [];
  for (const [lessonId, activities] of Object.entries(sampleActivities)) {
    for (const activity of activities) {
      if (activity.type === "practice") {
        practices.push({ lessonId, practice: activity as PracticeActivity });
      }
    }
  }
  return practices;
}

describe("Quiz Answer Validation", () => {
  describe("Kindergarten - Counting", () => {
    it("should have correct counting answers for k-count-quiz", () => {
      const activities = sampleActivities["k-count-1-10"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: How many apples? 🍎 🍎 🍎 🍎 🍎
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("5"); // 5 apple emojis
      expect(q1?.options).toContain("5");

      // Q2: How many stars? ⭐ ⭐ ⭐
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("3"); // 3 star emojis
      expect(q2?.options).toContain("3");

      // Q3: What comes after 7?
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("8"); // 8 comes after 7
      expect(q3?.options).toContain("8");
    });
  });

  describe("Grade 1 - Addition within 20", () => {
    it("should have correct addition answers for 1-add-quiz", () => {
      const activities = sampleActivities["1-add-within-20"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: 6 + 7 = ?
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("13");
      expect(6 + 7).toBe(13); // Verify math
      expect(q1?.options).toContain("13");

      // Q2: 9 + 9 = ?
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("18");
      expect(9 + 9).toBe(18); // Verify math
      expect(q2?.options).toContain("18");

      // Q3: Which equals 15?
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("8 + 7");
      expect(8 + 7).toBe(15); // Verify the correct answer
      // Verify the other options are NOT 15
      expect(7 + 7).toBe(14); // Not 15
      expect(9 + 5).toBe(14); // Not 15
      expect(6 + 8).toBe(14); // Not 15
    });

    it("should have correct practice problem answers", () => {
      const activities = sampleActivities["1-add-within-20"];
      const practice = activities?.find((a) => a.type === "practice") as PracticeActivity;
      expect(practice).toBeDefined();

      // p1: 5 + 3 = ?
      const p1 = practice.content.problems.find((p) => p.id === "p1");
      expect(p1?.correctAnswer).toBe("8");
      expect(5 + 3).toBe(8);

      // p2: 7 + 4 = ?
      const p2 = practice.content.problems.find((p) => p.id === "p2");
      expect(p2?.correctAnswer).toBe("11");
      expect(7 + 4).toBe(11);

      // p3: 9 + 6 = ?
      const p3 = practice.content.problems.find((p) => p.id === "p3");
      expect(p3?.correctAnswer).toBe("15");
      expect(9 + 6).toBe(15);

      // p4: 8 + 8 = ?
      const p4 = practice.content.problems.find((p) => p.id === "p4");
      expect(p4?.correctAnswer).toBe("16");
      expect(8 + 8).toBe(16);
    });
  });

  describe("Grade 3 - Multiplication", () => {
    it("should have correct multiplication answers for 3-mult-quiz", () => {
      const activities = sampleActivities["3-mult-intro"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: Array question (4 rows x 3 columns = 12)
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("Both are correct");
      expect(4 * 3).toBe(12);
      expect(3 * 4).toBe(12); // Commutative property

      // Q2: 6 × 7 = ?
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("42");
      expect(6 * 7).toBe(42);

      // Q3: 5 bags × 9 marbles = ?
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("45");
      expect(5 * 9).toBe(45);
      expect(q3?.options).toContain("45");
    });

    it("should have correct practice problem answers", () => {
      const activities = sampleActivities["3-mult-intro"];
      const practice = activities?.find((a) => a.type === "practice") as PracticeActivity;
      expect(practice).toBeDefined();

      // p1: 3 × 4 = ?
      const p1 = practice.content.problems.find((p) => p.id === "p1");
      expect(p1?.correctAnswer).toBe("12");
      expect(3 * 4).toBe(12);

      // p2: 5 × 6 = ?
      const p2 = practice.content.problems.find((p) => p.id === "p2");
      expect(p2?.correctAnswer).toBe("30");
      expect(5 * 6).toBe(30);

      // p3: 7 × 8 = ?
      const p3 = practice.content.problems.find((p) => p.id === "p3");
      expect(p3?.correctAnswer).toBe("56");
      expect(7 * 8).toBe(56);
    });
  });

  describe("Grade 5 - Fractions", () => {
    it("should have correct fraction answers for 5-frac-quiz", () => {
      const activities = sampleActivities["5-add-sub-fractions"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: 1/3 + 1/4 = ?
      // LCD = 12, so 4/12 + 3/12 = 7/12
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("7/12");
      expect(1 / 3 + 1 / 4).toBeCloseTo(7 / 12, 10);
      expect(q1?.options).toContain("7/12");

      // Q2: 5/6 - 1/2 = ?
      // 1/2 = 3/6, so 5/6 - 3/6 = 2/6 = 1/3
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("1/3");
      expect(5 / 6 - 1 / 2).toBeCloseTo(1 / 3, 10);
      expect(q2?.options).toContain("1/3");

      // Q3: 1/4 + 2/5 = ?
      // LCD = 20, so 5/20 + 8/20 = 13/20
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("13/20");
      expect(1 / 4 + 2 / 5).toBeCloseTo(13 / 20, 10);
      expect(q3?.options).toContain("13/20");
    });

    it("should have correct practice problem answers", () => {
      const activities = sampleActivities["5-add-sub-fractions"];
      const practice = activities?.find((a) => a.type === "practice") as PracticeActivity;
      expect(practice).toBeDefined();

      // p1: 1/4 + 1/2 = 3/4
      const p1 = practice.content.problems.find((p) => p.id === "p1");
      expect(p1?.correctAnswer).toBe("3/4");
      expect(1 / 4 + 1 / 2).toBeCloseTo(3 / 4, 10);

      // p2: 2/3 + 1/6 = 5/6
      const p2 = practice.content.problems.find((p) => p.id === "p2");
      expect(p2?.correctAnswer).toContain("5/6");
      expect(2 / 3 + 1 / 6).toBeCloseTo(5 / 6, 10);

      // p3: 3/4 - 1/3 = 5/12
      const p3 = practice.content.problems.find((p) => p.id === "p3");
      expect(p3?.correctAnswer).toBe("5/12");
      expect(3 / 4 - 1 / 3).toBeCloseTo(5 / 12, 10);
    });
  });

  describe("Grade 8 - Pythagorean Theorem", () => {
    it("should have correct Pythagorean theorem quiz answers", () => {
      const activities = sampleActivities["8-pythagorean"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: What does c represent?
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("The hypotenuse");

      // Q2: Legs 5 and 12, find hypotenuse
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("13");
      expect(Math.sqrt(5 * 5 + 12 * 12)).toBe(13);

      // Q3: Which is a Pythagorean triple?
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("5, 12, 13");
      // Verify 5, 12, 13 is a Pythagorean triple
      expect(5 * 5 + 12 * 12).toBe(13 * 13);
      // Verify others are NOT
      expect(2 * 2 + 3 * 3).not.toBe(4 * 4);
      expect(4 * 4 + 5 * 5).not.toBe(6 * 6);
      expect(6 * 6 + 7 * 7).not.toBe(8 * 8);
    });

    it("should have correct practice problem answers", () => {
      const activities = sampleActivities["8-pythagorean"];
      const practice = activities?.find((a) => a.type === "practice") as PracticeActivity;
      expect(practice).toBeDefined();

      // p1: Legs 6 and 8, find hypotenuse
      const p1 = practice.content.problems.find((p) => p.id === "p1");
      expect(p1?.correctAnswer).toBe("10");
      expect(Math.sqrt(6 * 6 + 8 * 8)).toBe(10);

      // p2: Ladder 13 ft, base 5 ft from wall, height = ?
      // 5² + h² = 13², h² = 169 - 25 = 144, h = 12
      const p2 = practice.content.problems.find((p) => p.id === "p2");
      expect(p2?.correctAnswer).toBe("12");
      expect(Math.sqrt(13 * 13 - 5 * 5)).toBe(12);

      // p3: Is 9, 12, 15 a right triangle?
      const p3 = practice.content.problems.find((p) => p.id === "p3");
      expect(p3?.correctAnswer).toContain("yes");
      expect(9 * 9 + 12 * 12).toBe(15 * 15); // 81 + 144 = 225
    });
  });

  describe("Grade 10 - Quadratic Formula", () => {
    it("should have correct quadratic formula quiz answers", () => {
      const activities = sampleActivities["10-quadratic-formula"];
      const quiz = activities?.find((a) => a.type === "quiz") as QuizActivity;
      expect(quiz).toBeDefined();

      // Q1: What does discriminant tell us?
      const q1 = quiz.content.questions.find((q) => q.id === "q1");
      expect(q1?.correctAnswer).toBe("The number and type of solutions");

      // Q2: Negative discriminant = how many real solutions?
      const q2 = quiz.content.questions.find((q) => q.id === "q2");
      expect(q2?.correctAnswer).toBe("0");

      // Q3: x² - 6x + 9 = 0 solutions
      // Discriminant = 36 - 36 = 0, one solution x = 3
      const q3 = quiz.content.questions.find((q) => q.id === "q3");
      expect(q3?.correctAnswer).toBe("x = 3 only");
      // Verify: discriminant = b² - 4ac = 36 - 36 = 0
      const discriminant = (-6) * (-6) - 4 * 1 * 9;
      expect(discriminant).toBe(0);
      // x = -b / 2a = 6 / 2 = 3
      expect(6 / 2).toBe(3);
    });

    it("should have correct practice problem answers", () => {
      const activities = sampleActivities["10-quadratic-formula"];
      const practice = activities?.find((a) => a.type === "practice") as PracticeActivity;
      expect(practice).toBeDefined();

      // p1: For x² - 5x + 6 = 0, what are a, b, c?
      const p1 = practice.content.problems.find((p) => p.id === "p1");
      expect(p1?.correctAnswer).toContain("1,-5,6");

      // p2: Solve x² - 4x - 5 = 0
      // a=1, b=-4, c=-5
      // x = (4 ± √(16+20))/2 = (4 ± 6)/2 = 5 or -1
      const p2 = practice.content.problems.find((p) => p.id === "p2");
      expect(p2?.correctAnswer).toContain("-1,5");
      // Verify
      const disc = 16 + 20;
      expect(disc).toBe(36);
      expect((4 + 6) / 2).toBe(5);
      expect((4 - 6) / 2).toBe(-1);

      // p3: For 2x² + 3x - 2 = 0, discriminant = ?
      // b² - 4ac = 9 - 4(2)(-2) = 9 + 16 = 25
      const p3 = practice.content.problems.find((p) => p.id === "p3");
      expect(p3?.correctAnswer).toBe("25");
      expect(9 - 4 * 2 * (-2)).toBe(25);
    });
  });

  describe("All Quiz Questions Structure Validation", () => {
    const allQuizzes = getQuizActivities();

    it("should have at least one quiz activity", () => {
      expect(allQuizzes.length).toBeGreaterThan(0);
    });

    it("all quizzes should have valid question structure", () => {
      for (const { lessonId, quiz } of allQuizzes) {
        expect(quiz.content.questions.length).toBeGreaterThan(0);

        for (const question of quiz.content.questions) {
          expect(question.id).toBeDefined();
          expect(question.question).toBeDefined();
          expect(question.correctAnswer).toBeDefined();
          expect(question.questionType).toMatch(/^(multiple_choice|true_false|fill_blank)$/);

          // Multiple choice questions must have correct answer in options
          if (question.questionType === "multiple_choice") {
            expect(question.options).toBeDefined();
            expect(question.options!.length).toBeGreaterThanOrEqual(2);
            expect(question.options).toContain(question.correctAnswer);
          }
        }
      }
    });
  });

  describe("All Practice Problems Structure Validation", () => {
    const allPractices = getPracticeActivities();

    it("should have at least one practice activity", () => {
      expect(allPractices.length).toBeGreaterThan(0);
    });

    it("all practice problems should have valid structure", () => {
      for (const { lessonId, practice } of allPractices) {
        expect(practice.content.problems.length).toBeGreaterThan(0);

        for (const problem of practice.content.problems) {
          expect(problem.id).toBeDefined();
          expect(problem.prompt).toBeDefined();
          expect(problem.correctAnswer).toBeDefined();
          expect(problem.inputType).toMatch(/^(number|text|expression|selection)$/);
          expect(problem.hints).toBeDefined();
          expect(problem.hints.length).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});
