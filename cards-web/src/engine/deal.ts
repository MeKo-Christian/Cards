/**
 * Card dealing logic
 */

import { TABLEAU_CAPACITIES, FACE_DOWN_COUNT } from "./types";
import type { Card, GameState, Rank, Suit } from "./types";
import { createRng, nextInt } from "./rng";

/**
 * Create a standard 52-card deck
 */
function createDeck(): Card[] {
  const deck: Card[] = [];

  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 0; rank < 13; rank++) {
      deck.push({
        id: suit * 13 + rank,
        suit: suit as Suit,
        rank: rank as Rank,
        faceUp: false, // Will be set during dealing
      });
    }
  }

  return deck;
}

/**
 * Deal a new game with the given seed
 * Implements the legacy dealing algorithm:
 * 1. Create all 52 cards
 * 2. Randomly distribute to 8 tableau piles with capacities [3,4,5,6,7,8,9,10]
 * 3. First 3 cards in each pile are face-down, rest are face-up
 */
export function newGame(seed: number): GameState {
  const rngState = createRng(seed);

  // Create empty tableau and foundation piles
  const tableau: GameState["tableau"] = [[], [], [], [], [], [], [], []];
  const foundations: GameState["foundations"] = [[], [], [], []];

  // Create deck
  const undealtCards = createDeck();

  // Deal cards using the algorithm from legacy code
  while (undealtCards.length > 0) {
    // Pick random tableau pile
    const pileIndex = nextInt(rngState, 8);

    // Check if this pile can accept more cards
    if (tableau[pileIndex].length < TABLEAU_CAPACITIES[pileIndex]) {
      // Pick random card from undealt
      const cardIndex = nextInt(rngState, undealtCards.length);
      const card = undealtCards[cardIndex];

      // Determine if this card should be face-up
      // First FACE_DOWN_COUNT cards are face-down, rest are face-up
      const currentPileLength = tableau[pileIndex].length;
      card.faceUp = currentPileLength >= FACE_DOWN_COUNT;

      // Add card to pile
      tableau[pileIndex].push(card);

      // Remove from undealt
      undealtCards.splice(cardIndex, 1);
    }
  }

  return {
    tableau,
    foundations,
    seed,
    rngState,
    moveHistory: [],
    lastMove: null,
  };
}

/**
 * Create an empty game state (for testing)
 */
export function createEmptyGame(seed: number = Date.now()): GameState {
  return {
    tableau: [[], [], [], [], [], [], [], []],
    foundations: [[], [], [], []],
    seed,
    rngState: createRng(seed),
    moveHistory: [],
    lastMove: null,
  };
}
