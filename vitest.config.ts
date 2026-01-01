import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/*.e2e.{ts,tsx}",
      // Temporarily exclude due to DrizzleAdapter initialization during import
      "**/subjects.test.ts",
    ],
    // Isolate test files to prevent mock pollution
    isolate: true,
    // Clear mocks between tests
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        // Exclude Drizzle schema files - they're declarative table/type definitions
        "src/lib/db/schema/**",
        // Exclude MCP server - it's integration code tested via E2E
        "src/mcp/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
