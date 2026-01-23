/**
 * Tests for helper actions: finish & solve
 */

import { describe, it, expect } from "vitest";
import {
  getAutoMovesToFoundation,
  runFinish,
  getSolveMove,
  runSolveStep,
  runSolve,
} from "./helpers";
import { createEmptyGame, MoveType } from "./index";
import type { Card, Suit, Rank } from "./types";

describe("getAutoMovesToFoundation", () => {
  it("should return empty array when no moves available", () => {
    const game = createEmptyGame();
    const moves = getAutoMovesToFoundation(game);
    expect(moves).toEqual([]);
  });

  it("should find Ace move to empty foundation", () => {
    const game = createEmptyGame();

    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toHaveLength(1);
    expect(moves[0]).toEqual({
      type: MoveType.TableauToFoundation,
      fromPile: 0,
      toFoundation: 0,
    });
  });

  it("should find multiple Aces from different piles", () => {
    const game = createEmptyGame();

    // Spade Ace in pile 0
    game.tableau[0].push({
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    // Heart Ace in pile 1
    game.tableau[1].push({
      id: 13,
      suit: 1 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toHaveLength(2);
    expect(moves[0].fromPile).toBe(0);
    expect(moves[1].fromPile).toBe(1);
  });

  it("should find next rank move when foundation has cards", () => {
    const game = createEmptyGame();

    // Add Ace to foundation
    game.foundations[0].push({
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    // Add Two to tableau
    game.tableau[0].push({
      id: 1,
      suit: 0 as Suit,
      rank: 1 as Rank,
      faceUp: true,
    });

    const moves = getAutoMovesToFoundation(game);

    expect(moves).toHaveLength(1);
    expect(moves[0].toFoundation).toBe(0);
  });

  it("should skip empty piles", () => {
    const game = createEmptyGame();
    const moves = getAutoMovesToFoundation(game);
    expect(moves).toEqual([]);
  });

  it("should skip face-down cards", () => {
    const game = createEmptyGame();

    const faceDownAce: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: false,
    };
    game.tableau[0].push(faceDownAce);

    const moves = getAutoMovesToFoundation(game);
    expect(moves).toEqual([]);
  });

  it("should not include invalid moves (wrong rank)", () => {
    const game = createEmptyGame();

    // Add Ace to foundation
    game.foundations[0].push({
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    // Add Three (skipping Two) to tableau - invalid
    game.tableau[0].push({
      id: 2,
      suit: 0 as Suit,
      rank: 2 as Rank,
      faceUp: true,
    });

    const moves = getAutoMovesToFoundation(game);
    expect(moves).toEqual([]);
  });
});

describe("runFinish", () => {
  it("should return 0 when no moves available", () => {
    const game = createEmptyGame();
    const count = runFinish(game);
    expect(count).toBe(0);
  });

  it("should move single Ace to foundation", () => {
    const game = createEmptyGame();

    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    const count = runFinish(game);

    expect(count).toBe(1);
    expect(game.tableau[0]).toHaveLength(0);
    expect(game.foundations[0]).toHaveLength(1);
  });

  it("should move multiple cards in sequence", () => {
    const game = createEmptyGame();

    // Add Three, Two, Ace (top to bottom - Ace on top)
    game.tableau[0].push(
      {
        id: 2,
        suit: 0 as Suit,
        rank: 2 as Rank,
        faceUp: true,
      },
      {
        id: 1,
        suit: 0 as Suit,
        rank: 1 as Rank,
        faceUp: true,
      },
      {
        id: 0,
        suit: 0 as Suit,
        rank: 0 as Rank,
        faceUp: true,
      }
    );

    const count = runFinish(game);

    // Should move Ace, then Two, then Three
    expect(count).toBe(3);
    expect(game.tableau[0]).toHaveLength(0);
    expect(game.foundations[0]).toHaveLength(3);
  });

  it("should flip face-down cards before moving", () => {
    const game = createEmptyGame();

    const faceDownAce: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: false,
    };
    game.tableau[0].push(faceDownAce);

    const count = runFinish(game);

    expect(count).toBe(1);
    expect(game.foundations[0]).toHaveLength(1);
    expect(game.foundations[0][0].faceUp).toBe(true);
  });

  it("should not affect undo history", () => {
    const game = createEmptyGame();

    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    // Set previous move state
    game.lastMove = {
      type: MoveType.TableauToTableau,
      fromPile: 1,
      toPile: 2,
      cardIndex: 0,
    };
    game.moveHistory.push(game.lastMove);
    const previousHistoryLength = game.moveHistory.length;

    runFinish(game);

    // Undo history should be preserved
    expect(game.moveHistory).toHaveLength(previousHistoryLength);
    expect(game.lastMove).toEqual({
      type: MoveType.TableauToTableau,
      fromPile: 1,
      toPile: 2,
      cardIndex: 0,
    });
  });

  it("should stop at maxIterations limit", () => {
    const game = createEmptyGame();

    // Add 10 sequential cards in reverse order (0 on top)
    for (let i = 9; i >= 0; i--) {
      game.tableau[0].push({
        id: i,
        suit: 0 as Suit,
        rank: i as Rank,
        faceUp: true,
      });
    }

    const count = runFinish(game, 5);

    expect(count).toBe(5);
    expect(game.foundations[0]).toHaveLength(5);
    expect(game.tableau[0]).toHaveLength(5);
  });

  it("should handle multiple suits", () => {
    const game = createEmptyGame();

    // Add Aces for all suits
    for (let suit = 0; suit < 4; suit++) {
      game.tableau[suit].push({
        id: suit * 13,
        suit: suit as Suit,
        rank: 0 as Rank,
        faceUp: true,
      });
    }

    const count = runFinish(game);

    expect(count).toBe(4);
    expect(game.foundations[0]).toHaveLength(1);
    expect(game.foundations[1]).toHaveLength(1);
    expect(game.foundations[2]).toHaveLength(1);
    expect(game.foundations[3]).toHaveLength(1);
  });
});

describe("getSolveMove", () => {
  it("should return null when no moves available", () => {
    const game = createEmptyGame();
    const move = getSolveMove(game);
    expect(move).toBeNull();
  });

  it("should prioritize foundation moves", () => {
    const game = createEmptyGame();

    // Add Ace (foundation move available)
    game.tableau[0].push({
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    // Add King on empty pile (tableau move available)
    game.tableau[1].push({
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    });

    const move = getSolveMove(game);

    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToFoundation);
  });

  it("should find tableau move when no foundation moves", () => {
    const game = createEmptyGame();

    // Black Queen in pile 0
    game.tableau[0].push({
      id: 11,
      suit: 0 as Suit,
      rank: 11 as Rank,
      faceUp: true,
    });

    // Red King in pile 1 (empty pile accepts King)
    game.tableau[1].push({
      id: 25,
      suit: 1 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    });

    const move = getSolveMove(game);

    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
    if (move!.type === MoveType.TableauToTableau) {
      // Solver should move Queen onto King
      expect(move.fromPile).toBe(0);
      expect(move.toPile).toBe(1);
    }
  });

  it("should prioritize moves that reveal face-down cards", () => {
    const game = createEmptyGame();

    // Pile 0: face-down card + Red Queen
    game.tableau[0].push(
      {
        id: 0,
        suit: 0 as Suit,
        rank: 0 as Rank,
        faceUp: false,
      },
      {
        id: 24,
        suit: 1 as Suit,
        rank: 11 as Rank,
        faceUp: true,
      }
    );

    // Pile 1: Black King
    game.tableau[1].push({
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    });

    // Pile 2: Red Jack (could go on Queen, but doesn't reveal)
    game.tableau[2].push({
      id: 23,
      suit: 1 as Suit,
      rank: 10 as Rank,
      faceUp: true,
    });

    const move = getSolveMove(game);

    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
    if (move!.type === MoveType.TableauToTableau) {
      // Should prioritize Queen from pile 0 to King (reveals face-down)
      expect(move.fromPile).toBe(0);
      expect(move.cardIndex).toBe(1);
    }
  });

  it("should skip face-down cards when looking for moves", () => {
    const game = createEmptyGame();

    // Face-down King
    game.tableau[0].push({
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: false,
    });

    const move = getSolveMove(game);
    expect(move).toBeNull();
  });

  it("should find King-to-empty move", () => {
    const game = createEmptyGame();

    // King in pile 0 can move to empty pile 1
    game.tableau[0].push({
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    });

    const move = getSolveMove(game);

    // King can move to any empty pile
    expect(move).not.toBeNull();
    expect(move!.type).toBe(MoveType.TableauToTableau);
  });
});

describe("runSolveStep", () => {
  it("should return false when no moves available", () => {
    const game = createEmptyGame();
    const result = runSolveStep(game);
    expect(result).toBe(false);
  });

  it("should apply a move and return true", () => {
    const game = createEmptyGame();

    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    const result = runSolveStep(game);

    expect(result).toBe(true);
    expect(game.foundations[0]).toHaveLength(1);
  });
});

describe("runSolve", () => {
  it("should return 0 when no moves available", () => {
    const game = createEmptyGame();
    const count = runSolve(game);
    expect(count).toBe(0);
  });

  it("should solve simple sequence", () => {
    const game = createEmptyGame();

    // Add Two, Ace in reverse order (Ace on top)
    game.tableau[0].push(
      {
        id: 1,
        suit: 0 as Suit,
        rank: 1 as Rank,
        faceUp: true,
      },
      {
        id: 0,
        suit: 0 as Suit,
        rank: 0 as Rank,
        faceUp: true,
      }
    );

    const count = runSolve(game);

    // Should move Ace to foundation, then Two to foundation
    expect(count).toBeGreaterThan(0);
    expect(game.foundations[0].length).toBeGreaterThan(0);
  });

  it("should respect maxSteps limit", () => {
    const game = createEmptyGame();

    // Add many sequential cards
    for (let i = 0; i < 13; i++) {
      game.tableau[0].push({
        id: i,
        suit: 0 as Suit,
        rank: i as Rank,
        faceUp: true,
      });
    }

    const count = runSolve(game, 5);

    expect(count).toBe(5);
  });

  it("should stop when no more moves available", () => {
    const game = createEmptyGame();

    // Add just one Ace
    game.tableau[0].push({
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    });

    // Add unrelated card
    game.tableau[1].push({
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    });

    const count = runSolve(game);

    // Should move Ace and King-to-empty, then stop
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
