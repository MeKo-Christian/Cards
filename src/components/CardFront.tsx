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
      className={`card card-front card-${suitName} relative rounded-[0.3em] shadow-[1px_1px_4px_rgba(0,0,0,0.5)] select-none cursor-pointer touch-none text-black flex flex-col justify-between box-border${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        padding: '7px',
        background: 'linear-gradient(150deg, #e1e1e1 0%, #fcfcfc 100%)',
        ...style,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Top-left corner */}
      <div className="card-corner card-corner-top flex flex-col items-start gap-0 self-start">
        <RankSymbolByIndex
          rankIndex={rank}
          size={cornerRankSize}
          color={suitColor}
          className="card-rank flex items-center justify-center overflow-visible"
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
      <div className="card-corner card-corner-bottom flex flex-col items-end gap-0 self-end">
        <div className="card-rank-stretch">
          <RankSymbolByIndex
            rankIndex={rank}
            size={cornerRankSize}
            color={suitColor}
            className="card-rank flex items-center justify-center overflow-visible"
            flipped
          />
        </div>
      </div>
    </div>
  );
};
