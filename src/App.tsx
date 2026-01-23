/**
 * Main App component
 */

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  isSolvableSeed,
  readStoredCardBackStyle,
  useGame,
} from "./hooks/useGame";
import { useLayout } from "./hooks/useLayout";
import { TopBar } from "./components/TopBar";
import { Foundations } from "./components/Foundations";
import { Tableau } from "./components/Tableau";
import { Card } from "./components/Card";
import { Confetti } from "./components/Confetti";
import {
  MoveType,
  canDropOnFoundation,
  canDropOnTableau,
  getMovableStack,
  isWin,
} from "./engine";
import type { Card as CardType, GameState } from "./engine";
import "./App.css";

type DragSource =
  | { type: "tableau"; pileIndex: number; cardIndex: number }
  | { type: "foundation"; foundationIndex: number };

type DropTarget =
  | { type: "tableau"; pileIndex: number }
  | { type: "foundation"; foundationIndex: number };

interface DragState {
  pointerId: number;
  source: DragSource;
  stack: CardType[];
  grabOffset: { x: number; y: number };
  target: DropTarget | null;
  isTargetValid: boolean;
}

const HOVER_HIGHLIGHT_DELAY_MS = 180;

function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function areTargetsEqual(a: DropTarget | null, b: DropTarget | null): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (a.type !== b.type) {
    return false;
  }

  if (a.type === "tableau") {
    return b.type === "tableau" && a.pileIndex === b.pileIndex;
  }

  return b.type === "foundation" && a.foundationIndex === b.foundationIndex;
}

