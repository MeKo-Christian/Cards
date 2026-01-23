/**
 * CardFrontElements - Semantic wrapper components for card front rendering
 * Extracted for composition and Tailwind CSS migration
 */

import type React from "react";
import { RankSymbolByIndex } from "./RankSymbol";
import { CardPips } from "./CardPips";
import { FaceCardCenter } from "./FaceCardCenter";

interface CardFrontContainerProps {
  width: number;
  height: number;
  suitName: string;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

export const CardFrontContainer = ({
  width,
  height,
  suitName,
  className,
  style,
  onPointerDown,
  onDoubleClick,
  children,
}: CardFrontContainerProps) => {
  return (
    <div
      className={`card card-front card-${suitName} relative rounded-[0.3em] shadow-[1px_1px_4px_rgba(0,0,0,0.5)] select-none cursor-pointer touch-none text-black flex flex-col justify-between box-border${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        padding: "7px",
        background: "linear-gradient(150deg, #e1e1e1 0%, #fcfcfc 100%)",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
};

interface CardFrontTopCornerProps {
  rank: number;
  cornerRankSize: number;
  suitColor: string;
}

export const CardFrontTopCorner = ({
  rank,
  cornerRankSize,
  suitColor,
}: CardFrontTopCornerProps) => {
  return (
    <div className="card-corner card-corner-top flex flex-col items-start gap-0 self-start">
      <RankSymbolByIndex
        rankIndex={rank}
        size={cornerRankSize}
        color={suitColor}
        className="card-rank flex items-center justify-center overflow-visible"
      />
    </div>
  );
};

interface CardFrontBottomCornerProps {
  rank: number;
  cornerRankSize: number;
  suitColor: string;
}

export const CardFrontBottomCorner = ({
  rank,
  cornerRankSize,
  suitColor,
}: CardFrontBottomCornerProps) => {
  return (
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
  );
};

interface CardFrontCenterContentProps {
  isFaceCard: boolean;
  rank: number;
  suit: number;
  width: number;
  height: number;
  suitColor: string;
}

export const CardFrontCenterContent = ({
  isFaceCard,
  rank,
  suit,
  width,
  height,
  suitColor,
}: CardFrontCenterContentProps) => {
  return isFaceCard ? (
    <FaceCardCenter
      rank={rank}
      suit={suit}
      width={width}
      height={height}
      color={suitColor}
    />
  ) : (
    <CardPips rank={rank} suit={suit} width={width} height={height} />
  );
};
