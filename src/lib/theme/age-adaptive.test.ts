import { describe, it, expect } from "vitest";
import {
  getAgeGroup,
  getThemeForGrade,
  getAllThemes,
  getThemeCSSVariables,
} from "./age-adaptive";

describe("Age-Adaptive Theming", () => {
  describe("getAgeGroup", () => {
    it("should return early-elementary for K-2", () => {
      expect(getAgeGroup(0)).toBe("early-elementary");
      expect(getAgeGroup(1)).toBe("early-elementary");
      expect(getAgeGroup(2)).toBe("early-elementary");
    });

    it("should return late-elementary for 3-5", () => {
      expect(getAgeGroup(3)).toBe("late-elementary");
      expect(getAgeGroup(4)).toBe("late-elementary");
      expect(getAgeGroup(5)).toBe("late-elementary");
    });

    it("should return middle-school for 6-8", () => {
      expect(getAgeGroup(6)).toBe("middle-school");
      expect(getAgeGroup(7)).toBe("middle-school");
      expect(getAgeGroup(8)).toBe("middle-school");
    });

    it("should return high-school for 9-12", () => {
      expect(getAgeGroup(9)).toBe("high-school");
      expect(getAgeGroup(10)).toBe("high-school");
      expect(getAgeGroup(11)).toBe("high-school");
      expect(getAgeGroup(12)).toBe("high-school");
    });
  });

  describe("getThemeForGrade", () => {
    it("should return playful theme for kindergarten", () => {
      const theme = getThemeForGrade(0);
      expect(theme.name).toBe("Playful Explorer");
      expect(theme.elements.showMascot).toBe(true);
      expect(theme.animations.bouncy).toBe(true);
      expect(theme.elements.buttonSize).toBe("lg");
    });

    it("should return professional theme for high school", () => {
      const theme = getThemeForGrade(11);
      expect(theme.name).toBe("Professional");
      expect(theme.elements.showMascot).toBe(false);
      expect(theme.animations.bouncy).toBe(false);
      expect(theme.elements.buttonSize).toBe("sm");
    });

    it("should have appropriate font sizes for age groups", () => {
      const earlyTheme = getThemeForGrade(1);
      const highTheme = getThemeForGrade(10);

      expect(parseInt(earlyTheme.typography.baseFontSize)).toBeGreaterThan(
        parseInt(highTheme.typography.baseFontSize)
      );
    });

    it("should have larger icon sizes for younger learners", () => {
      const earlyTheme = getThemeForGrade(1);
      const highTheme = getThemeForGrade(10);

      expect(earlyTheme.elements.iconSize).toBeGreaterThan(highTheme.elements.iconSize);
    });
  });

  describe("getAllThemes", () => {
    it("should return 4 themes", () => {
      const themes = getAllThemes();
      expect(themes.length).toBe(4);
    });

    it("should have unique group names", () => {
      const themes = getAllThemes();
      const groups = themes.map((t) => t.group);
      expect(new Set(groups).size).toBe(4);
    });
  });

  describe("getThemeCSSVariables", () => {
    it("should return all required CSS variables", () => {
      const theme = getThemeForGrade(5);
      const variables = getThemeCSSVariables(theme);

      // Check shadcn semantic colors
      expect(variables["--primary"]).toBeDefined();
      expect(variables["--background"]).toBeDefined();
      expect(variables["--foreground"]).toBeDefined();
      expect(variables["--radius"]).toBeDefined();
    });

    it("should include correct color values", () => {
      const theme = getThemeForGrade(0);
      const variables = getThemeCSSVariables(theme);

      expect(variables["--primary"]).toBe(theme.colors.primary);
      expect(variables["--background"]).toBe(theme.colors.background);
    });

    it("should include chart colors", () => {
      const theme = getThemeForGrade(5);
      const variables = getThemeCSSVariables(theme);

      expect(variables["--chart-1"]).toBeDefined();
      expect(variables["--chart-2"]).toBeDefined();
      expect(variables["--chart-3"]).toBeDefined();
      expect(variables["--chart-4"]).toBeDefined();
      expect(variables["--chart-5"]).toBeDefined();
    });

    it("should include sidebar colors", () => {
      const theme = getThemeForGrade(5);
      const variables = getThemeCSSVariables(theme);

      expect(variables["--sidebar"]).toBeDefined();
      expect(variables["--sidebar-foreground"]).toBeDefined();
      expect(variables["--sidebar-primary"]).toBeDefined();
    });
  });
});
