/**
 * CardBack component - renders the back of a playing card
 * Supports two styles:
 * - "ornament": Decorative ornament pattern
 * - "stripes": Simple diagonal stripe pattern
 */

import type React from "react";
import type { CardBackStyle } from "../hooks/useGame";
import {
  CardBackContainer,
  CardBackOrnamentPattern,
  CardBackStripePattern,
} from "./CardBackElements";

interface CardBackProps {
  width: number;
  height: number;
  cardBackStyle?: CardBackStyle;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const CardBack = ({
  width,
  height,
  cardBackStyle = "ornament",
  className,
  style,
  onPointerDown,
  onDoubleClick,
}: CardBackProps) => {
  const isOrnament = cardBackStyle === "ornament";

  return (
    <CardBackContainer
      width={width}
      height={height}
      isOrnament={isOrnament}
      className={className}
      style={style}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {isOrnament ? <CardBackOrnamentPattern /> : <CardBackStripePattern />}
    </CardBackContainer>
  );
};
