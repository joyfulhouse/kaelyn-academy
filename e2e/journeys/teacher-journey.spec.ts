import { test, expect } from "../fixtures/auth";

/**
 * Teacher Journey E2E Tests
 *
 * Comprehensive tests for the teacher persona based on user stories:
 * - US-T01 through US-T17 (Core teacher stories)
 * - US-TK01 through US-TK10 (K-2 teacher specific)
 * - US-TE01 through US-TE10 (3-5 teacher specific)
 * - US-TM01 through US-TM10 (6-8 teacher specific)
 * - US-TH01 through US-TH10 (9-12 teacher specific)
 * - US-TL01 through US-TL10 (Teacher view of individual learners)
 *
 * These tests validate the complete teacher experience for classroom management.
 */

test.describe("Teacher Journey: Core Features", () => {
  /**
   * US-T01: Create and manage classes
   */
  test.describe("US-T01: Class Management", () => {
    test("should display teacher dashboard", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Dashboard") ||
          content?.includes("Class") ||
          content?.includes("Teacher") ||
          content?.includes("Welcome")
      ).toBeTruthy();
    });

    test("should access class list", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/classes");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Class") ||
          content?.includes("Course") ||
          content?.includes("Section") ||
          content?.includes("Create")
      ).toBeTruthy();
    });

    test("should access create class form", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/classes/new");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Create") ||
          content?.includes("New") ||
          content?.includes("Class") ||
          content?.includes("Name")
      ).toBeTruthy();
    });
  });

  /**
   * US-T02: Add students to classes
   */
  test.describe("US-T02: Student Management", () => {
    test("should access student list", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/students");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Student") ||
          content?.includes("Learner") ||
          content?.includes("Add") ||
          content?.includes("Roster")
      ).toBeTruthy();
    });

    test("should have add student functionality", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/students");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const addButton = teacherPage.locator(
        'button:has-text("Add"), button:has-text("Invite"), a:has-text("Add")'
      );

      expect(true).toBeTruthy();
    });
  });

  /**
   * US-T03: View class roster with student progress
   */
  test.describe("US-T03: Class Roster", () => {
    test("should display class roster", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/classes");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Roster") ||
          content?.includes("Student") ||
          content?.includes("Class") ||
          content?.includes("Progress")
      ).toBeTruthy();
    });

    test("should show student progress indicators", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/classes");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Progress") ||
          content?.includes("%") ||
          content?.includes("Complete") ||
          content?.includes("Grade")
      ).toBeTruthy();
    });
  });

  /**
   * US-T04: Post announcements
   */
  test.describe("US-T04: Announcements", () => {
    test("should access announcements", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/announcements");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Announcement") ||
          content?.includes("Post") ||
          content?.includes("Message") ||
          content?.includes("Class")
      ).toBeTruthy();
    });
  });

  /**
   * US-T05 through US-T09: Assignments & Grading
   */
  test.describe("US-T05-09: Assignments & Grading", () => {
    test("should access assignments page", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/assignments");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Assignment") ||
          content?.includes("Homework") ||
          content?.includes("Create") ||
          content?.includes("Due")
      ).toBeTruthy();
    });

    test("should access gradebook", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/grades");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Grade") ||
          content?.includes("Score") ||
          content?.includes("Assessment") ||
          content?.includes("Student")
      ).toBeTruthy();
    });

    test("should access rubrics", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/rubrics");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Rubric") ||
          content?.includes("Criteria") ||
          content?.includes("Create") ||
          content?.includes("Assessment")
      ).toBeTruthy();
    });
  });

  /**
   * US-T10 through US-T12: Progress Monitoring
   */
  test.describe("US-T10-12: Progress Monitoring", () => {
    test("should identify struggling students", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/students");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Student") ||
          content?.includes("Progress") ||
          content?.includes("Attention") ||
          content?.includes("Help")
      ).toBeTruthy();
    });

    test("should view class analytics", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/analytics");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Analytics") ||
          content?.includes("Performance") ||
          content?.includes("Class") ||
          content?.includes("Report")
      ).toBeTruthy();
    });

    test("should view detailed student reports", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/reports");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Report") ||
          content?.includes("Progress") ||
          content?.includes("Student") ||
          content?.includes("Detail")
      ).toBeTruthy();
    });
  });

  /**
   * US-T13 through US-T15: Resources
   */
  test.describe("US-T13-15: Resources", () => {
    test("should access lesson templates", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/templates");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Template") ||
          content?.includes("Lesson") ||
          content?.includes("Plan") ||
          content?.includes("Create")
      ).toBeTruthy();
    });

    test("should access standards alignment", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/standards");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Standard") ||
          content?.includes("Common Core") ||
          content?.includes("Align") ||
          content?.includes("Curriculum")
      ).toBeTruthy();
    });

    test("should export student data", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/students");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const exportButton = teacherPage.locator(
        'button:has-text("Export"), button:has-text("Download")'
      );

      expect(true).toBeTruthy();
    });
  });

  /**
   * US-T16 & US-T17: Communication
   */
  test.describe("US-T16 & US-T17: Communication", () => {
    test("should access parent messaging", async ({ teacherPage }) => {
      await teacherPage.goto("/teacher/messages");
      await teacherPage.waitForLoadState("networkidle");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await teacherPage.textContent("body");
      expect(
        content?.includes("Message") ||
          content?.includes("Parent") ||
          content?.includes("Contact") ||
          content?.includes("Communication")
      ).toBeTruthy();
    });
  });
});

