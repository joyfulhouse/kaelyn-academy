/**
 * Internationalization Configuration
 * Supported locales and default settings
 */

export const locales = ["en", "es", "zh", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  zh: "🇨🇳",
  fr: "🇫🇷",
};

/**
 * Get the direction for a locale
 */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  // Add RTL locales here (e.g., "ar", "he")
  return "ltr";
}
