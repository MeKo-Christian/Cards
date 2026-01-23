/**
 * Hook for managing drag-and-drop state and operations
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DragState, DropTarget, PendingDrag } from "../types/drag";
import { DRAG_THRESHOLD_PX, HOVER_HIGHLIGHT_DELAY_MS } from "../types/drag";
import {
  areTargetsEqual,
  getDropTargetFromPoint,
  getDropTargetFromRect,
} from "../utils/drag";
import {
  MoveType,
  canDropOnFoundation,
  canDropOnTableau,
  getMovableStack,
} from "../engine";
import type { GameState } from "../engine";

interface UseDragAndDropProps {
  gameState: GameState;
  performMove: (move: any) => void;
}

interface UseDragAndDropReturn {
  dragState: DragState | null;
  pendingDrag: PendingDrag | null;
  hoverTarget: DropTarget | null;
  hoverIsValid: boolean;
  dragPreviewRef: React.RefObject<HTMLDivElement | null>;
  startTableauDrag: (
    event: React.PointerEvent<HTMLDivElement>,
    pileIndex: number,
    cardIndex: number
  ) => void;
  startFoundationDrag: (
    event: React.PointerEvent<HTMLDivElement>,
    foundationIndex: number
  ) => void;
  handleTableauDoubleClick: (pileIndex: number, cardIndex: number) => void;
}

export function useDragAndDrop({
  gameState,
  performMove,
}: UseDragAndDropProps): UseDragAndDropReturn {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null);
  const [hoverTarget, setHoverTarget] = useState<DropTarget | null>(null);
  const [hoverIsValid, setHoverIsValid] = useState(false);

  const dragCaptureRef = useRef<HTMLElement | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const dragPositionRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef<DragState | null>(null);
  const pendingDragRef = useRef<PendingDrag | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const scheduleHoverHighlight = useCallback(
    (target: DropTarget | null, isTargetValid: boolean) => {
      if (!target) {
        clearHoverTimeout();
        setHoverTarget(null);
        setHoverIsValid(false);
        return;
      }

      if (
        areTargetsEqual(target, hoverTarget) &&
        hoverIsValid === isTargetValid
      ) {
        return;
      }

      clearHoverTimeout();
      hoverTimeoutRef.current = window.setTimeout(() => {
        setHoverTarget(target);
        setHoverIsValid(isTargetValid);
      }, HOVER_HIGHLIGHT_DELAY_MS);
    },
    [clearHoverTimeout, hoverIsValid, hoverTarget]
  );

  const updateDragPreviewPosition = useCallback((x: number, y: number) => {
    const preview = dragPreviewRef.current;
    if (!preview) {
      return;
    }
    preview.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const isValidDropTarget = useCallback(
    (state: GameState, drag: DragState, target: DropTarget | null) => {
      if (!target) {
        return false;
      }

      if (target.type === "tableau") {
        if (drag.source.type === "tableau") {
          if (drag.source.pileIndex === target.pileIndex) {
            return false;
          }
          return canDropOnTableau(drag.stack, state.tableau[target.pileIndex]);
        }

        return canDropOnTableau(drag.stack, state.tableau[target.pileIndex]);
      }

      if (target.type === "foundation") {
        if (drag.source.type !== "tableau") {
          return false;
        }

        const sourcePile = state.tableau[drag.source.pileIndex];
        const isTopCard = drag.source.cardIndex === sourcePile.length - 1;

        if (!isTopCard || drag.stack.length !== 1) {
          return false;
        }

        return canDropOnFoundation(
          drag.stack[0],
          state.foundations[target.foundationIndex]
        );
      }

      return false;
    },
    []
  );

  const updateDragPosition = useCallback(
    (event: PointerEvent) => {
      const getDragCardRect = () => {
        const preview = dragPreviewRef.current;
        if (!preview) {
          return null;
        }
        const cardEl = preview.querySelector<HTMLElement>(".drag-card .card");
        return cardEl ? cardEl.getBoundingClientRect() : null;
      };

      const pending = pendingDragRef.current;
      if (pending && pending.pointerId === event.pointerId) {
        const deltaX = event.clientX - pending.startX;
        const deltaY = event.clientY - pending.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance >= DRAG_THRESHOLD_PX) {
          const targetElement = pending.captureElement;
          const initialTarget = getDropTargetFromRect(
            targetElement.getBoundingClientRect()
          );
          const initialPosition = {
            x: event.clientX - pending.grabOffset.x,
            y: event.clientY - pending.grabOffset.y,
          };
          const initialDragState: DragState = {
            pointerId: pending.pointerId,
            source: pending.source,
            stack: pending.stack,
            grabOffset: pending.grabOffset,
            target: initialTarget,
            isTargetValid: false,
          };

          initialDragState.isTargetValid = isValidDropTarget(
            gameState,
            initialDragState,
            initialTarget
          );

          dragPositionRef.current = initialPosition;
          dragStateRef.current = initialDragState;
          dragCaptureRef.current = pending.captureElement;

          setPendingDrag(null);
          setDragState(initialDragState);
          requestAnimationFrame(() => {
            updateDragPreviewPosition(initialPosition.x, initialPosition.y);
          });
        }
        return;
      }

      const current = dragStateRef.current;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }

      const position = {
        x: event.clientX - current.grabOffset.x,
        y: event.clientY - current.grabOffset.y,
      };

      dragPositionRef.current = position;
      updateDragPreviewPosition(position.x, position.y);

      const dragRect = getDragCardRect();
      const target = dragRect
        ? getDropTargetFromRect(dragRect)
        : getDropTargetFromPoint(event.clientX, event.clientY);
      const isTargetValid = isValidDropTarget(gameState, current, target);

      scheduleHoverHighlight(target, isTargetValid);

      if (
        areTargetsEqual(current.target, target) &&
        current.isTargetValid === isTargetValid
      ) {
        return;
      }

      const nextState: DragState = {
        ...current,
        target,
        isTargetValid,
      };

      dragStateRef.current = nextState;

      setDragState((prev) => {
        if (!prev || prev.pointerId !== event.pointerId) {
          return prev;
        }

        if (
          areTargetsEqual(prev.target, target) &&
          prev.isTargetValid === isTargetValid
        ) {
          return prev;
        }

        return nextState;
      });
    },
    [
      gameState,
      isValidDropTarget,
      scheduleHoverHighlight,
      updateDragPreviewPosition,
    ]
  );

  const finalizeDrag = useCallback(
    (event: PointerEvent) => {
      setPendingDrag((prev) => {
        if (prev && prev.pointerId === event.pointerId) {
          if (prev.captureElement.hasPointerCapture(event.pointerId)) {
            try {
              prev.captureElement.releasePointerCapture(event.pointerId);
            } catch {
              // Ignore release errors
            }
          }
          return null;
        }
        return prev;
      });

      setDragState((prev) => {
        if (!prev || prev.pointerId !== event.pointerId) {
          return prev;
        }

        if (prev.isTargetValid && prev.target) {
          if (
            prev.source.type === "tableau" &&
            prev.target.type === "tableau"
          ) {
            performMove({
              type: MoveType.TableauToTableau,
              fromPile: prev.source.pileIndex,
              toPile: prev.target.pileIndex,
              cardIndex: prev.source.cardIndex,
            });
          } else if (
            prev.source.type === "tableau" &&
            prev.target.type === "foundation"
          ) {
            performMove({
              type: MoveType.TableauToFoundation,
              fromPile: prev.source.pileIndex,
              toFoundation: prev.target.foundationIndex,
            });
          } else if (
            prev.source.type === "foundation" &&
            prev.target.type === "tableau"
          ) {
            performMove({
              type: MoveType.FoundationToTableau,
              fromFoundation: prev.source.foundationIndex,
              toPile: prev.target.pileIndex,
            });
          }
        }

        return null;
      });

      dragStateRef.current = null;
      clearHoverTimeout();
      setHoverTarget(null);
      setHoverIsValid(false);

      if (
        dragCaptureRef.current &&
        dragCaptureRef.current.hasPointerCapture(event.pointerId)
      ) {
        try {
          dragCaptureRef.current.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore release errors
        }
      }
      dragCaptureRef.current = null;
    },
    [clearHoverTimeout, performMove]
  );

  const startTableauDrag = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      pileIndex: number,
      cardIndex: number
    ) => {
      if (event.button !== 0) {
        return;
      }

      const pile = gameState.tableau[pileIndex];
      const card = pile[cardIndex];

      if (!card) {
        return;
      }

      if (!card.faceUp) {
        if (cardIndex === pile.length - 1) {
          performMove({
            type: MoveType.Flip,
            pile: pileIndex,
          });
        }
        return;
      }

      const stack = getMovableStack(gameState, pileIndex, cardIndex);
      if (!stack || stack.length === 0) {
        return;
      }

      event.preventDefault();

      const targetElement = event.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const grabOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      targetElement.setPointerCapture(event.pointerId);

      const pending: PendingDrag = {
        pointerId: event.pointerId,
        source: { type: "tableau", pileIndex, cardIndex },
        stack,
        grabOffset,
        startX: event.clientX,
        startY: event.clientY,
        captureElement: targetElement,
      };

      setPendingDrag(pending);
    },
    [gameState, performMove]
  );

  const startFoundationDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, foundationIndex: number) => {
      if (event.button !== 0) {
        return;
      }

      const pile = gameState.foundations[foundationIndex];
      const card = pile[pile.length - 1];
      if (!card) {
        return;
      }

      event.preventDefault();

      const targetElement = event.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const grabOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      targetElement.setPointerCapture(event.pointerId);

      const pending: PendingDrag = {
        pointerId: event.pointerId,
        source: { type: "foundation", foundationIndex },
        stack: [card],
        grabOffset,
        startX: event.clientX,
        startY: event.clientY,
        captureElement: targetElement,
      };

      setPendingDrag(pending);
    },
    [gameState]
  );

  const handleTableauDoubleClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      if (dragStateRef.current || pendingDragRef.current) {
        return;
      }

      const pile = gameState.tableau[pileIndex];
      const card = pile[cardIndex];
      if (!card || !card.faceUp) {
        return;
      }

      if (cardIndex !== pile.length - 1) {
        return;
      }

      const foundationIndex = card.suit;
      if (!canDropOnFoundation(card, gameState.foundations[foundationIndex])) {
        return;
      }

      performMove({
        type: MoveType.TableauToFoundation,
        fromPile: pileIndex,
        toFoundation: foundationIndex,
      });
    },
    [gameState, performMove]
  );

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    pendingDragRef.current = pendingDrag;
  }, [pendingDrag]);

  useEffect(() => {
    if (dragState) {
      return;
    }

    clearHoverTimeout();
    setHoverTarget(null);
    setHoverIsValid(false);
  }, [clearHoverTimeout, dragState]);

  useEffect(() => {
    if (!dragState && !pendingDrag) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) =>
      updateDragPosition(event);
    const handlePointerUp = (event: PointerEvent) => finalizeDrag(event);
    const handlePointerCancel = (event: PointerEvent) => finalizeDrag(event);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [dragState, pendingDrag, finalizeDrag, updateDragPosition]);

  return {
    dragState,
    pendingDrag,
    hoverTarget,
    hoverIsValid,
    dragPreviewRef,
    startTableauDrag,
    startFoundationDrag,
    handleTableauDoubleClick,
  };
}
