/**
 * FaceCardCenter component - bordered area with suit symbol and large rank letter
 * Matches legacy layout for J, Q, K from Card.Cards.pas
 */

import {
  FaceCardBox,
  FaceCardCornerSuit,
  FaceCardCenterRank,
} from "./FaceCardElements";

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
    <FaceCardBox
      boxLeft={boxLeft}
      boxTop={boxTop}
      boxWidth={boxWidth}
      boxHeight={boxHeight}
    >
      {/* Small suit in top-left of face box */}
      <FaceCardCornerSuit
        suit={suit}
        smallSuitSize={smallSuitSize}
        boxWidth={boxWidth}
      />

      {/* Large rank letter in center */}
      <FaceCardCenterRank
        rank={rank}
        largeRankSize={largeRankSize}
        color={color}
      />
    </FaceCardBox>
  );
};
