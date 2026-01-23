/**
 * CardBack component - renders the back of a playing card
 * Supports two styles:
 * - "legacy": Decorative ornament pattern from legacy Card.Drawer.pas
 * - "modern": Simple diagonal stripe pattern
 */

import type React from "react";
import type { CardBackStyle } from "../hooks/useGame";
import { CardBackOrnament } from "./CardBackOrnament";

interface CardBackProps {
  width: number;
  height: number;
  cardBackStyle?: CardBackStyle;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function CardBack({
  width,
  height,
  cardBackStyle = "legacy",
  className,
  style,
  onPointerDown,
  onDoubleClick,
}: CardBackProps) {
  const backClass =
    cardBackStyle === "legacy" ? "card-back-legacy" : "card-back-modern";

  return (
    <div
      className={`card card-back ${backClass}${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {cardBackStyle === "legacy" ? (
        <div className="card-back-inner">
          <CardBackOrnament className="card-back-ornament card-back-ornament-top" />
          <CardBackOrnament className="card-back-ornament card-back-ornament-bottom" />
        </div>
      ) : (
        <div className="card-back-pattern" />
      )}
    </div>
  );
}
