/**
 * SuitSymbol component - renders a suit symbol using vector paths
 * Ported from legacy Card.Drawer.pas
 */

import { SUIT_PATHS, SUIT_COLORS, type SuitName } from "./CardDrawers";

interface SuitSymbolProps {
  suit: SuitName;
  size: number;
  color?: string;
  fit?: boolean;
  className?: string;
  flipped?: boolean;
}

const SUIT_ORDER: SuitName[] = ["spade", "heart", "club", "diamond"];

export const SuitSymbol = ({
  suit,
  size,
  color: overrideColor,
  fit,
  className,
  flipped,
}: SuitSymbolProps) => {
  const { width, height, path } = SUIT_PATHS[suit];
  const color = overrideColor ?? SUIT_COLORS[suit];

  // Scale to fit the requested size while maintaining aspect ratio
  const scale = size / Math.max(width, height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <svg
      width={fit ? "100%" : scaledWidth}
      height={fit ? "100%" : scaledHeight}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={flipped ? { transform: "rotate(180deg)", overflow: "visible" } : { overflow: "visible" }}
    >
      <path d={path} fill={color} />
    </svg>
  );
};

interface SuitSymbolByIndexProps {
  suitIndex: number;
  size: number;
  color?: string;
  fit?: boolean;
  className?: string;
  flipped?: boolean;
}

export const SuitSymbolByIndex = ({
  suitIndex,
  size,
  color,
  fit,
  className,
  flipped,
}: SuitSymbolByIndexProps) => {
  const suit = SUIT_ORDER[suitIndex];
  return (
    <SuitSymbol
      suit={suit}
      size={size}
      color={color}
      fit={fit}
      className={className}
      flipped={flipped}
    />
  );
};
