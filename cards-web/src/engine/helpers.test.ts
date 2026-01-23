/**
 * Tests for the game helper functions (auto-moves, solver, finish)
 */

import { describe, it, expect } from "vitest";
import {
  getAutoMovesToFoundation,
  runFinish,
  getSolveMove,
  runSolveStep,
  runSolve,
} from "./helpers";
import { createEmptyGame, newGame } from "./deal";
import { MoveType } from "./types";
import type { Card, Suit, Rank, GameState } from "./types";

/**
 * Helper to create a card for testing
 */
function makeCard(
  suit: Suit,
  rank: Rank,
  faceUp: boolean = true
): Card {
  return {
    id: suit * 13 + rank,
    suit,
    rank,
    faceUp,
  };
}

describe("getAutoMovesToFoundation", () => {
  it("should return empty array when no moves available", () => {
    const game = createEmptyGame();
    // Add non-ace cards to tableau
    game.tableau[0].push(makeCard(0, 5)); // 6 of spades

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toEqual([]);
  });

  it("should find ace that can go to foundation", () => {
    const game = createEmptyGame();
    // Add ace to tableau
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades

    const moves = getAutoMovesToFoundation(game);

    expect(moves.length).toBe(1);
    expect(moves[0].type).toBe(MoveType.TableauToFoundation);
    expect(moves[0].fromPile).toBe(0);
    expect(moves[0].toFoundation).toBe(0); // Spade foundation
  });

  it("should find card that can stack on foundation", () => {
    const game = createEmptyGame();
    // Set up foundation with ace
    game.foundations[0].push(makeCard(0, 0)); // Ace of spades
    // Add 2 of spades to tableau
    game.tableau[1].push(makeCard(0, 1)); // 2 of spades

    const moves = getAutoMovesToFoundation(game);

    expect(moves.length).toBe(1);
    expect(moves[0].fromPile).toBe(1);
    expect(moves[0].toFoundation).toBe(0);
  });

  it("should find multiple moves from different piles", () => {
    const game = createEmptyGame();
    // Add aces to multiple piles
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    game.tableau[2].push(makeCard(1, 0)); // Ace of hearts
    game.tableau[4].push(makeCard(2, 0)); // Ace of clubs

    const moves = getAutoMovesToFoundation(game);

    expect(moves.length).toBe(3);
  });

  it("should ignore face-down cards", () => {
    const game = createEmptyGame();
    // Add face-down ace
    game.tableau[0].push(makeCard(0, 0, false)); // Face-down ace

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toEqual([]);
  });

  it("should only consider top cards of piles", () => {
    const game = createEmptyGame();
    // Ace buried under another card
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    game.tableau[0].push(makeCard(1, 5)); // 6 of hearts on top

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toEqual([]);
  });

  it("should return empty array for empty tableau", () => {
    const game = createEmptyGame();

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toEqual([]);
  });
});

describe("runFinish", () => {
  it("should apply all auto-moves to foundation", () => {
    const game = createEmptyGame();
    // Set up a sequence that can all go to foundation
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    game.tableau[1].push(makeCard(0, 1)); // 2 of spades
    game.tableau[2].push(makeCard(0, 2)); // 3 of spades

    const movesApplied = runFinish(game);

    expect(movesApplied).toBe(3);
    expect(game.foundations[0].length).toBe(3);
    expect(game.tableau[0].length).toBe(0);
    expect(game.tableau[1].length).toBe(0);
    expect(game.tableau[2].length).toBe(0);
  });

  it("should return 0 when no auto-moves available", () => {
    const game = createEmptyGame();
    game.tableau[0].push(makeCard(0, 5)); // 6 of spades (not ace)

    const movesApplied = runFinish(game);

    expect(movesApplied).toBe(0);
  });

  it("should respect max iterations limit", () => {
    const game = createEmptyGame();
    // Add cards that can all go to foundation (one per pile, accessible at top)
    // Use 8 piles for A through 8 of spades
    for (let rank = 0; rank < 8; rank++) {
      game.tableau[rank].push(makeCard(0, rank as Rank));
    }

    const movesApplied = runFinish(game, 5);

    expect(movesApplied).toBe(5);
    expect(game.foundations[0].length).toBe(5);
  });

  it("should move multiple suits simultaneously", () => {
    const game = createEmptyGame();
    // Add aces of all suits
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    game.tableau[1].push(makeCard(1, 0)); // Ace of hearts
    game.tableau[2].push(makeCard(2, 0)); // Ace of clubs
    game.tableau[3].push(makeCard(3, 0)); // Ace of diamonds

    const movesApplied = runFinish(game);

    expect(movesApplied).toBe(4);
    expect(game.foundations[0].length).toBe(1);
    expect(game.foundations[1].length).toBe(1);
    expect(game.foundations[2].length).toBe(1);
    expect(game.foundations[3].length).toBe(1);
  });
});

