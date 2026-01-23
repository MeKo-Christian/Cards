/**
 * Foundations component - displays the 4 foundation piles
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { Card } from "./Card";
import { SuitSymbolByIndex } from "./SuitSymbol";
import {
  FoundationPile,
  FoundationEmpty,
  FoundationPlaceholder,
} from "./FoundationElements";

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
          <FoundationPile
            key={index}
            foundationIndex={index}
            width={holderWidth}
            height={holderHeight}
          >
            {pile.length === 0 ? (
              <FoundationEmpty>
                <FoundationPlaceholder>
                  <SuitSymbolByIndex
                    suitIndex={index}
                    size={Math.max(18, Math.min(cardWidth, cardHeight) * 0.33)}
                    color="rgba(0, 0, 0, 0.15)"
                    className="foundation-suit"
                  />
                </FoundationPlaceholder>
              </FoundationEmpty>
            ) : (
              pile.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="foundation-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    zIndex: cardIndex,
                  }}
                >
                  <Card
                    card={card}
                    width={cardWidth}
                    height={cardHeight}
                    cardBackStyle={cardBackStyle}
                    highlight={
                      cardIndex === pile.length - 1 &&
                      isTarget &&
                      isDropTargetValid
                    }
                    onPointerDown={
                      cardIndex === pile.length - 1 && onCardPointerDown
                        ? (event) => onCardPointerDown(event, index)
                        : undefined
                    }
                    className={
                      cardIndex === pile.length - 1 &&
                      draggingFoundation &&
                      draggingFoundation.foundationIndex === index
                        ? "opacity-0 pointer-events-none"
                        : undefined
                    }
                  />
                </div>
              ))
            )}
          </FoundationPile>
        );
      })}
    </div>
  );
});
