/**
 * Core type definitions for the Cards game engine
 */

/**
 * Card suits
 * 0 = Spade (Black)
 * 1 = Heart (Red)
 * 2 = Club (Black)
 * 3 = Diamond (Red)
 */
export type Suit = 0 | 1 | 2 | 3;

/**
 * Card ranks
 * 0 = Ace
 * 1-8 = 2-9
 * 9 = 10
 * 10 = Jack
 * 11 = Queen
 * 12 = King
 */
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * A playing card
 */
export interface Card {
  /** Unique identifier for this card (suit * 13 + rank) */
  id: number;
  /** Card suit (0-3) */
  suit: Suit;
  /** Card rank (0-12) */
  rank: Rank;
  /** Whether the card is face-up (visible) */
  faceUp: boolean;
}

/**
 * A pile of cards (tableau or foundation)
 */
export type Pile = Card[];

/**
 * Move types
 */
export const MoveType = {
  /** Move card(s) from tableau to tableau */
  TableauToTableau: "tableau-to-tableau",
  /** Move card from tableau to foundation */
  TableauToFoundation: "tableau-to-foundation",
  /** Move card from foundation to tableau */
  FoundationToTableau: "foundation-to-tableau",
  /** Flip a card face-up (automatic) */
  Flip: "flip",
} as const;

export type MoveType = (typeof MoveType)[keyof typeof MoveType];

/**
 * Base move interface
 */
export interface BaseMove {
  type: MoveType;
}

/**
 * Move from tableau to tableau
 */
export interface TableauToTableauMove extends BaseMove {
  type: typeof MoveType.TableauToTableau;
  fromPile: number; // 0-7
  toPile: number; // 0-7
  /** Index of the first card being moved in the source pile */
  cardIndex: number;
}

/**
 * Move from tableau to foundation
 */
export interface TableauToFoundationMove extends BaseMove {
  type: typeof MoveType.TableauToFoundation;
  fromPile: number; // 0-7
  toFoundation: number; // 0-3;
}

/**
 * Move from foundation to tableau
 */
export interface FoundationToTableauMove extends BaseMove {
  type: typeof MoveType.FoundationToTableau;
  fromFoundation: number; // 0-3
  toPile: number; // 0-7
}

/**
 * Flip a card face-up
 */
export interface FlipMove extends BaseMove {
  type: typeof MoveType.Flip;
  pile: number; // 0-7
}

/**
 * Union type of all possible moves
 */
export type Move =
  | TableauToTableauMove
  | TableauToFoundationMove
  | FoundationToTableauMove
  | FlipMove;

/**
 * RNG state for deterministic random number generation
 */
export interface RngState {
  /** Current seed value */
  seed: number;
  /** Internal state for Alea (s0, s1, s2, c) */
  state: number[];
}

/**
 * Complete game state
 */
export interface GameState {
  /** 8 tableau piles with varying capacities */
  tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile, Pile];
  /** 4 foundation piles (one per suit) */
  foundations: [Pile, Pile, Pile, Pile];
  /** Current seed */
  seed: number;
  /** RNG state for reproducibility */
  rngState: RngState;
  /** Move history for undo */
  moveHistory: Move[];
  /** Last move that can be undone (single-step undo) */
  lastMove: Move | null;
}

/**
 * Helper to check if a suit is black
 */
export function isBlack(suit: Suit): boolean {
  return suit === 0 || suit === 2; // Spade or Club
}

/**
 * Helper to check if a suit is red
 */
export function isRed(suit: Suit): boolean {
  return suit === 1 || suit === 3; // Heart or Diamond
}

/**
 * Helper to check if two suits are opposite colors
 */
export function areOppositeColors(suit1: Suit, suit2: Suit): boolean {
  return isBlack(suit1) !== isBlack(suit2);
}

/**
 * Tableau pile capacities (initial card counts)
 */
export const TABLEAU_CAPACITIES = [3, 4, 5, 6, 7, 8, 9, 10] as const;

/**
 * Number of face-down cards per pile initially
 */
export const FACE_DOWN_COUNT = 3;
