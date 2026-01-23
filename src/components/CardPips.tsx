/**
 * CardPips component - renders pip layouts for number cards (A-10)
 * Ported from legacy Card.Cards.pas Paint method
 *
 * The legacy code uses a coordinate system where:
 * - w = 0.8 * card width (the pip area width)
 * - h = 0.6 * card height (the pip area height)
 * - Pips are positioned within this area
 */

import { PipAreaContainer, PipSymbol } from "./CardPipsElements";

interface CardPipsProps {
  rank: number; // 0=A, 1=2, ..., 9=10
  suit: number;
  width: number; // Card width
  height: number; // Card height
}

interface PipPosition {
  x: number; // 0-1 relative to pip area width
  y: number; // 0-1 relative to pip area height
  flipped?: boolean;
}

// Pip layouts ported from legacy Card.Cards.pas
// Each layout defines positions as fractions of the pip area (w, h)
const PIP_LAYOUTS: Record<number, PipPosition[]> = {
  // Ace - single large centered pip (handled specially)
  0: [{ x: 0.5, y: 0.5 }],

  // 2 - top and bottom center
  1: [
    { x: 0.5, y: 0 },
    { x: 0.5, y: 1, flipped: true },
  ],

  // 3 - top, middle, bottom center
  2: [
    { x: 0.5, y: 0 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 1, flipped: true },
  ],

  // 4 - corners
  3: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
  ],

  // 5 - corners + center
  4: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.5, y: 0.5 },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
  ],

  // 6 - 2 columns of 3
  5: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
  ],

  // 7 - 6 layout + center top
  6: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
    { x: 0.5, y: 0.25 },
  ],

  // 8 - 6 layout + center top and center bottom
  7: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
    { x: 0.5, y: 0.25 },
    { x: 0.5, y: 0.75, flipped: true },
  ],

  // 9 - 4 rows of 2 on sides + center
  8: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 1 / 3 },
    { x: 0.75, y: 1 / 3 },
    { x: 0.25, y: 2 / 3, flipped: true },
    { x: 0.75, y: 2 / 3, flipped: true },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
    { x: 0.5, y: 1 / 6 },
  ],

  // 10 - 4 rows of 2 on sides + 2 center
  9: [
    { x: 0.25, y: 0 },
    { x: 0.75, y: 0 },
    { x: 0.25, y: 1 / 3 },
    { x: 0.75, y: 1 / 3 },
    { x: 0.25, y: 2 / 3, flipped: true },
    { x: 0.75, y: 2 / 3, flipped: true },
    { x: 0.25, y: 1, flipped: true },
    { x: 0.75, y: 1, flipped: true },
    { x: 0.5, y: 1 / 6 },
    { x: 0.5, y: 5 / 6, flipped: true },
  ],
};

export const CardPips = ({ rank, suit, width, height }: CardPipsProps) => {
  // Calculate pip area dimensions (matches legacy: w = 0.8 * width, h = 0.6 * height)
  const pipAreaWidth = width * 0.8;
  const pipAreaHeight = height * 0.6;
  const pipAreaLeft = width * 0.1;
  const pipAreaTop = height * 0.2;

  // Calculate pip size based on card size
  // Ace gets a large pip, others get small pips
  const isAce = rank === 0;
  const pipSize = isAce
    ? Math.min(pipAreaWidth, pipAreaHeight) * 0.5
    : Math.min(pipAreaWidth, pipAreaHeight) * 0.25;

  const layout = PIP_LAYOUTS[rank];
  if (!layout) return null;

  return (
    <PipAreaContainer
      pipAreaLeft={pipAreaLeft}
      pipAreaTop={pipAreaTop}
      pipAreaWidth={pipAreaWidth}
      pipAreaHeight={pipAreaHeight}
    >
      {layout.map((pip, index) => (
        <PipSymbol
          key={index}
          x={pip.x * pipAreaWidth}
          y={pip.y * pipAreaHeight}
          suit={suit}
          pipSize={pipSize}
          flipped={pip.flipped}
        />
      ))}
    </PipAreaContainer>
  );
};
