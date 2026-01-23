/**
 * CardBackElements - Semantic wrapper components for card back rendering
 * Extracted for composition and Tailwind CSS migration
 */

import type React from "react";
import { CardBackOrnament } from "./CardBackOrnament";

interface CardBackContainerProps {
  width: number;
  height: number;
  isOrnament: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

export const CardBackContainer = ({
  width,
  height,
  isOrnament,
  className,
  style,
  onPointerDown,
  onDoubleClick,
  children,
}: CardBackContainerProps) => {
  return (
    <div
      className={`card card-back relative rounded-[0.3em] shadow-[1px_1px_4px_rgba(0,0,0,0.5)] select-none cursor-pointer touch-none flex items-center justify-center${className ? ` ${className}` : ""}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: isOrnament
          ? "#ffffff"
          : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
};

export const CardBackOrnamentPattern = () => {
  return (
    <div className="w-[96%] h-[96%] bg-[#001381] border-[1.3px] border-[#888] rounded-[1.3px] relative overflow-hidden">
      <CardBackOrnament className="absolute left-1/2 -translate-x-1/2 top-[0%] w-[96%] h-[50%] text-white/50" />
      <CardBackOrnament className="absolute left-1/2 -translate-x-1/2 bottom-[0%] w-[96%] h-[50%] text-white/50 rotate-180" />
    </div>
  );
};

export const CardBackStripePattern = () => {
  return (
    <div
      className="w-4/5 h-4/5 rounded"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)`,
      }}
    />
  );
};
