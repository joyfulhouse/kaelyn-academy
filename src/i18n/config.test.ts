import { describe, it, expect } from "vitest";
import {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  getDirection,
  type Locale,
} from "./config";

describe("i18n Configuration", () => {
  describe("locales", () => {
    it("should include all required locales", () => {
      expect(locales).toContain("en");
      expect(locales).toContain("es");
      expect(locales).toContain("zh");
      expect(locales).toContain("fr");
    });

    it("should have 4 supported locales", () => {
      expect(locales.length).toBe(4);
    });
  });

  describe("defaultLocale", () => {
    it("should be English", () => {
      expect(defaultLocale).toBe("en");
    });

    it("should be included in locales", () => {
      expect(locales).toContain(defaultLocale);
    });
  });

  describe("localeNames", () => {
    it("should have a name for each locale", () => {
      locales.forEach((locale) => {
        expect(localeNames[locale]).toBeDefined();
        expect(typeof localeNames[locale]).toBe("string");
        expect(localeNames[locale].length).toBeGreaterThan(0);
      });
    });

    it("should have correct language names", () => {
      expect(localeNames.en).toBe("English");
      expect(localeNames.es).toBe("Español");
      expect(localeNames.zh).toBe("中文");
      expect(localeNames.fr).toBe("Français");
    });
  });

  describe("localeFlags", () => {
    it("should have a flag for each locale", () => {
      locales.forEach((locale) => {
        expect(localeFlags[locale]).toBeDefined();
        expect(typeof localeFlags[locale]).toBe("string");
      });
    });

    it("should have emoji flags", () => {
      expect(localeFlags.en).toBe("🇺🇸");
      expect(localeFlags.es).toBe("🇪🇸");
      expect(localeFlags.zh).toBe("🇨🇳");
      expect(localeFlags.fr).toBe("🇫🇷");
    });
  });

  describe("getDirection", () => {
    it("should return ltr for all current locales", () => {
      locales.forEach((locale) => {
        expect(getDirection(locale)).toBe("ltr");
      });
    });

    it("should return ltr for English", () => {
      expect(getDirection("en")).toBe("ltr");
    });

    it("should return ltr for Chinese", () => {
      expect(getDirection("zh")).toBe("ltr");
    });
  });
});
