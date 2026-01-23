/**
 * Move validation and application logic
 */

import { areOppositeColors, MoveType } from "./types";
import type {
  Card,
  GameState,
  Move,
  Pile,
  TableauToTableauMove,
  TableauToFoundationMove,
  FoundationToTableauMove,
  FlipMove,
} from "./types";

/**
 * Get a movable stack from a tableau pile starting at cardIndex
 * Returns null if the stack is not valid (has face-down cards)
 */
export function getMovableStack(
  state: GameState,
  tableauIndex: number,
  cardIndex: number
): Card[] | null {
  const pile = state.tableau[tableauIndex];

  if (cardIndex < 0 || cardIndex >= pile.length) {
    return null;
  }

  const stack: Card[] = [];

  for (let i = cardIndex; i < pile.length; i++) {
    const card = pile[i];

    // All cards in stack must be face-up
    if (!card.faceUp) {
      return null;
    }

    stack.push(card);
  }

  return stack;
}

/**
 * Check if a stack can be dropped on a tableau pile
 */
export function canDropOnTableau(
  movingStack: Card[],
  targetPile: Pile
): boolean {
  if (movingStack.length === 0) {
    return false;
  }

  const bottomCard = movingStack[0];

  // Empty pile: only Kings can be placed
  if (targetPile.length === 0) {
    return bottomCard.rank === 12; // King
  }

  // Non-empty pile: must alternate colors and descend by 1
  const targetTop = targetPile[targetPile.length - 1];

  return (
    areOppositeColors(bottomCard.suit, targetTop.suit) &&
    targetTop.rank === bottomCard.rank + 1
  );
}

/**
 * Check if a card can be dropped on a foundation pile
 */
export function canDropOnFoundation(card: Card, foundationPile: Pile): boolean {
  // Empty foundation: only Aces
  if (foundationPile.length === 0) {
    return card.rank === 0; // Ace
  }

  // Non-empty foundation: same suit, ascending by 1
  const foundationTop = foundationPile[foundationPile.length - 1];

  return (
    card.suit === foundationTop.suit && card.rank === foundationTop.rank + 1
  );
}

/**
 * Apply a move to the game state (mutates state)
 * Returns true if move was applied successfully
 */
export function applyMove(state: GameState, move: Move): boolean {
  switch (move.type) {
    case MoveType.TableauToTableau:
      return applyTableauToTableau(state, move);
    case MoveType.TableauToFoundation:
      return applyTableauToFoundation(state, move);
    case MoveType.FoundationToTableau:
      return applyFoundationToTableau(state, move);
    case MoveType.Flip:
      return applyFlip(state, move);
    default:
      return false;
  }
}

/**
 * Apply tableau to tableau move
 */
function applyTableauToTableau(
  state: GameState,
  move: TableauToTableauMove
): boolean {
  const sourcePile = state.tableau[move.fromPile];
  const targetPile = state.tableau[move.toPile];

  // Get the movable stack
  const stack = getMovableStack(state, move.fromPile, move.cardIndex);
  if (!stack) {
    return false;
  }

  // Validate drop
  if (!canDropOnTableau(stack, targetPile)) {
    return false;
  }

  // Apply move
  const cardsToMove = sourcePile.splice(move.cardIndex);
  targetPile.push(...cardsToMove);

  // Auto-flip: if source pile has cards left and top card is face-down, flip it
  if (sourcePile.length > 0) {
    const topCard = sourcePile[sourcePile.length - 1];
    if (!topCard.faceUp) {
      topCard.faceUp = true;
    }
  }

  // Record move
  state.lastMove = move;
  state.moveHistory.push(move);

  return true;
}

/**
 * Apply tableau to foundation move
 */
function applyTableauToFoundation(
  state: GameState,
  move: TableauToFoundationMove
): boolean {
  const sourcePile = state.tableau[move.fromPile];
  const foundationPile = state.foundations[move.toFoundation];

  if (sourcePile.length === 0) {
    return false;
  }

  const card = sourcePile[sourcePile.length - 1];

  // Validate drop
  if (!canDropOnFoundation(card, foundationPile)) {
    return false;
  }

  // Apply move
  const movedCard = sourcePile.pop()!;
  foundationPile.push(movedCard);

  // Auto-flip: if source pile has cards left and top card is face-down, flip it
  if (sourcePile.length > 0) {
    const topCard = sourcePile[sourcePile.length - 1];
    if (!topCard.faceUp) {
      topCard.faceUp = true;
    }
  }

  // Record move
  state.lastMove = move;
  state.moveHistory.push(move);

  return true;
}

