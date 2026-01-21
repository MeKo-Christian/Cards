/**
 * Game state management hook
 */

import { useState, useCallback } from "react";
import { newGame, applyMove, runFinish, runSolve, undo } from "../engine";
import type { GameState, Move } from "../engine";

const SEED_STORAGE_KEY = "cards-last-seed";

function readStoredSeed(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SEED_STORAGE_KEY);
    const seed = Number(raw);
    return Number.isFinite(seed) ? seed : null;
  } catch {
    return null;
  }
}

function storeSeed(seed: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SEED_STORAGE_KEY, String(seed));
  } catch {
    // Ignore storage errors
  }
}

export function useGame(initialSeed?: number) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const seed = initialSeed ?? readStoredSeed() ?? Date.now();
    storeSeed(seed);
    return newGame(seed);
  });

  const startNewGame = useCallback((seed?: number) => {
    const nextSeed = seed ?? Date.now();
    storeSeed(nextSeed);
    setGameState(newGame(nextSeed));
  }, []);

  const retryGame = useCallback(() => {
    storeSeed(gameState.seed);
    setGameState(newGame(gameState.seed));
  }, [gameState.seed]);

  const performMove = useCallback((move: Move) => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      const success = applyMove(newState, move);
      return success ? newState : prev;
    });
  }, []);

  const performUndo = useCallback(() => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      const success = undo(newState);
      return success ? newState : prev;
    });
  }, []);

  const performFinish = useCallback(() => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      runFinish(newState);
      return newState;
    });
  }, []);

  const performSolve = useCallback((maxSteps = 200) => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      runSolve(newState, maxSteps);
      return newState;
    });
  }, []);

  return {
    gameState,
    startNewGame,
    retryGame,
    performMove,
    performUndo,
    performFinish,
    performSolve,
  };
}
