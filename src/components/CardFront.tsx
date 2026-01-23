/**
 * CardFront component - renders the front of a playing card
 * Uses vector-drawn symbols ported from legacy Card.Drawer.pas
 *
 * Card layouts:
 * - A-10: Traditional pip layouts showing the count of suit symbols
 * - J/Q/K: Face cards with bordered center area and large rank letter
 */

import type React from "react";
import { RankSymbolByIndex } from "./RankSymbol";
import { CardPips } from "./CardPips";
import { FaceCardCenter } from "./FaceCardCenter";
import { SUIT_COLORS } from "./CardDrawers";

interface CardFrontProps {
  rank: number;
  suit: number;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SUIT_NAMES = ["spade", "heart", "club", "diamond"] as const;

export const CardFront = ({
  rank,
  suit,
  width,
  height,
  className,
  style,
  onPointerDown,
  onDoubleClick,
}: CardFrontProps) => {
  const suitName = SUIT_NAMES[suit];
  const suitColor = SUIT_COLORS[suitName];

  // Calculate sizes based on card dimensions
  // Legacy uses SmallFont = width / 36, which with default rank height of 6
  // gives a final size of width / 6
  const cornerRankSize = Math.max(10, width / 6);

  // Face cards (J=10, Q=11, K=12) have different layout
  const isFaceCard = rank >= 10;

  return (
    <div
      className={`card card-front card-${suitName}${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Top-left corner */}
      <div className="card-corner card-corner-top">
        <RankSymbolByIndex
          rankIndex={rank}
          size={cornerRankSize}
          color={suitColor}
          className="card-rank"
        />
      </div>

      {/* Card center content */}
      {isFaceCard ? (
        <FaceCardCenter
          rank={rank}
          suit={suit}
          width={width}
          height={height}
          color={suitColor}
        />
      ) : (
        <CardPips rank={rank} suit={suit} width={width} height={height} />
      )}

      {/* Bottom-right corner (rotated) */}
      <div className="card-corner card-corner-bottom">
        <div className="card-rank-stretch">
          <RankSymbolByIndex
            rankIndex={rank}
            size={cornerRankSize}
            color={suitColor}
            className="card-rank"
            flipped
          />
        </div>
      </div>
    </div>
  );
};
