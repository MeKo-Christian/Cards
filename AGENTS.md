# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern reimplementation of a legacy Cards solitaire game (see ./legacy/) using Vite + React + TypeScript. This is a **variant** of standard solitaire with 8 tableau piles (instead of 7), variable initial capacities [3-10], and no stock/waste pile - all 52 cards are dealt at game start.

## Repository Structure

- **src/**: Vite + React + TypeScript application source
- **legacy/**: Legacy Delphi + web output (reference only, do not modify unless explicitly asked)
- **GAME_SPEC.md**: Complete gameplay rules and specifications
- **PLAN.md**: Milestone-based implementation checklist

## Development Commands

```bash
yarn install    # Install dependencies
yarn dev        # Development server (localhost:5173)
yarn build      # Build production bundle
yarn preview    # Preview production build
yarn test       # Run tests (Vitest)
yarn lint       # Lint code
yarn format     # Format code (Prettier)
yarn format:check
```

## Architecture: Pure Engine + React UI

### Game Engine (src/engine/)

The core game logic is a **pure, deterministic TypeScript engine** with no React dependencies. This architecture enables:

- Unit testing without UI concerns
- Deterministic behavior per seed
- Clear separation of game logic from presentation

**Key files:**

- `types.ts`: Core data structures (GameState, Card, Move types)
- `rng.ts`: Mulberry32 PRNG (deterministic per seed, NOT legacy RNG parity)
- `deal.ts`: Initial card dealing with tableau capacities [3,4,5,6,7,8,9,10]; last 3 cards face-up, rest face-down
- `moves.ts`: Move validation, `applyMove()`, and single-step `undo()`
- `helpers.ts`: Finish and Solve algorithms (simple heuristics)
- `index.ts`: Public API exports
- `engine.test.ts`: Vitest unit tests

**Engine behavior:**

- Functions mutate `GameState` in place (React layer clones for immutability)
- Auto-flip: when a face-down card becomes the top card, it flips automatically after any move
- Tableau moves require alternating colors (Black: Spade/Club, Red: Heart/Diamond) and descending rank
- Foundation moves require same suit + ascending rank by 1
- Only tableau top cards can move to foundations (no stack-to-foundation moves)
- Face-down cards: Last 3 cards face-up, all others face-down (formula: `capacity - 3` face-down)

### React UI Layer (src/)

**State management:**

- `hooks/useGame.ts`: Manages GameState, wraps engine mutations with `structuredClone()`, handles localStorage persistence of seed (`cards-last-seed`)
- `hooks/useLayout.ts`: Computes responsive card dimensions, overlap spacing, and positions based on viewport size

**Components:**

- `App.tsx`: Root component, owns pointer drag/drop logic, keyboard shortcuts (`n/r/f/s/u`), and win/confetti triggering
- `components/Card.tsx`: Individual card rendering
- `components/Tableau.tsx`: 8 tableau piles with dynamic overlap calculation
- `components/Foundations.tsx`: 4 foundation piles (one per suit)
- `components/TopBar.tsx`: Seed display + game control buttons
- `components/Confetti.tsx`: Canvas-based win animation

### Drag & Drop Architecture

Implemented in `App.tsx` using Pointer Events API:

1. `pointerdown`: Identify clicked card, compute movable stack
2. `pointermove`: Render dragging preview, compute valid drop targets
3. `pointerup`: Validate drop with engine rules, apply move or animate return
4. Uses pointer capture for reliable mouse + touch support

## Important Project Conventions

### Game Rules

- **Tableau to Tableau**: Moving stack must be contiguous, all face-up, alternating colors, descending rank. Empty piles accept Kings only.
- **Tableau to Foundation**: Only top card can move. Aces start foundations, then same-suit ascending by 1.
- **Auto-flip**: Newly exposed tableau top cards flip automatically after moves.
- **Undo**: Single-step only (matches legacy behavior).
- **Face-down cards**: Determined by formula `card.faceUp = (nextPileLength > capacity - 3)` during dealing.

### RNG & Determinism

- **No legacy RNG parity**: Uses Mulberry32 instead of Alea for simplicity
- **Deterministic per seed**: Same seed always produces same deal
- **Seed generation**: `Date.now()` for new games
- **Seed persistence**: Stored in localStorage as `cards-last-seed`

### Keyboard Shortcuts

- `n`: New game (new seed)
- `r`: Retry (restart same seed)
- `f`: Finish (auto-move safe cards to foundations)
- `s`: Solve (heuristic solver)
- `u`: Undo last move

### Accessibility

- Reduced motion setting stored as `cards-reduced-motion` in localStorage
- Respects system preference via `prefers-reduced-motion`

## Testing Strategy

**Unit tests (Vitest):**

- Located in `src/engine/engine.test.ts`
- Test dealing counts, pile sizes, color alternation, foundation rules, move validation
- Run with `yarn test`

**No golden seed tests:** Project explicitly chose NOT to require exact legacy RNG parity, focusing instead on correct rule implementation.

## Key Reference Documents

When modifying game behavior, always consult:

1. **GAME_SPEC.md**: Authoritative rules specification (dealing, moves, helpers)
2. **PLAN.md**: Implementation milestones and what's completed/remaining
3. **Engine tests**: `src/engine/engine.test.ts` for expected behavior

## Common Pitfalls

- **Don't ever modify legacy/**: Reference only, changes go in src/
- **Engine mutations**: Engine functions mutate in place; React layer must clone
- **Responsive layout**: Card dimensions derive from viewport via `useLayout()`, recalculated on resize
- **Face-down count**: Last 3 cards in each pile are face-up; all others are face-down (i.e., max(0, capacity - 3) face-down cards)
- **Capacity array**: `[3,4,5,6,7,8,9,10]` must sum to 52 cards
- **Prefer Delphi Code over JavaScript**: The JavaScript implementation is just a transpilation of the high level Delphi code.
