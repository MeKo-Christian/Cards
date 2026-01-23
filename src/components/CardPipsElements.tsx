/**
 * CardPipsElements - Semantic wrapper components for card pip rendering
 * Extracted for composition and Tailwind CSS migration
 */

import { SuitSymbolByIndex } from "./SuitSymbol";

interface PipAreaContainerProps {
  pipAreaLeft: number;
  pipAreaTop: number;
  pipAreaWidth: number;
  pipAreaHeight: number;
  children: React.ReactNode;
}

export const PipAreaContainer = ({
  pipAreaLeft,
  pipAreaTop,
  pipAreaWidth,
  pipAreaHeight,
  children,
}: PipAreaContainerProps) => {
  return (
    <div
      className="card-pips absolute"
      style={{
        left: pipAreaLeft,
        top: pipAreaTop,
        width: pipAreaWidth,
        height: pipAreaHeight,
      }}
    >
      {children}
    </div>
  );
};

interface PipSymbolProps {
  x: number;
  y: number;
  suit: number;
  pipSize: number;
  flipped?: boolean;
}

export const PipSymbol = ({
  x,
  y,
  suit,
  pipSize,
  flipped,
}: PipSymbolProps) => {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: x,
        top: y,
      }}
    >
      <SuitSymbolByIndex suitIndex={suit} size={pipSize} flipped={flipped} />
    </div>
  );
};