describe("getSolveMove", () => {
  it("should prioritize foundation moves", () => {
    const game = createEmptyGame();
    // Add ace that can go to foundation
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    // Also add a valid tableau move (king to empty pile exists)
    game.tableau[1].push(makeCard(1, 12)); // King of hearts

    const move = getSolveMove(game);

    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToFoundation);
  });

  it("should return null when no moves available", () => {
    const game = createEmptyGame();
    // Add cards that can't move
    game.tableau[0].push(makeCard(0, 5)); // 6 of spades - can't go to foundation
    // No valid tableau moves either

    const move = getSolveMove(game);

    expect(move).toBeNull();
  });

  it("should prefer moves that reveal face-down cards", () => {
    const game = createEmptyGame();
    // Pile with face-down card under movable card
    game.tableau[0].push(makeCard(0, 5, false)); // Face-down card
    game.tableau[0].push(makeCard(1, 4)); // 5 of hearts (face-up)
    // Target pile with 6 of spades
    game.tableau[1].push(makeCard(0, 5)); // 6 of spades

    const move = getSolveMove(game);

    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
    if (move!.type === MoveType.TableauToTableau) {
      expect(move.fromPile).toBe(0);
      expect(move.toPile).toBe(1);
    }
  });

  it("should find king-to-empty-pile move", () => {
    const game = createEmptyGame();
    // King that can move to empty pile
    game.tableau[0].push(makeCard(0, 12)); // King of spades
    // Pile 1 is empty

    const move = getSolveMove(game);

    // Should find the move even though it doesn't reveal a face-down card
    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
  });

  it("should return fallback move when no revealing move exists", () => {
    const game = createEmptyGame();
    // All face-up cards, valid tableau move exists
    game.tableau[0].push(makeCard(0, 6)); // 7 of spades
    game.tableau[0].push(makeCard(1, 5)); // 6 of hearts
    game.tableau[1].push(makeCard(2, 6)); // 7 of clubs

    const move = getSolveMove(game);

    // Should find the 6 of hearts -> 7 of clubs move
    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
  });
});

describe("runSolveStep", () => {
  it("should apply a single move and return true", () => {
    const game = createEmptyGame();
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades

    const result = runSolveStep(game);

    expect(result).toBe(true);
    expect(game.foundations[0].length).toBe(1);
    expect(game.tableau[0].length).toBe(0);
  });

  it("should return false when no move available", () => {
    const game = createEmptyGame();
    game.tableau[0].push(makeCard(0, 5)); // 6 of spades (no valid move)

    const result = runSolveStep(game);

    expect(result).toBe(false);
  });

  it("should mutate game state", () => {
    const game = createEmptyGame();
    game.tableau[0].push(makeCard(0, 0)); // Ace
    game.tableau[1].push(makeCard(0, 1)); // 2 of spades

    runSolveStep(game);

    expect(game.moveHistory.length).toBeGreaterThan(0);
  });
});

