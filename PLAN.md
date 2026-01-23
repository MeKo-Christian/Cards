# Cards (Legacy → Vite + React + TS) — Implementation TODO Plan

Date: 2026-01-21

This file is a task-first checklist. Every item is meant to be small enough to implement and verify in one sitting.

## Project goal

- Ship a modern web version of the legacy Cards game (Vite + React + TypeScript + Yarn Berry).
- Match legacy gameplay and feel: rules, layout, mouse/touch drag, keyboard shortcuts, finish/solve/undo, win confetti.
- Keep the codebase maintainable: pure game engine, clear UI, testable rules.

## Current state (already done)

- [x] Scaffolded Vite + React + TS app in [cards-web](cards-web).
- [x] Legacy playable build present in [legacy/Output/Web/www](legacy/Output/Web/www).

## What works (as of 2026-01-21)

- [x] Game renders on initial load with a random seed.
- [x] New starts a new game with a new seed.
- [x] Retry restarts the same seed.
- [x] Undo reverses the last move.
- [x] Layout is responsive and adapts to window resize.
- [x] Cards display correctly with proper suits, ranks, and colors.
- [x] Foundations show empty state with suit placeholders.
- [x] Tableau shows stacked cards with proper overlap.
- [x] UI is ready for M4 (drag & drop interactions).

## Baseline features to match (legacy)

### Controls

- Buttons: New, Retry, Finish, Solve, Undo.
- Keyboard: `s` solve, `r` retry, `n` new, `f` finish, `u` undo.
- Drag & drop: mouse + touch (drag stacks too).

### Game layout

- 4 foundations (one per suit), build A→K.
- 8 tableau piles, initial capacities `[3,4,5,6,7,8,9,10]`.
- Seed displayed on screen.

### Effects

- Confetti overlay when you win (use react-confetti or similar).

## Milestones (ordered) with bite-size TODOs

### M0 — Tooling baseline (keep it boring)

Goal: installs and scripts are stable and repeatable.

- [x] Verify `yarn --cwd cards-web dev` works after deleting `cards-web/node_modules`.
- [x] Verify `yarn --cwd cards-web build` works.
- [x] Decide test stack (recommended: Vitest).
- [x] Add a `test` script (even if empty initially).
- [x] Decide formatting approach (none vs Prettier).

Done when:

- [x] A clean clone can run dev + build without manual steps.

### M1 — Legacy spec extraction (lock the rules)

Goal: turn legacy behavior into a written spec + test vectors.

#### Inputs and outputs

- [x] Write down the exact pile types: tableau (8), foundation (4), plus any "helper" piles used during drag.
- [x] Define card representation: suit, rank, faceUp.

#### Dealing + RNG

- [x] Locate the legacy RNG function used for dealing (`$alea` in `Cards.js`).
- [x] Decide: exact RNG parity required? (Yes/No)
- [x] If "No": define acceptance as "deterministic per seed, not identical to legacy".

#### Move rules (tableau)

- [x] Specify "alternate colors" exactly (spade/club black, heart/diamond red).
- [x] Specify stack move legality: when can you move multiple cards, what constitutes a valid moving stack.
- [x] Specify empty tableau rule (Kings only).
- [x] Specify flip rule: when a face-down top card becomes exposed, it flips.

#### Move rules (foundation)

- [x] Specify foundation rule: same suit + ascending by 1.
- [x] Specify whether only top tableau cards can move to foundation (and whether stack-to-foundation exists).

#### UI/UX behaviors

- [x] Specify hover/target highlighting (legacy highlights a candidate after delay).
- [x] Specify drag return behavior when drop is invalid.
- [x] Specify Resize behavior: how card sizes derive from viewport.

#### Helper actions

- [x] Specify Finish behavior (auto-move until stuck).
- [x] Specify Solve behavior (legacy heuristic + randomness vs new definition).
- [x] Specify Undo scope (single-step vs multi-step; legacy looks like single-step).

Done when:

- [x] There is a written rules spec + at least a few seed fixtures.

### M2 — Pure TypeScript game engine (no React)

Goal: implement a deterministic engine you can unit test.

#### Data model

- [x] Create `GameState` type (tableau[8], foundations[4], seed, rngState, moveHistory).
- [x] Create `Card` type (id, suit, rank, faceUp).
- [x] Define `Move` type(s) (tableau→tableau, tableau→foundation, flip, auto-move).

#### RNG

- [x] Implement `createRng(seed)`.
- [x] Implement `nextInt(max)`.
- [x] Not matching legacy: using Mulberry32 instead of Alea for simplicity.

#### Deal

- [x] Implement `newGame(seed)`.
- [x] Deal 52 cards into 8 tableau piles respecting capacities `[3..10]`.
- [x] Set initial `faceUp` states to match legacy (write a test for it).

#### Move generation

