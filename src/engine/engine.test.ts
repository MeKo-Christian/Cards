/**
 * Tests for the game engine
 */

import { describe, it, expect } from "vitest";
import {
  newGame,
  createEmptyGame,
  getMovableStack,
  canDropOnTableau,
  canDropOnFoundation,
  applyMove,
  isWin,
  undo,
  MoveType,
  TABLEAU_CAPACITIES,
  FACE_DOWN_COUNT,
  areOppositeColors,
  isBlack,
  isRed,
} from "./index";
import type { Card, Suit, Rank } from "./index";

describe("Color helpers", () => {
  it("should identify black suits correctly", () => {
    expect(isBlack(0)).toBe(true); // Spade
    expect(isBlack(2)).toBe(true); // Club
    expect(isBlack(1)).toBe(false); // Heart
    expect(isBlack(3)).toBe(false); // Diamond
  });

  it("should identify red suits correctly", () => {
    expect(isRed(1)).toBe(true); // Heart
    expect(isRed(3)).toBe(true); // Diamond
    expect(isRed(0)).toBe(false); // Spade
    expect(isRed(2)).toBe(false); // Club
  });

  it("should identify opposite colors correctly", () => {
    expect(areOppositeColors(0, 1)).toBe(true); // Spade vs Heart
    expect(areOppositeColors(0, 3)).toBe(true); // Spade vs Diamond
    expect(areOppositeColors(2, 1)).toBe(true); // Club vs Heart
    expect(areOppositeColors(2, 3)).toBe(true); // Club vs Diamond
    expect(areOppositeColors(0, 2)).toBe(false); // Spade vs Club
    expect(areOppositeColors(1, 3)).toBe(false); // Heart vs Diamond
  });
});

describe("Dealing", () => {
  it("should deal 52 cards total", () => {
    const game = newGame(12345);

    const totalCards =
      game.tableau.reduce((sum, pile) => sum + pile.length, 0) +
      game.foundations.reduce((sum, pile) => sum + pile.length, 0);

    expect(totalCards).toBe(52);
  });

  it("should distribute cards according to capacities", () => {
    const game = newGame(12345);

    for (let i = 0; i < 8; i++) {
      expect(game.tableau[i].length).toBe(TABLEAU_CAPACITIES[i]);
    }
  });

  it("should have 3 face-down cards per pile", () => {
    const game = newGame(12345);

    for (let i = 0; i < 8; i++) {
      const pile = game.tableau[i];
      const faceDownCount = pile.filter((card) => !card.faceUp).length;
      expect(faceDownCount).toBe(FACE_DOWN_COUNT);
    }
  });

  it("should be deterministic for same seed", () => {
    const game1 = newGame(42);
    const game2 = newGame(42);

    for (let i = 0; i < 8; i++) {
      expect(game1.tableau[i].length).toBe(game2.tableau[i].length);

      for (let j = 0; j < game1.tableau[i].length; j++) {
        const card1 = game1.tableau[i][j];
        const card2 = game2.tableau[i][j];

        expect(card1.id).toBe(card2.id);
        expect(card1.suit).toBe(card2.suit);
        expect(card1.rank).toBe(card2.rank);
        expect(card1.faceUp).toBe(card2.faceUp);
      }
    }
  });

  it("should start with empty foundations", () => {
    const game = newGame(12345);

    for (let i = 0; i < 4; i++) {
      expect(game.foundations[i].length).toBe(0);
    }
  });
});

describe("Movable stacks", () => {
  it("should return null for face-down cards", () => {
    const game = newGame(12345);

    // Find a pile with face-down cards
    for (let i = 0; i < 8; i++) {
      const pile = game.tableau[i];
      const faceDownIndex = pile.findIndex((card) => !card.faceUp);

      if (faceDownIndex >= 0) {
        const stack = getMovableStack(game, i, faceDownIndex);
        expect(stack).toBeNull();
        return;
      }
    }
  });

  it("should return single card stack for top card", () => {
    const game = newGame(12345);

    // Get top card from any pile
    const pileIndex = 0;
    const pile = game.tableau[pileIndex];
    const topIndex = pile.length - 1;

    if (pile[topIndex].faceUp) {
      const stack = getMovableStack(game, pileIndex, topIndex);
      expect(stack).not.toBeNull();
      expect(stack!.length).toBe(1);
      expect(stack![0].id).toBe(pile[topIndex].id);
    }
  });
});

