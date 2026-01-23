/**
 * FaceCardElements - Semantic wrapper components for face card center box elements
 * Extracted for composition and Tailwind CSS migration
 */

import { SuitSymbolByIndex } from "./SuitSymbol";
import { RankSymbolByIndex } from "./RankSymbol";

interface FaceCardBoxProps {
  boxLeft: number;
  boxTop: number;
  boxWidth: number;
  boxHeight: number;
  children: React.ReactNode;
}

export const FaceCardBox = ({
  boxLeft,
  boxTop,
  boxWidth,
  boxHeight,
  children,
}: FaceCardBoxProps) => {
  return (
    <div
      className="absolute border border-gray-600 box-border"
      style={{
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
      }}
    >
      {children}
    </div>
  );
};

interface FaceCardCornerSuitProps {
  suit: number;
  smallSuitSize: number;
  boxWidth: number;
}

export const FaceCardCornerSuit = ({
  suit,
  smallSuitSize,
  boxWidth,
}: FaceCardCornerSuitProps) => {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: boxWidth * 0.25,
        top: 0,
      }}
    >
      <SuitSymbolByIndex suitIndex={suit} size={smallSuitSize} />
    </div>
  );
};

interface FaceCardCenterRankProps {
  rank: number;
  largeRankSize: number;
  color: string;
}

export const FaceCardCenterRank = ({
  rank,
  largeRankSize,
  color,
}: FaceCardCenterRankProps) => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <RankSymbolByIndex
        rankIndex={rank}
        size={largeRankSize}
        color={color}
        disableStretch
      />
    </div>
  );
};
