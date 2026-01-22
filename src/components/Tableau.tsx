/**
 * Tableau component - displays the 8 tableau piles with overlapping cards
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import { Card } from "./Card";
import { calculatePileOverlap } from "../hooks/useLayout";
import "./Tableau.css";

interface TableauProps {
  tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile, Pile];
  cardWidth: number;
  cardHeight: number;
  overlapDistance: number;
  spacing: number;
  tableauTopOffset: number;
  onCardPointerDown?: (
    event: React.PointerEvent<HTMLDivElement>,
    pileIndex: number,
    cardIndex: number
  ) => void;
  draggingTableau?: { pileIndex: number; cardIndex: number } | null;
  dropTarget?: { type: "tableau"; pileIndex: number } | null;
  isDropTargetValid?: boolean;
}

export const Tableau = memo(function Tableau({
  tableau,
  cardWidth,
  cardHeight,
  overlapDistance,
  spacing,
  tableauTopOffset,
  onCardPointerDown,
  draggingTableau,
  dropTarget,
  isDropTargetValid,
}: TableauProps) {
  return (
    <div className="tableau" style={{ gap: `${spacing}px` }}>
      {tableau.map((pile, pileIndex) => {
        const isTarget =
          dropTarget?.type === "tableau" && dropTarget.pileIndex === pileIndex;
        const pileClassName = `tableau-pile${
          isTarget ? " drop-target" : ""
        }${isTarget ? (isDropTargetValid ? " drop-valid" : " drop-invalid") : ""}`;

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
            className={pileClassName}
            data-tableau-index={pileIndex}
            style={{
              width: `${cardWidth}px`,
            }}
          >
            {pile.length === 0 ? (
              <div
                className="tableau-empty"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                }}
              >
                <div className="tableau-placeholder">K</div>
              </div>
            ) : (
              <div className="tableau-stack">
                {pile.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    className="tableau-card"
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
                      onPointerDown={
                        onCardPointerDown
                          ? (event) =>
                              onCardPointerDown(event, pileIndex, cardIndex)
                          : undefined
                      }
                      className={
                        draggingTableau &&
                        draggingTableau.pileIndex === pileIndex &&
                        cardIndex >= draggingTableau.cardIndex
                          ? "drag-source"
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
