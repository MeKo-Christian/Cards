/**
 * RankSymbol component - renders a rank symbol using vector paths
 * Ported from legacy Card.Drawer.pas
 */

import { RANK_PATHS, type RankName } from "./CardDrawers";

interface RankSymbolProps {
  rank: RankName;
  size: number;
  color: string;
  className?: string;
  flipped?: boolean;
  stretch?: boolean;
}

const RANK_ORDER: RankName[] = [
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

export const RankSymbol = ({
  rank,
  size,
  color,
  className,
  flipped,
  stretch = false,
}: RankSymbolProps) => {
  const { width, height, path } = RANK_PATHS[rank];

  // Scale based on height to maintain consistent text height
  const scale = size / height;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Build transform string with both scaleX and rotation
  const transforms: string[] = [];
  if (stretch) {
    transforms.push("scaleX(1.4)");
  }
  if (flipped) {
    transforms.push("rotate(180deg)");
  }
  const transform = transforms.length > 0 ? transforms.join(" ") : undefined;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={
        transform ? { transform, overflow: "visible" } : { overflow: "visible" }
      }
    >
      <path d={path} fill={color} fillRule="evenodd" />
    </svg>
  );
};

interface RankSymbolByIndexProps {
  rankIndex: number;
  size: number;
  color: string;
  className?: string;
  flipped?: boolean;
  disableStretch?: boolean;
}

export const RankSymbolByIndex = ({
  rankIndex,
  size,
  color,
  className,
  flipped,
  disableStretch = false,
}: RankSymbolByIndexProps) => {
  const rank = RANK_ORDER[rankIndex];

  // Cards 2-9 (rank indices 1-8) get horizontal stretch like legacy
  // NOT Ace (0), 10 (9), J (10), Q (11), K (12)
  // Only apply in corner positions (not in center of face cards)
  const shouldStretch = !disableStretch && rankIndex >= 1 && rankIndex <= 8;

  return (
    <RankSymbol
      rank={rank}
      size={size}
      color={color}
      className={className}
      flipped={flipped}
      stretch={shouldStretch}
    />
  );
};
