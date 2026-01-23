/**
 * Game state management hook
 */

import { useState, useCallback } from "react";
import { newGame, applyMove, runFinish, runSolve, undo } from "../engine";
import type { GameState, Move } from "../engine";

const SEED_STORAGE_KEY = "cards-last-seed";
const SEED_INDEX_STORAGE_KEY = "SeedIndex";
const SOLVABLE_SEEDS = [
  1476865939254, 1476269729858, 1476279959891, 1476284075669, 1476288143993,
  1476288349873, 1476288756145, 1476288876115, 1476288966305, 1476289060665,
  1476312883639, 1476313825635, 1476314411891, 1476316120917, 1476321342064,
  1476321569834, 1476321750585, 1476322931647, 1476322987251, 1476324264739,
  1476324353562, 1476324424646, 1476324491202, 1476324724538, 1476324909418,
  1476324977202, 1476354545149, 1476354614628, 1476354677709, 1476354748565,
  1476354866415, 1476355118645, 1476355206087, 1476360560334, 1476360607758,
  1476360705999, 1476360826197, 1476361035381, 1476362732813, 1476362790908,
  1476362898852, 1476704659018, 1476704768474, 1476704834522, 1476705123146,
  1476705211026, 1476705325106, 1476705362634, 1476705466770, 1476705510682,
  1476705708714, 1476865666788, 1476865836591, 1476865849666, 1476866480312,
  1476866723283, 1476867192083, 1476867234667, 1476867300548, 1476880882143,
  1476881704526, 1476881776466, 1476881792584, 1476881941182, 1476881996070,
  1476908135375, 1476908447190, 1476908692430, 1476908712726, 1476908891654,
  1476909287087, 1476909314892, 1476909491583, 1476909801151, 1476910789015,
  1476911105966, 1476911141126, 1476911456063, 1476911494344, 1476912098112,
  1476912186375, 1476912207633, 1476912229910, 1476912274478, 1476912309487,
  1476912549062, 1476912574300, 1476912618814, 1476912764312, 1476913144367,
  1476913229725, 1477124441663, 1477124528823, 1477124652408, 1477124947711,
  1479936899513, 1479936972480, 1479937018459, 1479937086536, 1479937120480,
  1479937133005, 1479937275817, 1479937288171, 1479937327712, 1479937365585,
  1479937474488, 1479937980632, 1479938162465, 1479938284632, 1479938349827,
  1479938392504, 1479938403227, 1479938447480, 1479938731096, 1481292487562,
  1481292547946, 1481292737490, 1481292750264, 1481292770389, 1481292794162,
  1481293006786, 1481293127642, 1481293239035, 1481293254146, 1483015523385,
  1483015574337, 1483015652449, 1483015994921, 1483016019041,
];

export function isSolvableSeed(seed: number): boolean {
  return SOLVABLE_SEEDS.includes(seed);
}
const CARD_BACK_STORAGE_KEY = "cards-card-back-style";

export type CardBackStyle = "legacy" | "modern";

function readStoredSeed(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SEED_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const seed = Number(raw);
    return Number.isFinite(seed) ? seed : null;
  } catch {
    return null;
  }
}

function storeSeed(seed: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SEED_STORAGE_KEY, String(seed));
  } catch {
    // Ignore storage errors
  }
}

export function readStoredCardBackStyle(): CardBackStyle {
  if (typeof window === "undefined") {
    return "legacy";
  }

  try {
    const raw = window.localStorage.getItem(CARD_BACK_STORAGE_KEY);
    if (raw === "modern" || raw === "legacy") {
      return raw;
    }
    // No stored preference - pick randomly
    const randomStyle: CardBackStyle = Math.random() < 0.5 ? "legacy" : "modern";
    storeCardBackStyle(randomStyle);
    return randomStyle;
  } catch {
    return "legacy";
  }
}

export function storeCardBackStyle(style: CardBackStyle): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CARD_BACK_STORAGE_KEY, style);
  } catch {
    // Ignore storage errors
  }
}

function readSeedIndex(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(SEED_INDEX_STORAGE_KEY);
    const index = Number(raw);
    return Number.isFinite(index) && index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

function storeSeedIndex(index: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SEED_INDEX_STORAGE_KEY, String(index));
  } catch {
    // Ignore storage errors
  }
}

function getNextSeed(): number {
  const index = readSeedIndex();
  if (index < SOLVABLE_SEEDS.length) {
    const seed = SOLVABLE_SEEDS[index];
    storeSeedIndex(index + 1);
    return seed;
  }

  return Date.now();
}

export function useGame(initialSeed?: number) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const seed = initialSeed ?? readStoredSeed() ?? getNextSeed();
    storeSeed(seed);
    return newGame(seed);
  });

  const startNewGame = useCallback((seed?: number) => {
    const nextSeed = seed ?? getNextSeed();
    storeSeed(nextSeed);
    setGameState(newGame(nextSeed));
  }, []);

  const retryGame = useCallback(() => {
    storeSeed(gameState.seed);
    setGameState(newGame(gameState.seed));
  }, [gameState.seed]);

  const performMove = useCallback((move: Move) => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      const success = applyMove(newState, move);
      return success ? newState : prev;
    });
  }, []);

  const performUndo = useCallback(() => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      const success = undo(newState);
      return success ? newState : prev;
    });
  }, []);

  const performFinish = useCallback(() => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      runFinish(newState);
      return newState;
    });
  }, []);

  const performSolve = useCallback((maxSteps = 200) => {
    setGameState((prev) => {
      const newState = structuredClone(prev);
      runSolve(newState, maxSteps);
      return newState;
    });
  }, []);

  return {
    gameState,
    startNewGame,
    retryGame,
    performMove,
    performUndo,
    performFinish,
    performSolve,
  };
}
