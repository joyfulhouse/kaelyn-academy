import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock DrizzleAdapter globally to prevent auth initialization issues
vi.mock("@auth/drizzle-adapter", () => ({
  DrizzleAdapter: vi.fn(() => ({})),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: vi.fn().mockImplementation(({ src, alt, ...props }) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    Object.entries(props).forEach(([key, value]) => {
      img.setAttribute(key, String(value));
    });
    return img;
  }),
}));
