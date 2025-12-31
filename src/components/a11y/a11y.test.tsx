/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkipLink, SkipLinks } from "./skip-link";
import { LiveRegion, LiveRegionProvider, useLiveAnnouncer } from "./live-region";
import { VisuallyHidden, SrOnly, A11yText } from "./visually-hidden";

describe("Accessibility Components", () => {
  describe("SkipLink", () => {
    it("renders with default props", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link", { name: /skip to main content/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "#main-content");
    });

    it("renders with custom href and children", () => {
      render(<SkipLink href="#navigation">Skip to nav</SkipLink>);
      const link = screen.getByRole("link", { name: /skip to nav/i });
      expect(link).toHaveAttribute("href", "#navigation");
    });

    it("has sr-only class by default", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("sr-only");
    });
  });

  describe("SkipLinks", () => {
    it("renders multiple skip links", () => {
      const links = [
        { href: "#main", label: "Skip to main" },
        { href: "#nav", label: "Skip to navigation" },
      ];
      render(<SkipLinks links={links} />);

      expect(screen.getByRole("link", { name: /skip to main/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /skip to navigation/i })).toBeInTheDocument();
    });

    it("has navigation role with aria-label", () => {
      const links = [{ href: "#main", label: "Skip to main" }];
      render(<SkipLinks links={links} />);

      expect(screen.getByRole("navigation", { name: /skip links/i })).toBeInTheDocument();
    });
  });

  describe("LiveRegion", () => {
    it("renders with polite aria-live by default", () => {
      render(<LiveRegion message="Test message" />);
      const region = screen.getByRole("status");
      expect(region).toHaveAttribute("aria-live", "polite");
      expect(region).toHaveTextContent("Test message");
    });

    it("renders with assertive aria-live when specified", () => {
      render(<LiveRegion message="Urgent message" politeness="assertive" />);
      const region = screen.getByRole("alert");
      expect(region).toHaveAttribute("aria-live", "assertive");
    });

    it("has sr-only class for visual hiding", () => {
      render(<LiveRegion message="Hidden message" />);
      const region = screen.getByRole("status");
      expect(region).toHaveClass("sr-only");
    });
  });

  describe("LiveRegionProvider", () => {
    function TestComponent() {
      const { announcePolite, announceAssertive } = useLiveAnnouncer();
      return (
        <div>
          <button onClick={() => announcePolite("Polite message")}>Announce Polite</button>
          <button onClick={() => announceAssertive("Assertive message")}>Announce Assertive</button>
        </div>
      );
    }

    it("provides announce functions via context", () => {
      render(
        <LiveRegionProvider>
          <TestComponent />
        </LiveRegionProvider>
      );

      expect(screen.getByRole("button", { name: /announce polite/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /announce assertive/i })).toBeInTheDocument();
    });

    it("renders live regions for announcements", () => {
      render(
        <LiveRegionProvider>
          <TestComponent />
        </LiveRegionProvider>
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("VisuallyHidden", () => {
    it("renders children", () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>);
      expect(screen.getByText("Hidden text")).toBeInTheDocument();
    });

    it("applies visually hidden styles", () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>);
      const element = screen.getByText("Hidden text");
      expect(element).toHaveClass("absolute", "w-px", "h-px", "overflow-hidden");
    });

    it("renders as span by default", () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>);
      const element = screen.getByText("Hidden text");
      expect(element.tagName).toBe("SPAN");
    });

    it("renders as custom element when specified", () => {
      render(<VisuallyHidden as="div">Hidden text</VisuallyHidden>);
      const element = screen.getByText("Hidden text");
      expect(element.tagName).toBe("DIV");
    });
  });

  describe("SrOnly", () => {
    it("renders with sr-only class", () => {
      render(<SrOnly>Screen reader only</SrOnly>);
      const element = screen.getByText("Screen reader only");
      expect(element).toHaveClass("sr-only");
    });
  });

  describe("A11yText", () => {
    it("renders children normally", () => {
      render(<A11yText>Normal text</A11yText>);
      expect(screen.getByText("Normal text")).toBeInTheDocument();
    });

    it("renders sr-only label when srLabel is provided", () => {
      render(<A11yText srLabel="Accessible label">Visual text</A11yText>);

      const visual = screen.getByText("Visual text");
      expect(visual).toHaveAttribute("aria-hidden", "true");

      const srText = screen.getByText("Accessible label");
      expect(srText).toHaveClass("sr-only");
    });

    it("renders prefix for screen readers", () => {
      render(<A11yText srPrefix="Price:">$99</A11yText>);

      expect(screen.getByText("Price:")).toHaveClass("sr-only");
      expect(screen.getByText("$99")).toBeInTheDocument();
    });

    it("renders suffix for screen readers", () => {
      render(<A11yText srSuffix="dollars">99</A11yText>);

      expect(screen.getByText("99")).toBeInTheDocument();
      expect(screen.getByText("dollars")).toHaveClass("sr-only");
    });
  });
});
