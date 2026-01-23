/**
 * Tableau component - displays the 8 tableau piles with overlapping cards
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { Card } from "./Card";
import { calculatePileOverlap } from "../hooks/useLayout";
import {
  TableauPile,
  TableauEmpty,
  TableauPlaceholder,
  TableauStack,
  TableauCard,
} from "./TableauElements";

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
          <TableauPile key={pileIndex} pileIndex={pileIndex} width={cardWidth}>
            {/* Always render the placeholder base */}
            <TableauEmpty width={cardWidth} height={cardHeight}>
              <TableauPlaceholder>K</TableauPlaceholder>
            </TableauEmpty>

            {/* Render cards on top of the placeholder */}
            {pile.length > 0 && (
              <TableauStack>
                {pile.map((card, cardIndex) => {
                  const isTopCard = cardIndex === pile.length - 1;
                  const shouldHighlight =
                    isTarget && isDropTargetValid && isTopCard;
                  return (
                    <TableauCard
                      key={card.id}
                      cardId={card.id}
                      pileIndex={pileIndex}
                      cardIndex={cardIndex}
                      top={cardPositions[cardIndex]}
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
                    </TableauCard>
                  );
                })}
              </TableauStack>
            )}
          </TableauPile>
        );
      })}
    </div>
  );
});
