/**
 * FaceCardCenter component - bordered area with suit symbol and large rank letter
 * Matches legacy layout for J, Q, K from Card.Cards.pas
 */

import { SuitSymbolByIndex } from "./SuitSymbol";
import { RankSymbolByIndex } from "./RankSymbol";

interface FaceCardCenterProps {
  rank: number;
  suit: number;
  width: number;
  height: number;
  color: string;
}

export const FaceCardCenter = ({
  rank,
  suit,
  width,
  height,
  color,
}: FaceCardCenterProps) => {
  const boxWidth = width * 0.8;
  const boxHeight = height * 0.6;
  const boxLeft = width * 0.1;
  const boxTop = height * 0.2;

  // Size for the small suit symbol in corner of face card box
  const smallSuitSize = Math.min(boxWidth, boxHeight) * 0.2;
  // Size for the large rank letter in center
  const largeRankSize = Math.min(boxWidth, boxHeight) * 0.5;

  return (
    <div
      className="card-face-box"
      style={{
        position: "absolute",
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
        border: "1px solid #888",
        boxSizing: "border-box",
      }}
    >
      {/* Small suit in top-left of face box */}
      <div
        style={{
          position: "absolute",
          left: boxWidth * 0.25,
          top: 0,
          transform: "translate(-50%, -50%)",
        }}
      >
        <SuitSymbolByIndex suitIndex={suit} size={smallSuitSize} />
      </div>

      {/* Large rank letter in center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <RankSymbolByIndex
          rankIndex={rank}
          size={largeRankSize}
          color={color}
          disableStretch
        />
      </div>
    </div>
  );
};
