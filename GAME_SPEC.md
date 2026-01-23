# Cards Game Specification

## Overview

This document specifies the rules and behavior of the Cards solitaire game based on the legacy implementation.

## Card Representation

### Card Structure

Each card has:

- **suit**: 0-3 (0=Spade, 1=Heart, 2=Club, 3=Diamond)
- **rank**: 0-12 (0=Ace, 1-8=2-9, 9=10, 10=Jack, 11=Queen, 12=King)
- **faceUp**: boolean (true if card is visible, false if face-down)

### Color Groups

- **Black**: Spade (0), Club (2)
- **Red**: Heart (1), Diamond (3)

## Pile Types

### Tableau Piles (8 piles)

- **Purpose**: Main play area where cards are dealt and stacked
- **Initial capacities**: `[3, 4, 5, 6, 7, 8, 9, 10]` cards per pile (total 52 cards)
- **Face-down cards**: Initial deal has 3 cards face-down in each pile (so pile 0 starts with 3 cards, all face-down; pile 1 has 3 face-down and 1 face-up, etc.)
- **Position**: Displayed in a row at bottom of screen

### Foundation Piles (4 piles)

- **Purpose**: Target piles where cards are stacked by suit from Ace to King
- **One per suit**: Spade, Heart, Club, Diamond
- **Empty at start**: All foundation piles start empty
- **Position**: Displayed in a row near top of screen

### Drag Helper

- **Temporary pile**: Used during drag operations to hold the moving stack
- **Not persistent**: Only exists during active drag

## Random Number Generator (RNG)

### Implementation

The legacy uses the **Alea** RNG algorithm:

```javascript
function $alea() {
  // Alea PRNG implementation
  // State: s0, s1, s2, c
  // Formula: t = 2091639*s0 + c*2.3283064365386963e-10
  // Returns: deterministic sequence based on seed
}
```

### Seeding

- **SetRandSeed(v)**: Initializes RNG with specific seed value
- **Seed display**: Current seed is shown on screen
- **Seed storage**: Last seed stored in localStorage as "SeedIndex"

### RNG Parity Decision

**Decision: Use legacy Alea RNG for parity**

- Modern implementation uses the Alea PRNG to match legacy sequences
- Requirement: Deterministic per seed (same seed = same deal)

## Dealing Rules

### Deal Algorithm

```
1. Create deck of 52 cards (4 suits × 13 ranks)
2. Initialize RNG with seed
3. Initialize empty array for undealt cards
4. Add all 52 cards to undealt array
5. While undealt array is not empty:
   a. Pick random tableau pile index (0-7)
   b. If that pile length < capacity for that pile:
      i. Pick random card from undealt array
      ii. Add card to pile
      iii. Set faceUp = (pile.length > capacity - 3)
      iv. Remove card from undealt array
```

### Face-Up/Face-Down Rule

- **Face-down count**: First 3 cards in each pile are face-down
- **Face-up cards**: All cards beyond the first 3 are face-up
- **Formula**: `card.faceUp = (pileLength > capacity[pileIndex] - 3)`

### Auto-Flip Rule

- **Trigger**: When a face-down card becomes the top card of a tableau pile
- **Action**: Automatically flip it face-up
- **Timing**: Immediately after any move that exposes it

## Move Rules

### Tableau to Tableau

#### Valid Stack

A movable stack from a tableau pile must be:

1. **Contiguous**: All cards from the selected card to the top
2. **All face-up**: No face-down cards in the moving stack
3. **Alternating colors**: Each card must be opposite color from the card below it
4. **Descending rank**: Each card must be exactly 1 rank lower than the card below it

#### Drop Validation

A stack can be dropped on a tableau pile if:

1. **Target pile is empty**: Only Kings (rank 12) can be placed on empty piles
2. **Target pile has cards**:
   - Top card of target must be opposite color from bottom card of moving stack
   - Top card of target must be exactly 1 rank higher than bottom card of moving stack

#### Color Alternation Rule

- **Black suits**: Spade (0), Club (2)
- **Red suits**: Heart (1), Diamond (3)
- **Check**: `(card.suit == 0 || card.suit == 2) != (targetCard.suit == 0 || targetCard.suit == 2)`

### Tableau to Foundation

#### Valid Move

A card can move from tableau to foundation if:

1. **Only top card**: Only the top card of a tableau pile can move to foundation
2. **Foundation empty**: If foundation is empty, only Aces (rank 0) can be placed
3. **Foundation has cards**:
   - Card must be same suit as foundation
   - Card rank must be exactly 1 higher than current top card
   - Formula: `card.suit == foundation.suit && card.rank == foundationTop.rank + 1`

#### No Stack Moves

