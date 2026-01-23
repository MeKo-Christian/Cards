/**
 * Foundations component - displays the 4 foundation piles
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { Card } from "./Card";
import { SuitSymbolByIndex } from "./SuitSymbol";

interface FoundationsProps {
  foundations: [Pile, Pile, Pile, Pile];
  cardWidth: number;
  cardHeight: number;
  cardBackStyle?: CardBackStyle;
  spacing: number;
  onCardPointerDown?: (
    event: React.PointerEvent<HTMLDivElement>,
    foundationIndex: number
  ) => void;
  draggingFoundation?: { foundationIndex: number } | null;
  dropTarget?: { type: "foundation"; foundationIndex: number } | null;
  isDropTargetValid?: boolean;
}

export const Foundations = memo(function Foundations({
  foundations,
  cardWidth,
  cardHeight,
  cardBackStyle,
  spacing,
  onCardPointerDown,
  draggingFoundation,
  dropTarget,
  isDropTargetValid,
}: FoundationsProps) {
  const borderSize = 6;
  const holderWidth = cardWidth + borderSize * 2;
  const holderHeight = cardHeight + borderSize * 2;

  return (
    <div
      className="flex justify-center items-center p-5 flex-wrap"
      style={{ gap: `${spacing}px` }}
    >
      {foundations.map((pile, index) => {
        const isTarget =
          dropTarget?.type === "foundation" &&
          dropTarget.foundationIndex === index;

        return (
          <div
            key={index}
            className="relative border-[6px] border-black/15 rounded-[0.5em] box-border"
            data-foundation-index={index}
            style={{
              width: `${holderWidth}px`,
              height: `${holderHeight}px`,
            }}
          >
            {pile.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-full select-none flex items-center justify-center">
                  <SuitSymbolByIndex
                    suitIndex={index}
                    size={Math.max(18, Math.min(cardWidth, cardHeight) * 0.33)}
                    color="rgba(0, 0, 0, 0.15)"
                    className="foundation-suit"
                  />
                </div>
              </div>
            ) : (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Card
                  card={pile[pile.length - 1]}
                  width={cardWidth}
                  height={cardHeight}
                  cardBackStyle={cardBackStyle}
                  highlight={isTarget && isDropTargetValid}
                  onPointerDown={
                    onCardPointerDown
                      ? (event) => onCardPointerDown(event, index)
                      : undefined
                  }
                  className={
                    draggingFoundation &&
                    draggingFoundation.foundationIndex === index
                      ? "opacity-0 pointer-events-none"
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