function App() {
  const {
    gameState,
    startNewGame,
    retryGame,
    performUndo,
    performMove,
    performFinish,
    performSolve,
  } = useGame();
  const layout = useLayout();
  const [cardBackStyle] = useState(() => readStoredCardBackStyle());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    getSystemReducedMotion()
  );
  const dragCaptureRef = useRef<HTMLElement | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const dragPositionRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef<DragState | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [hoverTarget, setHoverTarget] = useState<DropTarget | null>(null);
  const [hoverIsValid, setHoverIsValid] = useState(false);
  const hasWonRef = useRef(false);

  const handleFinish = () => {
    performFinish();
  };

  const handleSolve = () => {
    performSolve(200);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).tagName === "INPUT") {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "n":
          startNewGame();
          break;
        case "r":
          retryGame();
          break;
        case "u":
          performUndo();
          break;
        case "f":
          handleFinish();
          break;
        case "s":
          handleSolve();
          break;
        default:
          break;
      }
    },
    [handleFinish, handleSolve, performUndo, retryGame, startNewGame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const won = isWin(gameState);
    if (won && !hasWonRef.current) {
      setConfettiActive(true);
    }
    hasWonRef.current = won;
    if (!won) {
      setConfettiActive(false);
    }
  }, [gameState]);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setConfettiActive(false);
    }
  }, [reducedMotion]);

  const updateDragPreviewPosition = useCallback((x: number, y: number) => {
    const preview = dragPreviewRef.current;
    if (!preview) {
      return;
    }
    preview.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const getDropTargetFromPoint = useCallback((x: number, y: number) => {
    const element = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!element) {
      return null;
    }

    const foundationEl = element.closest<HTMLElement>(
      "[data-foundation-index]"
    );
    if (foundationEl) {
      const foundationIndex = Number(foundationEl.dataset.foundationIndex);
      return Number.isFinite(foundationIndex)
        ? ({ type: "foundation", foundationIndex } as DropTarget)
        : null;
    }

    const tableauEl = element.closest<HTMLElement>("[data-tableau-index]");
    if (tableauEl) {
      const pileIndex = Number(tableauEl.dataset.tableauIndex);
      return Number.isFinite(pileIndex)
        ? ({ type: "tableau", pileIndex } as DropTarget)
        : null;
    }

    return null;
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

      const target = getDropTargetFromPoint(event.clientX, event.clientY);
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
      getDropTargetFromPoint,
      isValidDropTarget,
      scheduleHoverHighlight,
      updateDragPreviewPosition,
    ]
  );

  const finalizeDrag = useCallback(
    (event: PointerEvent) => {
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

  useEffect(() => {
    if (dragState) {
      return;
    }

    clearHoverTimeout();
    setHoverTarget(null);
    setHoverIsValid(false);
  }, [clearHoverTimeout, dragState]);

  useEffect(() => {
    if (!dragState) {
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
  }, [dragState, finalizeDrag, updateDragPosition]);

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

      // If clicking on a face-down card that is the top card, flip it
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

      dragCaptureRef.current = targetElement;
      targetElement.setPointerCapture(event.pointerId);

      const initialTarget = getDropTargetFromPoint(
        event.clientX,
        event.clientY
      );
      const initialPosition = {
        x: event.clientX - grabOffset.x,
        y: event.clientY - grabOffset.y,
      };
      const initialDragState: DragState = {
        pointerId: event.pointerId,
        source: { type: "tableau", pileIndex, cardIndex },
        stack,
        grabOffset,
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

      setDragState(initialDragState);
      requestAnimationFrame(() => {
        updateDragPreviewPosition(initialPosition.x, initialPosition.y);
      });
    },
    [
      gameState,
      getDropTargetFromPoint,
      isValidDropTarget,
      updateDragPreviewPosition,
    ]
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

      dragCaptureRef.current = targetElement;
      targetElement.setPointerCapture(event.pointerId);

      const initialTarget = getDropTargetFromPoint(
        event.clientX,
        event.clientY
      );
      const initialPosition = {
        x: event.clientX - grabOffset.x,
        y: event.clientY - grabOffset.y,
      };
      const initialDragState: DragState = {
        pointerId: event.pointerId,
        source: { type: "foundation", foundationIndex },
        stack: [card],
        grabOffset,
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

      setDragState(initialDragState);
      requestAnimationFrame(() => {
        updateDragPreviewPosition(initialPosition.x, initialPosition.y);
      });
    },
    [
      gameState,
      getDropTargetFromPoint,
      isValidDropTarget,
      updateDragPreviewPosition,
    ]
  );

  const handleTableauDoubleClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      if (dragStateRef.current) {
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

  return (
    <div className={`app${reducedMotion ? " reduced-motion" : ""}`}>
      <TopBar
        seed={gameState.seed}
        isSolvable={isSolvableSeed(gameState.seed)}
        onNew={() => startNewGame()}
        onRetry={retryGame}
        onFinish={handleFinish}
        onSolve={handleSolve}
        onUndo={performUndo}
      />
      <Foundations
        foundations={gameState.foundations}
        cardWidth={layout.cardWidth}
        cardHeight={layout.cardHeight}
        cardBackStyle={cardBackStyle}
        spacing={layout.foundationSpacing}
        onCardPointerDown={startFoundationDrag}
        draggingFoundation={
          dragState?.source.type === "foundation"
            ? { foundationIndex: dragState.source.foundationIndex }
            : null
        }
        dropTarget={hoverTarget?.type === "foundation" ? hoverTarget : null}
        isDropTargetValid={hoverIsValid}
      />
      <Tableau
        tableau={gameState.tableau}
        cardWidth={layout.cardWidth}
        cardHeight={layout.cardHeight}
        cardBackStyle={cardBackStyle}
        overlapDistance={layout.tableauOverlap}
        spacing={layout.foundationSpacing}
        tableauTopOffset={layout.tableauTopOffset}
        onCardPointerDown={startTableauDrag}
        onCardDoubleClick={handleTableauDoubleClick}
        draggingTableau={
          dragState?.source.type === "tableau"
            ? {
                pileIndex: dragState.source.pileIndex,
                cardIndex: dragState.source.cardIndex,
              }
            : null
        }
        dropTarget={hoverTarget?.type === "tableau" ? hoverTarget : null}
        isDropTargetValid={hoverIsValid}
      />
      {dragState ? (
        <div className="drag-layer">
          <div className="drag-preview" ref={dragPreviewRef}>
            {dragState.stack.map((card, index) => (
              <div
                key={card.id}
                className="drag-card"
                style={{
                  top: `${index * layout.tableauOverlap}px`,
                }}
              >
                <Card
                  card={card}
                  width={layout.cardWidth}
                  height={layout.cardHeight}
                  cardBackStyle={cardBackStyle}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Confetti
        active={confettiActive && !reducedMotion}
        onComplete={() => setConfettiActive(false)}
      />
    </div>
  );
}

export default App;
