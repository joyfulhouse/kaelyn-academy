/**
 * Theme Initialization Script Component
 *
 * This component provides theme initialization script content that runs
 * before React hydrates to prevent flash of unstyled content (FOUC).
 *
 * The script is a static constant - not user input - so it's safe to render.
 * For App Router, the script content should be added directly to the root
 * layout using a raw script tag.
 *
 * @module components/theme/theme-init-script
 */

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
 *
 * Note: In Next.js App Router, beforeInteractive is only available in pages/_document.js.
 * For App Router, this script should be placed in the root layout's head or body
 * using a raw script tag. The Script component with afterInteractive will run
 * after hydration which may cause a brief FOUC. For optimal FOUC prevention,
 * add this script content directly to the html element in RootLayout.
 */
export function ThemeInitScript() {
  // Return null - the theme init script should be added directly to RootLayout
  // as a raw script tag for proper FOUC prevention in App Router
  return null;
}

/**
 * Export the script content for use in RootLayout
 * This can be used with a raw script tag in the layout
 */
export const themeInitScriptContent = THEME_INIT_SCRIPT;
