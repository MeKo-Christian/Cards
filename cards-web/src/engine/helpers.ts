/**
 * Helper actions: finish & solve
 */

import { MoveType } from "./types";
import type {
  GameState,
  Move,
  TableauToFoundationMove,
  TableauToTableauMove,
} from "./types";
import {
  applyMove,
  canDropOnFoundation,
  canDropOnTableau,
  getMovableStack,
} from "./moves";

/**
 * Return all possible tableau → foundation moves for the current state.
 */
export function getAutoMovesToFoundation(
  state: GameState
): TableauToFoundationMove[] {
  const moves: TableauToFoundationMove[] = [];

  for (let pileIndex = 0; pileIndex < state.tableau.length; pileIndex++) {
    const pile = state.tableau[pileIndex];
    if (pile.length === 0) {
      continue;
    }

    const card = pile[pile.length - 1];
    if (!card.faceUp) {
      continue;
    }

    const foundationIndex = card.suit;
    if (canDropOnFoundation(card, state.foundations[foundationIndex])) {
      moves.push({
        type: MoveType.TableauToFoundation,
        fromPile: pileIndex,
        toFoundation: foundationIndex,
      });
    }
  }

  return moves;
}

/**
 * Apply automatic foundation moves until no more are available.
 * Returns number of moves applied.
 */
export function runFinish(state: GameState, maxIterations = 200): number {
  let movesApplied = 0;

  for (let i = 0; i < maxIterations; i++) {
    const autoMoves = getAutoMovesToFoundation(state);
    if (autoMoves.length === 0) {
      break;
    }

    const move = autoMoves[0];
    if (!applyMove(state, move)) {
      break;
    }

    movesApplied += 1;
  }

  return movesApplied;
}

/**
 * Find a single "improving" move for the solver.
 */
export function getSolveMove(state: GameState): Move | null {
  const autoMoves = getAutoMovesToFoundation(state);
  if (autoMoves.length > 0) {
    return autoMoves[0];
  }

  let fallbackMove: TableauToTableauMove | null = null;

  for (let fromPile = 0; fromPile < state.tableau.length; fromPile++) {
    const pile = state.tableau[fromPile];

    for (let cardIndex = 0; cardIndex < pile.length; cardIndex++) {
      const card = pile[cardIndex];
      if (!card.faceUp) {
        continue;
      }

      const stack = getMovableStack(state, fromPile, cardIndex);
      if (!stack) {
        continue;
      }

      for (let toPile = 0; toPile < state.tableau.length; toPile++) {
        if (toPile === fromPile) {
          continue;
        }

        if (!canDropOnTableau(stack, state.tableau[toPile])) {
          continue;
        }

        const revealsFaceDown = cardIndex > 0 && !pile[cardIndex - 1].faceUp;
        const move: TableauToTableauMove = {
          type: MoveType.TableauToTableau,
          fromPile,
          toPile,
          cardIndex,
        };

        if (revealsFaceDown) {
          return move;
        }

        if (!fallbackMove) {
          fallbackMove = move;
        }
      }
    }
  }

  return fallbackMove;
}

/**
 * Apply a single solver step. Returns true if a move was applied.
 */
export function runSolveStep(state: GameState): boolean {
  const move = getSolveMove(state);
  if (!move) {
    return false;
  }

  return applyMove(state, move);
}

/**
 * Run a simple solver loop until no more moves or step limit reached.
 */
export function runSolve(state: GameState, maxSteps = 200): number {
  let movesApplied = 0;

  for (let i = 0; i < maxSteps; i++) {
    if (!runSolveStep(state)) {
      break;
    }
    movesApplied += 1;
  }

  return movesApplied;
}
