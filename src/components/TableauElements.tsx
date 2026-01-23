/**
 * Semantic wrapper components for Tableau elements
 * These provide the CSS class names required for drag-and-drop detection
 * while keeping all styling in Tailwind
 */

import type { ReactNode } from "react";

interface TableauPileProps {
  pileIndex: number;
  width: number;
  children: ReactNode;
}

export const TableauPile = ({ pileIndex, width, children }: TableauPileProps) => {
  return (
    <div
      className="tableau-pile relative min-h-[100px]"
      data-tableau-index={pileIndex}
      style={{ width: `${width}px` }}
    >
      {children}
    </div>
  );
};

interface TableauEmptyProps {
  width: number;
  height: number;
  children: ReactNode;
}

export const TableauEmpty = ({ width, height, children }: TableauEmptyProps) => {
  return (
    <div
      className="tableau-empty relative border-[6px] border-black/15 rounded-[0.5em] flex items-center justify-center bg-transparent box-border"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {children}
    </div>
  );
};

export const TableauPlaceholder = ({ children }: { children: ReactNode }) => {
  return (
    <div className="tableau-placeholder text-[3em] font-bold select-none text-black/15">
      {children}
    </div>
  );
};

export const TableauStack = ({ children }: { children: ReactNode }) => {
  return (
    <div className="tableau-stack absolute top-0 left-0 w-full">
      {children}
    </div>
  );
};

interface TableauCardProps {
  pileIndex: number;
  cardIndex: number;
  cardId: number;
  top: number;
  children: ReactNode;
}

export const TableauCard = ({
  pileIndex,
  cardIndex,
  cardId,
  top,
  children,
}: TableauCardProps) => {
  return (
    <div
      key={cardId}
      className="tableau-card absolute left-0 transition-[top] duration-200 ease-out"
      data-tableau-index={pileIndex}
      data-card-index={cardIndex}
      style={{ top: `${top}px` }}
    >
      {children}
    </div>
  );
};