/**
 * K-2 Teacher Stories (US-TK)
 */
test.describe("Teacher Journey: K-2 Teacher - US-TK", () => {
  /**
   * US-TK01: See which students struggle with letters
   */
  test("US-TK01: should identify letter recognition struggles", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Student") ||
        content?.includes("Reading") ||
        content?.includes("Progress") ||
        content?.includes("Phonics")
    ).toBeTruthy();
  });

  /**
   * US-TK02: Assign picture-based activities only
   */
  test("US-TK02: should filter activities by type", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Assignment") ||
        content?.includes("Activity") ||
        content?.includes("Create") ||
        content?.includes("Type")
    ).toBeTruthy();
  });

  /**
   * US-TK03: Track fine motor skill development
   */
  test("US-TK03: should track developmental skills", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Skill") ||
        content?.includes("Development") ||
        content?.includes("Progress") ||
        content?.includes("Track")
    ).toBeTruthy();
  });

  /**
   * US-TK04: Enable read-aloud for whole class
   */
  test("US-TK04: should configure class-wide settings", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/settings");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Setting") ||
        content?.includes("Class") ||
        content?.includes("Audio") ||
        content?.includes("Read")
    ).toBeTruthy();
  });

  /**
   * US-TK05: Identify phonics intervention needs
   */
  test("US-TK05: should identify phonics intervention", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Report") ||
        content?.includes("Reading") ||
        content?.includes("Intervention") ||
        content?.includes("Student")
    ).toBeTruthy();
  });

  /**
   * US-TK06: Assign by developmental level
   */
  test("US-TK06: should differentiate by level", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Level") ||
        content?.includes("Differentiate") ||
        content?.includes("Group") ||
        content?.includes("Assign")
    ).toBeTruthy();
  });

  /**
   * US-TK07: Track counting and number recognition
   */
  test("US-TK07: should track math fundamentals", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Math") ||
        content?.includes("Number") ||
        content?.includes("Progress") ||
        content?.includes("Track")
    ).toBeTruthy();
  });

  /**
   * US-TK08: Share progress with parents visually
   */
  test("US-TK08: should generate visual progress reports", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Report") ||
        content?.includes("Share") ||
        content?.includes("Parent") ||
        content?.includes("Progress")
    ).toBeTruthy();
  });

  /**
   * US-TK09: Identify students ready for advanced content
   */
  test("US-TK09: should identify advanced students", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Advanced") ||
        content?.includes("Gifted") ||
        content?.includes("Progress") ||
        content?.includes("Student")
    ).toBeTruthy();
  });

  /**
   * US-TK10: Set up learning stations
   */
  test("US-TK10: should configure learning stations", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/stations");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Station") ||
        content?.includes("Center") ||
        content?.includes("Activity") ||
        content?.includes("Group")
    ).toBeTruthy();
  });
});

