/**
 * Semantic wrapper components for Foundation elements
 * These provide the CSS class names required for drag-and-drop detection
 * while keeping all styling in Tailwind
 */

import type { ReactNode } from "react";

interface FoundationPileProps {
  foundationIndex: number;
  width: number;
  height: number;
  children: ReactNode;
}

export const FoundationPile = ({
  foundationIndex,
  width,
  height,
  children,
}: FoundationPileProps) => {
  return (
    <div
      className="foundation-pile relative border-[6px] border-black/15 rounded-[0.5em] box-border"
      data-foundation-index={foundationIndex}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {children}
    </div>
  );
};

export const FoundationEmpty = ({ children }: { children: ReactNode }) => {
  return (
    <div className="foundation-empty w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
};

export const FoundationPlaceholder = ({ children }: { children: ReactNode }) => {
  return (
    <div className="foundation-placeholder w-full h-full select-none flex items-center justify-center">
      {children}
    </div>
  );
};

export const FoundationCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="foundation-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {children}
    </div>
  );
};
