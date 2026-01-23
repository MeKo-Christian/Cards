/**
 * Foundations component - displays the 4 foundation piles
 */

import type React from "react";
import { memo } from "react";
import type { Pile } from "../engine";
import type { CardBackStyle } from "../hooks/useGame";
import { Card } from "./Card";
import "./Foundations.css";

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
  return (
    <div className="foundations" style={{ gap: `${spacing}px` }}>
      {foundations.map((pile, index) => {
        const isTarget =
          dropTarget?.type === "foundation" &&
          dropTarget.foundationIndex === index;
        const pileClassName = `foundation-pile${
          isTarget ? " drop-target" : ""
        }${isTarget ? (isDropTargetValid ? " drop-valid" : " drop-invalid") : ""}`;

        return (
          <div
            key={index}
            className={pileClassName}
            data-foundation-index={index}
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
            }}
          >
            {pile.length === 0 ? (
              <div className="foundation-empty">
                <div className="foundation-placeholder">
                  {["♠", "♥", "♣", "♦"][index]}
                </div>
              </div>
            ) : (
              <Card
                card={pile[pile.length - 1]}
                width={cardWidth}
                height={cardHeight}
                cardBackStyle={cardBackStyle}
                onPointerDown={
                  onCardPointerDown
                    ? (event) => onCardPointerDown(event, index)
                    : undefined
                }
                className={
                  draggingFoundation &&
                  draggingFoundation.foundationIndex === index
                    ? "drag-source"
                    : undefined
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