/**
 * Apply foundation to tableau move
 */
function applyFoundationToTableau(
  state: GameState,
  move: FoundationToTableauMove
): boolean {
  const foundationPile = state.foundations[move.fromFoundation];
  const targetPile = state.tableau[move.toPile];

  if (foundationPile.length === 0) {
    return false;
  }

  const card = foundationPile[foundationPile.length - 1];

  // Validate drop (single card as a stack)
  if (!canDropOnTableau([card], targetPile)) {
    return false;
  }

  // Apply move
  const movedCard = foundationPile.pop()!;
  targetPile.push(movedCard);

  // Record move
  state.lastMove = move;
  state.moveHistory.push(move);

  return true;
}

/**
 * Apply flip move
 */
function applyFlip(state: GameState, move: FlipMove): boolean {
  const pile = state.tableau[move.pile];

  if (pile.length === 0) {
    return false;
  }

  const topCard = pile[pile.length - 1];

  if (topCard.faceUp) {
    return false; // Already face-up
  }

  topCard.faceUp = true;

  // Record move (for undo)
  state.lastMove = move;
  state.moveHistory.push(move);

  return true;
}

/**
 * Check if the game is won (all cards in foundations)
 */
export function isWin(state: GameState): boolean {
  const totalInFoundations = state.foundations.reduce(
    (sum, pile) => sum + pile.length,
    0
  );
  return totalInFoundations === 52;
}

/**
 * Undo the last move (single-step undo)
 * Mutates state, returns true if undo was successful
 */
export function undo(state: GameState): boolean {
  if (!state.lastMove) {
    return false;
  }

  const move = state.lastMove;

  // Reverse the move
  switch (move.type) {
    case MoveType.TableauToTableau:
      return undoTableauToTableau(state, move);
    case MoveType.TableauToFoundation:
      return undoTableauToFoundation(state, move);
    case MoveType.FoundationToTableau:
      return undoFoundationToTableau(state, move);
    case MoveType.Flip:
      return undoFlip(state, move);
    default:
      return false;
  }
}

/**
 * Undo tableau to tableau move
 */
function undoTableauToTableau(
  state: GameState,
  move: TableauToTableauMove
): boolean {
  const sourcePile = state.tableau[move.fromPile];
  const targetPile = state.tableau[move.toPile];

  // Count how many cards were moved (from cardIndex to end)
  const moveCount = sourcePile.length - move.cardIndex;

  if (targetPile.length < moveCount) {
    return false; // Can't undo if cards aren't there
  }

  // Move cards back
  const cardsToReturn = targetPile.splice(targetPile.length - moveCount);
  sourcePile.push(...cardsToReturn);

  // Clear last move
  state.lastMove = null;
  state.moveHistory.pop();

  return true;
}

/**
 * Undo tableau to foundation move
 */
function undoTableauToFoundation(
  state: GameState,
  move: TableauToFoundationMove
): boolean {
  const sourcePile = state.tableau[move.fromPile];
  const foundationPile = state.foundations[move.toFoundation];

  if (foundationPile.length === 0) {
    return false;
  }

  // Move card back
  const card = foundationPile.pop()!;
  sourcePile.push(card);

  // Clear last move
  state.lastMove = null;
  state.moveHistory.pop();

  return true;
}

/**
 * Undo foundation to tableau move
 */
function undoFoundationToTableau(
  state: GameState,
  move: FoundationToTableauMove
): boolean {
  const foundationPile = state.foundations[move.fromFoundation];
  const targetPile = state.tableau[move.toPile];

  if (targetPile.length === 0) {
    return false;
  }

  // Move card back
  const card = targetPile.pop()!;
  foundationPile.push(card);

  // Clear last move
  state.lastMove = null;
  state.moveHistory.pop();

  return true;
}

/**
 * Undo flip move
 */
function undoFlip(state: GameState, move: FlipMove): boolean {
  const pile = state.tableau[move.pile];

  if (pile.length === 0) {
    return false;
  }

  const topCard = pile[pile.length - 1];

  if (!topCard.faceUp) {
    return false; // Already face-down
  }

  topCard.faceUp = false;

  // Clear last move
  state.lastMove = null;
  state.moveHistory.pop();

  return true;
}