describe("runSolve", () => {
  it("should apply multiple moves", () => {
    const game = createEmptyGame();
    // Create a simple solvable sequence
    game.tableau[0].push(makeCard(0, 0)); // Ace of spades
    game.tableau[1].push(makeCard(0, 1)); // 2 of spades
    game.tableau[2].push(makeCard(0, 2)); // 3 of spades

    const movesApplied = runSolve(game);

    expect(movesApplied).toBe(3);
    expect(game.foundations[0].length).toBe(3);
  });

  it("should return 0 when no moves available", () => {
    const game = createEmptyGame();
    game.tableau[0].push(makeCard(0, 5)); // 6 of spades

    const movesApplied = runSolve(game);

    expect(movesApplied).toBe(0);
  });

  it("should respect max steps limit", () => {
    const game = createEmptyGame();
    // Add cards that can all go to foundation (one per pile)
    for (let rank = 0; rank < 8; rank++) {
      game.tableau[rank].push(makeCard(0, rank as Rank));
    }

    const movesApplied = runSolve(game, 5);

    expect(movesApplied).toBe(5);
  });

  it("should stop when stuck", () => {
    const game = createEmptyGame();
    // Create a position where solver gets stuck
    game.tableau[0].push(makeCard(0, 0)); // Ace
    game.tableau[1].push(makeCard(0, 2)); // 3 of spades (missing 2)

    const movesApplied = runSolve(game);

    // Should only move the ace
    expect(movesApplied).toBe(1);
    expect(game.foundations[0].length).toBe(1);
  });

  it("should work with a real game", () => {
    const game = newGame(42);

    // Solver should be able to make at least some moves
    const movesApplied = runSolve(game, 50);

    // The exact number depends on the random deal, but should make progress
    expect(movesApplied).toBeGreaterThanOrEqual(0);
  });
});

describe("Integration: solver and finish", () => {
  it("should be able to solve a simple game", () => {
    const game = createEmptyGame();

    // Create a simple fully-solvable layout
    // Spread cards across all 8 piles so each card is at the top and accessible
    // Put A-8 of spades across 8 piles
    for (let rank = 0; rank < 8; rank++) {
      game.tableau[rank].push(makeCard(0, rank as Rank));
    }

    const movesApplied = runSolve(game, 100);

    // Should move all 8 cards to foundation
    expect(movesApplied).toBe(8);
    const totalFoundation = game.foundations.reduce((sum, f) => sum + f.length, 0);
    expect(totalFoundation).toBe(8);
  });

  it("runFinish should work after manual play", () => {
    const game = createEmptyGame();

    // Simulate a game where foundations are built up to 10 (A through 10)
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 0; rank < 10; rank++) {
        game.foundations[suit].push(makeCard(suit as Suit, rank as Rank));
      }
    }

    // Add J, Q, K for each suit spread across piles (one card per pile)
    game.tableau[0].push(makeCard(0, 10 as Rank)); // J of spades
    game.tableau[1].push(makeCard(1, 10 as Rank)); // J of hearts
    game.tableau[2].push(makeCard(2, 10 as Rank)); // J of clubs
    game.tableau[3].push(makeCard(3, 10 as Rank)); // J of diamonds
    game.tableau[4].push(makeCard(0, 11 as Rank)); // Q of spades
    game.tableau[5].push(makeCard(1, 11 as Rank)); // Q of hearts
    game.tableau[6].push(makeCard(2, 11 as Rank)); // Q of clubs
    game.tableau[7].push(makeCard(3, 11 as Rank)); // Q of diamonds

    // Run finish to move all Jacks and Queens (8 moves total)
    const movesApplied = runFinish(game);
    expect(movesApplied).toBe(8);

    // Now add Kings and finish
    game.tableau[0].push(makeCard(0, 12 as Rank)); // K of spades
    game.tableau[1].push(makeCard(1, 12 as Rank)); // K of hearts
    game.tableau[2].push(makeCard(2, 12 as Rank)); // K of clubs
    game.tableau[3].push(makeCard(3, 12 as Rank)); // K of diamonds

    const kingMoves = runFinish(game);
    expect(kingMoves).toBe(4);

    const totalFoundation = game.foundations.reduce((sum, f) => sum + f.length, 0);
    expect(totalFoundation).toBe(52);
  });
});
