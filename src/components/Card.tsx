/**
 * Card component - renders a single playing card (front or back)
 */

import type React from "react";
import type { Card as CardType } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

interface CardProps {
  card: CardType;
  width: number;
  height: number;
  cardBackStyle?: CardBackStyle;
  highlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card = ({
  card,
  width,
  height,
  cardBackStyle = "ornament",
  highlight,
  className,
  style,
  onPointerDown,
  onDoubleClick,
}: CardProps) => {
  // Apply white gradient when highlighted
  const highlightStyle = highlight
    ? { background: "linear-gradient(150deg, #ffffff 0%, #ffffff 100%)" }
    : undefined;

  if (!card.faceUp) {
    return (
      <CardBack
        width={width}
        height={height}
        cardBackStyle={cardBackStyle}
        className={className}
        style={{ ...style, ...highlightStyle }}
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
      />
    );
  }

  return (
    <CardFront
      rank={card.rank}
      suit={card.suit}
      width={width}
      height={height}
      className={className}
      style={{ ...style, ...highlightStyle }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    />
  );
};
