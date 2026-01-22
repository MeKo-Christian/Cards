/**
 * Card component - renders a single playing card
 */

import type React from "react";
import type { Card as CardType } from "../engine";
import "./Card.css";

interface CardProps {
  card: CardType;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
}

const SUIT_SYMBOLS = ["♠", "♥", "♣", "♦"];
const SUIT_NAMES = ["spade", "heart", "club", "diamond"];
const RANK_SYMBOLS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export function Card({
  card,
  width,
  height,
  className,
  style,
  onPointerDown,
}: CardProps) {
  if (!card.faceUp) {
    return (
      <div
        className={`card card-back${className ? ` ${className}` : ""}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...style,
        }}
        onPointerDown={onPointerDown}
      >
        <div className="card-back-pattern" />
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitName = SUIT_NAMES[card.suit];
  const rankSymbol = RANK_SYMBOLS[card.rank];

  return (
    <div
      className={`card card-front card-${suitName}${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
      onPointerDown={onPointerDown}
    >
      <div className="card-corner card-corner-top">
        <div className="card-rank">{rankSymbol}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
      <div className="card-center">
        <div className="card-suit-large">{suitSymbol}</div>
      </div>
      <div className="card-corner card-corner-bottom">
        <div className="card-rank">{rankSymbol}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  );
}
