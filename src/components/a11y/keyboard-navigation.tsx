"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keyboard Navigation Utilities
 * WCAG 2.1 Success Criterion 2.1.1: Keyboard
 * WCAG 2.1 Success Criterion 2.1.2: No Keyboard Trap
 */

/**
 * Arrow key navigation for lists and menus
 */
interface UseArrowNavigationOptions {
  /** Whether navigation is active */
  enabled?: boolean;
  /** Orientation of the list */
  orientation?: "horizontal" | "vertical" | "both";
  /** Whether to loop at boundaries */
  loop?: boolean;
  /** Callback when item is selected (Enter key) */
  onSelect?: (index: number) => void;
  /** Callback when navigation occurs */
  onNavigate?: (index: number) => void;
}

export function useArrowNavigation(
  itemCount: number,
  options: UseArrowNavigationOptions = {}
) {
  const {
    enabled = true,
    orientation = "vertical",
    loop = true,
    onSelect,
    onNavigate,
  } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number, element: HTMLElement | null) => {
    itemRefs.current[index] = element;
  }, []);

  const focusItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      item.focus();
    }
  }, []);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      setActiveIndex((current) => {
        let newIndex: number;
        if (direction === "next") {
          newIndex = current + 1;
          if (newIndex >= itemCount) {
            newIndex = loop ? 0 : itemCount - 1;
          }
        } else {
          newIndex = current - 1;
          if (newIndex < 0) {
            newIndex = loop ? itemCount - 1 : 0;
          }
        }
        onNavigate?.(newIndex);
        return newIndex;
      });
    },
    [itemCount, loop, onNavigate]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      const isHorizontal = orientation === "horizontal" || orientation === "both";
      const isVertical = orientation === "vertical" || orientation === "both";

      switch (event.key) {
        case "ArrowDown":
          if (isVertical) {
            event.preventDefault();
            navigate("next");
          }
          break;
        case "ArrowUp":
          if (isVertical) {
            event.preventDefault();
            navigate("prev");
          }
          break;
        case "ArrowRight":
          if (isHorizontal) {
            event.preventDefault();
            navigate("next");
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            event.preventDefault();
            navigate("prev");
          }
          break;
        case "Home":
          event.preventDefault();
          setActiveIndex(0);
          onNavigate?.(0);
          break;
        case "End":
          event.preventDefault();
          const lastIndex = itemCount - 1;
          setActiveIndex(lastIndex);
          onNavigate?.(lastIndex);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect?.(activeIndex);
          break;
      }
    },
    [enabled, orientation, navigate, activeIndex, itemCount, onSelect, onNavigate]
  );

  // Focus the active item when it changes
  useEffect(() => {
    focusItem(activeIndex);
  }, [activeIndex, focusItem]);

  return {
    activeIndex,
    setActiveIndex,
    setItemRef,
    handleKeyDown,
    getItemProps: (index: number) => ({
      ref: (el: HTMLElement | null) => setItemRef(index, el),
      tabIndex: index === activeIndex ? 0 : -1,
      "aria-selected": index === activeIndex,
    }),
  };
}

/**
 * Roving tabindex for composite widgets
 * Implements the roving tabindex pattern for accessible keyboard navigation
 */
interface UseRovingTabIndexOptions {
  /** Whether the component is horizontal */
  horizontal?: boolean;
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void;
}

export function useRovingTabIndex<T extends HTMLElement>(
  itemCount: number,
  options: UseRovingTabIndexOptions = {}
) {
  const { horizontal = false, onFocusChange } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef<Map<number, T>>(new Map());

  const registerItem = useCallback((index: number, element: T | null) => {
    if (element) {
      itemsRef.current.set(index, element);
    } else {
      itemsRef.current.delete(index);
    }
  }, []);

  const focusItem = useCallback((index: number) => {
    const item = itemsRef.current.get(index);
    if (item) {
      item.focus();
      setFocusedIndex(index);
      onFocusChange?.(index);
    }
  }, [onFocusChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          focusItem(Math.min(focusedIndex + 1, itemCount - 1));
          break;
        case prevKey:
          event.preventDefault();
          focusItem(Math.max(focusedIndex - 1, 0));
          break;
        case "Home":
          event.preventDefault();
          focusItem(0);
          break;
        case "End":
          event.preventDefault();
          focusItem(itemCount - 1);
          break;
      }
    },
    [horizontal, focusedIndex, itemCount, focusItem]
  );

  return {
    focusedIndex,
    registerItem,
    focusItem,
    handleKeyDown,
    getTabIndex: (index: number) => (index === focusedIndex ? 0 : -1),
  };
}

/**
 * Escape key handler for dismissible components
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, enabled]);
}

/**
 * Focus visible detection
 * Helps distinguish between mouse and keyboard focus
 */
export function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false);
  const hadKeyboardEvent = useRef(true);

  useEffect(() => {
    const handleKeyDown = () => {
      hadKeyboardEvent.current = true;
    };

    const handleMouseDown = () => {
      hadKeyboardEvent.current = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleFocus = useCallback(() => {
    if (hadKeyboardEvent.current) {
      setFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setFocusVisible(false);
  }, []);

  return {
    focusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