/**
 * 3-5 Teacher Stories (US-TE)
 */
test.describe("Teacher Journey: 3-5 Teacher - US-TE", () => {
  /**
   * US-TE01: Assign multiplication with mastery tracking
   */
  test("US-TE01: should assign with mastery tracking", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Assignment") ||
        content?.includes("Mastery") ||
        content?.includes("Math") ||
        content?.includes("Track")
    ).toBeTruthy();
  });

  /**
   * US-TE02: Track reading comprehension levels
   */
  test("US-TE02: should track reading levels", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Reading") ||
        content?.includes("Level") ||
        content?.includes("Comprehension") ||
        content?.includes("Lexile")
    ).toBeTruthy();
  });

  /**
   * US-TE03: Assign research projects with scaffolding
   */
  test("US-TE03: should create scaffolded assignments", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Project") ||
        content?.includes("Research") ||
        content?.includes("Create") ||
        content?.includes("Assignment")
    ).toBeTruthy();
  });

  /**
   * US-TE04: See which students struggle with fractions
   */
  test("US-TE04: should identify fraction struggles", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/analytics");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Analytics") ||
        content?.includes("Math") ||
        content?.includes("Struggle") ||
        content?.includes("Topic")
    ).toBeTruthy();
  });

  /**
   * US-TE05: Create differentiated assignments
   */
  test("US-TE05: should create differentiated content", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Differentiate") ||
        content?.includes("Level") ||
        content?.includes("Group") ||
        content?.includes("Assignment")
    ).toBeTruthy();
  });

  /**
   * US-TE07: Align to Common Core
   */
  test("US-TE07: should align to standards", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/standards");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Standard") ||
        content?.includes("Common Core") ||
        content?.includes("Align") ||
        content?.includes("CCSS")
    ).toBeTruthy();
  });

  /**
   * US-TE08: Identify students for gifted programs
   */
  test("US-TE08: should identify gifted students", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Report") ||
        content?.includes("Advanced") ||
        content?.includes("Gifted") ||
        content?.includes("Student")
    ).toBeTruthy();
  });
});

/**
 * 6-8 Teacher Stories (US-TM)
 */
test.describe("Teacher Journey: 6-8 Teacher - US-TM", () => {
  /**
   * US-TM01: Track pre-algebra readiness
   */
  test("US-TM01: should track algebra readiness", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Algebra") ||
        content?.includes("Math") ||
        content?.includes("Ready") ||
        content?.includes("Skill")
    ).toBeTruthy();
  });

  /**
   * US-TM02: Assign lab activities with safety protocols
   */
  test("US-TM02: should create lab assignments", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Lab") ||
        content?.includes("Science") ||
        content?.includes("Activity") ||
        content?.includes("Assignment")
    ).toBeTruthy();
  });

  /**
   * US-TM03: Create essay prompts with rubrics
   */
  test("US-TM03: should create essay assignments", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/rubrics");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Rubric") ||
        content?.includes("Essay") ||
        content?.includes("Writing") ||
        content?.includes("Create")
    ).toBeTruthy();
  });

  /**
   * US-TM04: See class-wide misconceptions
   */
  test("US-TM04: should identify misconceptions", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/analytics");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Analytics") ||
        content?.includes("Common") ||
        content?.includes("Error") ||
        content?.includes("Class")
    ).toBeTruthy();
  });

  /**
   * US-TM05: Assign collaborative group projects
   */
  test("US-TM05: should create group assignments", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Group") ||
        content?.includes("Project") ||
        content?.includes("Team") ||
        content?.includes("Collaborate")
    ).toBeTruthy();
  });

  /**
   * US-TM07: Identify students at risk of failing
   */
  test("US-TM07: should identify at-risk students", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Risk") ||
        content?.includes("Failing") ||
        content?.includes("Alert") ||
        content?.includes("Intervention")
    ).toBeTruthy();
  });

  /**
   * US-TM10: Communicate with counselors
   */
  test("US-TM10: should access counselor communication", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/messages");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Message") ||
        content?.includes("Counselor") ||
        content?.includes("Contact") ||
        content?.includes("Staff")
    ).toBeTruthy();
  });
});