- [x] Implement `getMovableStack(state, tableauIndex, cardIndex)`.
- [x] Implement `canDropOnTableau(movingTopCard, targetTopCardOrEmpty)`.
- [x] Implement `canDropOnFoundation(card, foundationTopCardOrEmpty)`.

#### Apply moves

- [x] Implement `applyMove(state, move)`.
- [x] After applying, auto-flip exposed top cards when required.
- [x] Track move history for undo.

#### Win condition

- [x] Implement `isWin(state)`.

#### Undo

- [x] Implement single-step `undo(state)`.
- [x] Decide whether to extend to multi-step (optional): staying with single-step to match legacy.

#### Tests

- [x] Add unit tests for: dealing counts, pile sizes, color alternation rule, foundation rule.
- [x] Not adding golden tests (not requiring exact RNG parity).

Done when:

- [x] Engine passes tests and can play through a few moves in tests.

### M3 — React UI: render a board from `GameState`

Goal: display the game state and allow clicking buttons (without drag yet).

#### App structure

- [x] Create `GameProvider` or `useGame()` hook managing `GameState`.
- [x] Render top bar: seed + buttons.
- [x] Render foundations row.
- [x] Render tableau row.

#### Card rendering

- [x] Render face-up card with suit/rank.
- [x] Render face-down card back.
- [x] Ensure cards are positioned like stacks (overlap) and responsive.

#### Responsiveness

- [x] Implement a `useLayout()` hook to compute card width/height and overlap.
- [x] Recompute layout on resize.

Done when:

- [x] A new game renders and resizes correctly.

### M4 — Interactions: pointer drag & drop (mouse + touch)

Goal: moving cards feels right.

#### Pointer mechanics

- [x] Use Pointer Events (`pointerdown/move/up`) with pointer capture.
- [x] Determine drag start: identify clicked card + compute movable stack.
- [x] Render a dragging “stack preview” following the pointer.

#### Hit testing / drop targets

- [x] Compute candidate tableau drop target under pointer.
- [x] Compute candidate foundation drop target under pointer.
- [x] Validate drop with engine rules.

#### Drop behavior

- [x] If valid: dispatch move(s) into engine.
- [x] If invalid: animate back to origin (or snap back).

#### Visual affordances

- [x] Highlight valid target during drag.
- [x] Optional: legacy-like delayed highlight when hovering.

#### Keyboard

- [x] Map `n/r/f/s/u` to New/Retry/Finish/Solve/Undo.

Done when:

- [x] Desktop + mobile can drag single cards and stacks reliably.

### M5 — Feature parity: Finish, Solve, Confetti

Goal: match the legacy “quality-of-life” helpers.

#### Finish

- [x] Implement `getAutoMovesToFoundation(state)`.
- [x] Implement `runFinish(state)` that loops until no more moves.
- [x] Ensure UI remains responsive while looping (chunk with `setTimeout` if needed).

#### Solve

- [ ] Decide solve definition:
  - [ ] Option A: replicate legacy heuristic/random solver.
  - [x] Option B: deterministic solver (may be expensive).
- [x] Implement a first “solver step” function that attempts one improvement.
- [x] Add stop conditions (avoid infinite loops).
- [ ] If heavy: move solving into a Web Worker (optional).

#### Confetti

- [x] Implement a canvas-based confetti overlay component.
- [x] Trigger confetti on win.
- [x] Add reduced-motion toggle (optional but recommended).

#### Seed handling

- [x] New: create new seed and start a new game.
- [x] Retry: restart the same seed.
- [x] Persist last seed in localStorage.

Done when:

- [ ] Finish and Solve do something useful, and winning shows confetti.

### M6 — Quality, polish, release

Goal: ship something robust.

#### Accessibility

- [ ] Add reduced motion setting.
- [ ] Ensure buttons are keyboard-focusable and readable.
- [ ] Consider a minimal non-drag interaction path (optional).

#### Performance

- [ ] Avoid re-rendering the whole board every pointer move.
- [ ] Memoize layout computations.

#### Assets / branding

- [ ] Reuse legacy icons from [legacy/Output/Web/www/Icons](legacy/Output/Web/www/Icons).
- [ ] Add favicon + web manifest.

#### Security / deploy

- [ ] Remove legacy-style `unsafe-eval` assumptions; keep production CSP-friendly.
- [ ] Decide deployment target and write deploy steps.

Done when:

- [ ] Production build is stable and deployable.

## Decisions (make early)

- [ ] RNG parity: must deals match legacy exactly? (Yes/No)
- [ ] Rendering: DOM+SVG (recommended) vs canvas.
- [ ] Solve behavior: legacy-like heuristic vs deterministic solver.
- [ ] Undo: single-step (match legacy) vs multi-step.

## Risks (and simple mitigations)

- [ ] RNG parity is hard → mitigate by defining golden seeds early.
- [ ] Mobile drag can be finicky → mitigate by using pointer events + clear hit testing.
- [ ] Solver can explode → mitigate by shipping a heuristic solver first.