describe("Drop validation", () => {
  it("should allow King on empty tableau", () => {
    const king: Card = {
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    };

    expect(canDropOnTableau([king], [])).toBe(true);
  });

  it("should not allow non-King on empty tableau", () => {
    const queen: Card = {
      id: 11,
      suit: 0 as Suit,
      rank: 11 as Rank,
      faceUp: true,
    };

    expect(canDropOnTableau([queen], [])).toBe(false);
  });

  it("should allow opposite color and descending rank", () => {
    const redKing: Card = {
      id: 12,
      suit: 1 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    };
    const blackQueen: Card = {
      id: 11,
      suit: 0 as Suit,
      rank: 11 as Rank,
      faceUp: true,
    };

    expect(canDropOnTableau([blackQueen], [redKing])).toBe(true);
  });

  it("should not allow same color", () => {
    const redKing: Card = {
      id: 12,
      suit: 1 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    };
    const redQueen: Card = {
      id: 24,
      suit: 3 as Suit,
      rank: 11 as Rank,
      faceUp: true,
    };

    expect(canDropOnTableau([redQueen], [redKing])).toBe(false);
  });

  it("should allow Ace on empty foundation", () => {
    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };

    expect(canDropOnFoundation(ace, [])).toBe(true);
  });

  it("should allow same suit ascending rank on foundation", () => {
    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    const two: Card = {
      id: 1,
      suit: 0 as Suit,
      rank: 1 as Rank,
      faceUp: true,
    };

    expect(canDropOnFoundation(two, [ace])).toBe(true);
  });

  it("should not allow different suit on foundation", () => {
    const spadeAce: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    const heartTwo: Card = {
      id: 14,
      suit: 1 as Suit,
      rank: 1 as Rank,
      faceUp: true,
    };

    expect(canDropOnFoundation(heartTwo, [spadeAce])).toBe(false);
  });
});

describe("Win condition", () => {
  it("should detect win when all cards in foundations", () => {
    const game = createEmptyGame();

    // Manually fill foundations
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 0; rank < 13; rank++) {
        game.foundations[suit].push({
          id: suit * 13 + rank,
          suit: suit as Suit,
          rank: rank as Rank,
          faceUp: true,
        });
      }
    }

    expect(isWin(game)).toBe(true);
  });

  it("should not detect win when not all cards in foundations", () => {
    const game = newGame(12345);

    expect(isWin(game)).toBe(false);
  });
});

describe("Move application", () => {
  it("should apply tableau to foundation move", () => {
    const game = createEmptyGame();

    // Add ace to tableau
    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    const move = {
      type: MoveType.TableauToFoundation,
      fromPile: 0,
      toFoundation: 0,
    };

    const success = applyMove(game, move);

    expect(success).toBe(true);
    expect(game.tableau[0].length).toBe(0);
    expect(game.foundations[0].length).toBe(1);
    expect(game.foundations[0][0].id).toBe(ace.id);
  });

  it("should auto-flip exposed card after move", () => {
    const game = createEmptyGame();

    // Add face-down card and face-up king to tableau
    const faceDownCard: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: false,
    };
    const king: Card = {
      id: 12,
      suit: 0 as Suit,
      rank: 12 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(faceDownCard, king);

    // Move king to another empty pile
    const move = {
      type: MoveType.TableauToTableau,
      fromPile: 0,
      toPile: 1,
      cardIndex: 1,
    };

    const success = applyMove(game, move);

    expect(success).toBe(true);
    expect(game.tableau[0].length).toBe(1);
    expect(game.tableau[0][0].faceUp).toBe(true); // Should be auto-flipped
  });
});

describe("Undo", () => {
  it("should undo tableau to foundation move", () => {
    const game = createEmptyGame();

    // Add ace to tableau
    const ace: Card = {
      id: 0,
      suit: 0 as Suit,
      rank: 0 as Rank,
      faceUp: true,
    };
    game.tableau[0].push(ace);

    // Apply move
    const move = {
      type: MoveType.TableauToFoundation,
      fromPile: 0,
      toFoundation: 0,
    };
    applyMove(game, move);

    // Undo
    const undoSuccess = undo(game);

    expect(undoSuccess).toBe(true);
    expect(game.tableau[0].length).toBe(1);
    expect(game.foundations[0].length).toBe(0);
    expect(game.lastMove).toBeNull();
  });
});
