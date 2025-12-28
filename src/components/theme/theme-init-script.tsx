/**
 * Theme Initialization Script Component
 *
 * This component renders an inline script that runs before React hydrates
 * to prevent flash of unstyled content (FOUC).
 *
 * The script is a static constant - not user input - so it's safe to render.
 * This is a standard Next.js pattern for theme initialization.
 *
 * @module components/theme/theme-init-script
 */

import Script from "next/script";

/**
 * Theme initialization script content
 * This runs synchronously before React hydrates to set the correct theme
 */
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var mode = localStorage.getItem('kaelyns-academy-theme-mode');
    mode = mode ? JSON.parse(mode) : 'system';

    var resolvedMode = mode;
    if (mode === 'system') {
      resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme-mode', resolvedMode);

    if (resolvedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    var a11y = localStorage.getItem('kaelyns-academy-accessibility');
    if (a11y) {
      a11y = JSON.parse(a11y);
      if (a11y.highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
      }
      if (a11y.reducedMotion === 'reduce') {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
      }
    }
  } catch (e) {}
})();
`;

/**
 * Theme initialization script component
 * Uses Next.js Script with beforeInteractive strategy for early execution
 */
export function ThemeInitScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
    >{THEME_INIT_SCRIPT}</Script>
  );
}