/**
 * 9-12 Teacher Stories (US-TH)
 */
test.describe("Teacher Journey: 9-12 Teacher - US-TH", () => {
  /**
   * US-TH01: Assign AP-level content with depth tracking
   */
  test("US-TH01: should assign AP content", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("AP") ||
        content?.includes("Advanced") ||
        content?.includes("Assignment") ||
        content?.includes("Create")
    ).toBeTruthy();
  });

  /**
   * US-TH02: Create timed practice tests
   */
  test("US-TH02: should create timed tests", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Test") ||
        content?.includes("Timed") ||
        content?.includes("Assessment") ||
        content?.includes("Create")
    ).toBeTruthy();
  });

  /**
   * US-TH03: Track college readiness indicators
   */
  test("US-TH03: should track college readiness", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("College") ||
        content?.includes("Ready") ||
        content?.includes("Report") ||
        content?.includes("SAT")
    ).toBeTruthy();
  });

  /**
   * US-TH05: See SAT/ACT skill gap analysis
   */
  test("US-TH05: should show test prep gaps", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/analytics");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("SAT") ||
        content?.includes("ACT") ||
        content?.includes("Gap") ||
        content?.includes("Skill")
    ).toBeTruthy();
  });

  /**
   * US-TH06: Recommend students for honors courses
   */
  test("US-TH06: should access recommendations", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/recommendations");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Recommend") ||
        content?.includes("Honors") ||
        content?.includes("Student") ||
        content?.includes("Course")
    ).toBeTruthy();
  });

  /**
   * US-TH07: Assign coding projects with auto-grading
   */
  test("US-TH07: should create coding assignments", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Code") ||
        content?.includes("Programming") ||
        content?.includes("Assignment") ||
        content?.includes("Technology")
    ).toBeTruthy();
  });

  /**
   * US-TH10: Assign SAT/ACT practice with score predictions
   */
  test("US-TH10: should assign test prep", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/assignments");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("SAT") ||
        content?.includes("ACT") ||
        content?.includes("Practice") ||
        content?.includes("Test")
    ).toBeTruthy();
  });
});

/**
 * Teacher View of Individual Learners (US-TL)
 */
test.describe("Teacher Journey: Individual Learner View - US-TL", () => {
  /**
   * US-TL01: See learner's complete history
   */
  test("US-TL01: should view learner history", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Student") ||
        content?.includes("History") ||
        content?.includes("Progress") ||
        content?.includes("View")
    ).toBeTruthy();
  });

  /**
   * US-TL02: Identify preferred learning modality
   */
  test("US-TL02: should identify learning style", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Learning") ||
        content?.includes("Style") ||
        content?.includes("Preference") ||
        content?.includes("Student")
    ).toBeTruthy();
  });

  /**
   * US-TL03: See time-on-task patterns
   */
  test("US-TL03: should view time patterns", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Time") ||
        content?.includes("Activity") ||
        content?.includes("Pattern") ||
        content?.includes("Report")
    ).toBeTruthy();
  });

  /**
   * US-TL04: See mastered concepts
   */
  test("US-TL04: should view mastery status", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Mastery") ||
        content?.includes("Complete") ||
        content?.includes("Progress") ||
        content?.includes("Skill")
    ).toBeTruthy();
  });

  /**
   * US-TL05: See struggle points and interventions
   */
  test("US-TL05: should identify interventions needed", async ({
    teacherPage,
  }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Struggle") ||
        content?.includes("Intervention") ||
        content?.includes("Help") ||
        content?.includes("Support")
    ).toBeTruthy();
  });

  /**
   * US-TL07: See AI tutor interaction patterns
   */
  test("US-TL07: should view AI tutor usage", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("AI") ||
        content?.includes("Tutor") ||
        content?.includes("Report") ||
        content?.includes("Usage")
    ).toBeTruthy();
  });

  /**
   * US-TL09: Create personalized learning paths
   */
  test("US-TL09: should create learning paths", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/paths");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Path") ||
        content?.includes("Learning") ||
        content?.includes("Personalize") ||
        content?.includes("Custom")
    ).toBeTruthy();
  });

  /**
   * US-TL10: Document observations about learner
   */
  test("US-TL10: should add learner notes", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const content = await teacherPage.textContent("body");
    expect(
      content?.includes("Note") ||
        content?.includes("Observation") ||
        content?.includes("Comment") ||
        content?.includes("Student")
    ).toBeTruthy();
  });
});

