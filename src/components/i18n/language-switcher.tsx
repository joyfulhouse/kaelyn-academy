"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "buttons" | "compact";
}

export function LanguageSwitcher({
  className,
  variant = "dropdown",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Set cookie for locale preference
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
      // Reload to apply the new locale
      window.location.reload();
    });
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isPending || loc === locale}
            className={cn(
              "text-lg hover:opacity-80 transition-opacity disabled:opacity-100",
              loc === locale && "ring-2 ring-primary ring-offset-2 rounded",
              isPending && "opacity-50 cursor-wait"
            )}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-current={loc === locale ? "true" : undefined}
          >
            {localeFlags[loc]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "buttons") {
    return (
      <div
        className={cn("flex flex-wrap gap-2", className)}
        role="radiogroup"
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isPending}
            role="radio"
            aria-checked={loc === locale}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border transition-colors",
              loc === locale
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-input",
              isPending && "opacity-50 cursor-wait"
            )}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn("relative", className)}>
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        disabled={isPending}
        className={cn(
          "appearance-none px-3 py-2 pr-8 text-sm rounded-md border border-input",
          "bg-background focus:outline-none focus:ring-2 focus:ring-ring",
          isPending && "opacity-50 cursor-wait"
        )}
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeFlags[loc]} {localeNames[loc]}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
