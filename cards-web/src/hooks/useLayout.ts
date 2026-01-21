/**
 * Layout calculations for responsive card sizing
 */

import { useState, useEffect } from "react";

export interface LayoutDimensions {
  cardWidth: number;
  cardHeight: number;
  tableauOverlap: number;
  foundationSpacing: number;
}

const CARD_ASPECT_RATIO = 0.7; // width / height
const MIN_CARD_WIDTH = 60;
const MAX_CARD_WIDTH = 120;

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
    a.foundationSpacing === b.foundationSpacing
  );
}

function calculateDimensions(): LayoutDimensions {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Reserve space for top bar and margins
  const topBarHeight = 80;
  const foundationsHeight = 160;
  const margins = 40;
  const availableWidth = viewportWidth - margins;
  const availableHeight =
    viewportHeight - topBarHeight - foundationsHeight - margins;

  // Calculate card width based on fitting 8 tableau piles with spacing
  const tableauSpacing = 8;
  const maxCardWidthFromTableau = (availableWidth - tableauSpacing * 7) / 8;

  // Calculate card width based on available height
  // Assume maximum 20 overlapping cards in a pile
  const maxOverlappingCards = 20;
  const overlapFactor = 0.25; // Each card overlaps by 25% of height
  const maxCardHeightFromTableau =
    availableHeight / (1 + maxOverlappingCards * overlapFactor);
  const maxCardWidthFromHeight = maxCardHeightFromTableau * CARD_ASPECT_RATIO;

  // Choose the smaller constraint and clamp to min/max
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    Math.min(MAX_CARD_WIDTH, maxCardWidthFromTableau, maxCardWidthFromHeight)
  );

  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const tableauOverlap = cardHeight * overlapFactor;
  const foundationSpacing = tableauSpacing;

  return {
    cardWidth,
    cardHeight,
    tableauOverlap,
    foundationSpacing,
  };
}