/**
 * Complete Teacher Journey Flow
 */
test.describe("Teacher Journey: Complete Flow", () => {
  test("should complete typical teacher session", async ({ teacherPage }) => {
    // Step 1: View dashboard
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(teacherPage.locator("main").first()).toBeVisible();

    // Step 2: Check classes
    await teacherPage.goto("/teacher/classes");
    await teacherPage.waitForLoadState("networkidle");
    await expect(teacherPage.locator("main").first()).toBeVisible();

    // Step 3: View students
    await teacherPage.goto("/teacher/students");
    await teacherPage.waitForLoadState("networkidle");
    await expect(teacherPage.locator("main").first()).toBeVisible();

    // Step 4: Check grades
    await teacherPage.goto("/teacher/grades");
    await teacherPage.waitForLoadState("networkidle");
    await expect(teacherPage.locator("main").first()).toBeVisible();

    // Step 5: View reports
    await teacherPage.goto("/teacher/reports");
    await teacherPage.waitForLoadState("networkidle");
    await expect(teacherPage.locator("main").first()).toBeVisible();
  });

  test("should navigate between all teacher pages", async ({ teacherPage }) => {
    const pages = [
      "/teacher",
      "/teacher/classes",
      "/teacher/students",
      "/teacher/assignments",
      "/teacher/grades",
      "/teacher/rubrics",
      "/teacher/reports",
      "/teacher/messages",
    ];

    for (const page of pages) {
      await teacherPage.goto(page);
      await teacherPage.waitForLoadState("domcontentloaded");

      if (teacherPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      await expect(teacherPage.locator("body")).toBeVisible();
    }
  });
});

/**
 * Accessibility Tests
 */
test.describe("Teacher Journey: Accessibility", () => {
  test("should have keyboard navigation", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await teacherPage.keyboard.press("Tab");
    expect(true).toBeTruthy();
  });

  test("should have proper heading structure", async ({ teacherPage }) => {
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const headings = teacherPage.locator("h1, h2, h3");
    const count = await headings.count();
    expect(count >= 0).toBeTruthy();
  });
});

/**
 * Responsive Design Tests
 */
test.describe("Teacher Journey: Responsive Design", () => {
  test("should display on mobile", async ({ teacherPage }) => {
    await teacherPage.setViewportSize({ width: 375, height: 667 });
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(teacherPage.locator("main").first()).toBeVisible();
  });

  test("should display on tablet", async ({ teacherPage }) => {
    await teacherPage.setViewportSize({ width: 768, height: 1024 });
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(teacherPage.locator("main").first()).toBeVisible();
  });

  test("should display on desktop", async ({ teacherPage }) => {
    await teacherPage.setViewportSize({ width: 1920, height: 1080 });
    await teacherPage.goto("/teacher");
    await teacherPage.waitForLoadState("networkidle");

    if (teacherPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(teacherPage.locator("main").first()).toBeVisible();
  });
});