Stacks cannot move to foundations, only single cards.

### Foundation to Tableau

#### Valid Move

A card can move from foundation back to tableau following normal tableau rules:

- Must be opposite color from target pile's top card
- Must be exactly 1 rank lower than target pile's top card

## Helper Actions

### Finish

- **Purpose**: Automatically move all safe cards to foundations
- **Algorithm**:
  1. Loop through all tableau piles
  2. For each pile's top card:
     - Check if it can safely move to foundation
     - If yes, move it and repeat
  3. Continue until no more moves possible
- **Implementation**: Legacy uses 10ms setTimeout loop to animate moves

### Solve

- **Purpose**: Attempt to automatically complete the game
- **Algorithm** (Legacy heuristic approach):
  1. Try "Finish" first (safe foundation moves)
  2. If no finish moves, try smart tableau-to-tableau moves:
     - Prefer moves that free face-down cards
     - Avoid circular moves (track game state hashes)
  3. If stuck, try random legal moves
  4. Repeat with randomness until solved or truly stuck
- **Randomization**: Uses `Randomize()` between attempts for variation
- **Stop Condition**: Detects repetitive states to avoid infinite loops

### Undo

- **Scope**: Single-step undo (legacy implementation)
- **State Tracking**:
  - Stores last move: source pile, destination pile, cards moved
  - Only one undo available at a time
  - Making a new move clears previous undo state
- **Implementation**: Moves cards back from destination to source pile

## UI/UX Behaviors

### Hover/Target Highlighting

- **Delay**: 500ms delay before highlighting (legacy uses setTimeout)
- **Highlight**: Candidate drop targets are highlighted during drag
- **Visual**: Top card of valid target piles shows visual feedback

### Drag Return Behavior

- **Invalid drop**: If drop location is invalid, cards animate back to origin
- **Snap back**: Cards smoothly return to their original position

### Resize Behavior

- **Card dimensions**: Derive from viewport size
- **Formula (legacy)**:
  ```javascript
  width = Math.min(window.innerWidth, (4 * window.innerHeight) / 3);
  cardWidth = width / 9;
  cardHeight = (4 * cardWidth) / 3;
  overlap = Math.max(cardHeight / 5.1, window.innerHeight / 32);
  ```
- **Responsive**: Recalculate on window resize events

### Drag & Drop Mechanics

- **Mouse & Touch**: Support both pointer types
- **Pointer Events**: Use PointerEvent API for unified handling
- **Stack Preview**: Show dragging stack following pointer
- **Visual Feedback**: Highlight valid drop targets, show invalid state

## Keyboard Shortcuts

| Key | Action                    |
| --- | ------------------------- |
| `s` | Solve                     |
| `r` | Retry (restart same seed) |
| `n` | New (new seed)            |
| `f` | Finish                    |
| `u` | Undo                      |

## Win Condition

**Game is won when**: All 4 foundation piles have 13 cards each (all cards moved to foundations)

### Win Detection

```javascript
isWin =
  foundations[0].length +
    foundations[1].length +
    foundations[2].length +
    foundations[3].length ===
  52;
```

### Win Effect

- **Confetti**: Show confetti animation overlay
- **Trigger**: Automatically when win condition detected

## Seed Handling

### New Game

- **Seed generation**: `Date.now()` (milliseconds since epoch)
- **Storage**: Save to localStorage as "SeedIndex"
- **Display**: Show seed value on screen

### Retry

- **Use current seed**: Restart game with same seed value
- **Reset state**: Clear all moves, re-deal cards

### Seed Display

- **Location**: Top of screen
- **Format**: Numeric timestamp value
- **Purpose**: Allow players to replay specific games

## Golden Test Seeds

For testing exact parity (if needed), record initial layouts for these seeds:

- TBD: Will be added during M2 implementation
- At least 3-5 seeds with their full initial tableau layouts

## Implementation Notes

### Deterministic Requirements

- **Same seed, same game**: Given the same seed, the game must deal identically
- **Move order**: Move history must be deterministic (no race conditions)
- **Solver**: Solver may use randomness but should be reproducible with same RNG seed

### Performance Considerations

- **Render optimization**: Avoid re-rendering entire board on every pointer move
- **Animation**: Use CSS transforms for smooth card movement
- **Hit testing**: Efficient rectangle intersection for drop target detection

## Differences from Standard Solitaire

This is a **variant** of classic solitaire with these key differences:

1. **8 tableau piles** instead of 7
2. **Variable capacities**: Piles have different starting capacities (3-10 cards)
3. **No stock/waste pile**: All 52 cards dealt at start
4. **Fixed face-down count**: Always 3 cards face-down per pile initially
