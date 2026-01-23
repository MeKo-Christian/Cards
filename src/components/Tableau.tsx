/**
 * Tableau component - displays the 8 tableau piles with overlapping cards
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { Card } from "./Card";
import { calculatePileOverlap } from "../hooks/useLayout";

interface TableauProps {
  tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile, Pile];
  cardWidth: number;
  cardHeight: number;
  cardBackStyle?: CardBackStyle;
  overlapDistance: number;
  spacing: number;
  tableauTopOffset: number;
  onCardPointerDown?: (
    event: React.PointerEvent<HTMLDivElement>,
    pileIndex: number,
    cardIndex: number
  ) => void;
  onCardDoubleClick?: (pileIndex: number, cardIndex: number) => void;
  draggingTableau?: { pileIndex: number; cardIndex: number } | null;
  dropTarget?: { type: "tableau"; pileIndex: number } | null;
  isDropTargetValid?: boolean;
}

export const Tableau = memo(function Tableau({
  tableau,
  cardWidth,
  cardHeight,
  cardBackStyle,
  overlapDistance,
  spacing,
  tableauTopOffset,
  onCardPointerDown,
  onCardDoubleClick,
  draggingTableau,
  dropTarget,
  isDropTargetValid,
}: TableauProps) {
  return (
    <div
      className="flex justify-center items-start p-5 flex-1 overflow-y-auto flex-wrap"
      style={{ gap: `${spacing}px` }}
    >
      {tableau.map((pile, pileIndex) => {
        const isTarget =
          dropTarget?.type === "tableau" && dropTarget.pileIndex === pileIndex;

        // Calculate dynamic overlap for this specific pile
        const pileOverlap = calculatePileOverlap(
          pile,
          overlapDistance,
          tableauTopOffset,
          cardHeight,
          window.innerHeight
        );

        // Calculate positions with mixed spacing (half for face-down, full for face-up)
        const cardPositions = pile.map((_, index) => {
          let position = 0;
          for (let i = 0; i < index; i++) {
            // Face-down cards use half spacing
            position += pile[i].faceUp ? pileOverlap : pileOverlap * 0.5;
          }
          return position;
        });

        return (
          <div
            key={pileIndex}
            className="relative min-h-[100px]"
            data-tableau-index={pileIndex}
            style={{
              width: `${cardWidth}px`,
            }}
          >
            {/* Always render the placeholder base */}
            <div
              className="relative border-[6px] border-black/15 rounded-[0.5em] flex items-center justify-center bg-transparent box-border"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
              }}
            >
              <div className="text-[3em] font-bold select-none text-black/15">
                K
              </div>
            </div>

            {/* Render cards on top of the placeholder */}
            {pile.length > 0 && (
              <div className="absolute top-0 left-0 w-full">
                {pile.map((card, cardIndex) => {
                  const isTopCard = cardIndex === pile.length - 1;
                  const shouldHighlight =
                    isTarget && isDropTargetValid && isTopCard;
                  return (
                    <div
                      key={card.id}
                      className="absolute left-0 transition-[top] duration-200 ease-out"
                      data-tableau-index={pileIndex}
                      data-card-index={cardIndex}
                      style={{
                        top: `${cardPositions[cardIndex]}px`,
                      }}
                    >
                      <Card
                        card={card}
                        width={cardWidth}
                        height={cardHeight}
                        cardBackStyle={cardBackStyle}
                        highlight={shouldHighlight}
                        onPointerDown={
                          onCardPointerDown
                            ? (event) =>
                                onCardPointerDown(event, pileIndex, cardIndex)
                            : undefined
                        }
                        onDoubleClick={
                          onCardDoubleClick
                            ? () => onCardDoubleClick(pileIndex, cardIndex)
                            : undefined
                        }
                        className={
                          draggingTableau &&
                          draggingTableau.pileIndex === pileIndex &&
                          cardIndex >= draggingTableau.cardIndex
                            ? "opacity-0 pointer-events-none"
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
