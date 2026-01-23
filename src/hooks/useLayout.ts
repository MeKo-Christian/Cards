/**
 * Layout calculations for responsive card sizing
 */

import { useState, useEffect } from "react";
import type { Pile } from "../engine";

export interface LayoutDimensions {
  cardWidth: number;
  cardHeight: number;
  tableauOverlap: number;
  foundationSpacing: number;
  tableauSpacing: number;
  tableauTopOffset: number;
}

// Original game scaling constants
// Cards use 4:3 aspect ratio and viewport is constrained to 4:3 maximum

export function useLayout(): LayoutDimensions {
  const [dimensions, setDimensions] = useState<LayoutDimensions>(() =>
    calculateDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      const next = calculateDimensions();
      setDimensions((prev) => (areDimensionsEqual(prev, next) ? prev : next));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}

function areDimensionsEqual(a: LayoutDimensions, b: LayoutDimensions): boolean {
  return (
    a.cardWidth === b.cardWidth &&
    a.cardHeight === b.cardHeight &&
    a.tableauOverlap === b.tableauOverlap &&
    a.foundationSpacing === b.foundationSpacing &&
    a.tableauSpacing === b.tableauSpacing &&
    a.tableauTopOffset === b.tableauTopOffset
  );
}

function calculateDimensions(): LayoutDimensions {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Original game logic: constrain viewport to 4:3 aspect ratio max
  // This prevents cards from becoming too small on wide screens
  const constrainedWidth = Math.min(viewportWidth, (4 * viewportHeight) / 3);

  // Card width is 1/9th of constrained viewport width
  // This allows 8 piles + spacing to fit comfortably
  const cardWidth = constrainedWidth / 9;

  // Card height maintains 4:3 ratio (same as original: 4*width/3)
  const cardHeight = (4 * cardWidth) / 3;

  // Pile stacking offset: max of height/5.1 or viewport/32 (from original)
  const tableauOverlap = Math.max(cardHeight / 5.1, viewportHeight / 32);

  // Foundation spacing: wider gaps to match legacy feel
  const foundationSpacing = cardWidth * 0.26;

  // Tableau spacing: tighter than foundations
  const tableauSpacing = cardWidth * 0.1;

  // Calculate tableau top offset (where tableau piles start)
  // This matches the legacy positioning: foundations + margin
  const tableauTopOffset = Math.max(
    cardHeight + 20, // Card height + some margin
    0.12 * viewportHeight + cardHeight
  );

  return {
    cardWidth,
    cardHeight,
    tableauOverlap,
    foundationSpacing,
    tableauSpacing,
    tableauTopOffset,
  };
}

/**
 * Calculate dynamic overlap distance for a specific pile to ensure all cards fit in viewport
 * This implements the legacy algorithm that reduces spacing when cards would overflow
 */
export function calculatePileOverlap(
  pile: Pile,
  baseOverlap: number,
  tableauTopOffset: number,
  cardHeight: number,
  viewportHeight: number
): number {
  if (pile.length === 0) {
    return baseOverlap;
  }

  // Find first face-up card index
  let firstFaceUpIndex = -1;
  for (let i = 0; i < pile.length; i++) {
    if (pile[i].faceUp) {
      firstFaceUpIndex = i;
      break;
    }
  }

  // If no face-up cards, use base overlap
  if (firstFaceUpIndex === -1) {
    return baseOverlap;
  }

  // Calculate position of first face-up card
  const faceDownCount = firstFaceUpIndex;
  const faceDownSpacing = baseOverlap * 0.5; // Face-down cards use half spacing
  const firstFaceUpTop =
    tableauTopOffset + faceDownCount * faceDownSpacing + cardHeight;

  // Calculate remaining viewport height from first face-up card
  const remainingHeight = viewportHeight - firstFaceUpTop;

  // Count remaining cards (including the first face-up one)
  const remainingCards = pile.length - firstFaceUpIndex;

  // Calculate minimum spacing needed to fit all remaining cards
  // Add a small buffer to prevent cutting off the last card
  const minSpacingNeeded = remainingHeight / remainingCards;

  // Return the minimum of base overlap and calculated spacing
  // This ensures cards fit without going off screen
  return Math.min(baseOverlap, minSpacingNeeded);
}
