/**
 * Deterministic random number generator
 * Uses Mulberry32 algorithm for simplicity and determinism
 */

import type { RngState } from "./types";

/**
 * Create a new RNG state from a seed
 */
export function createRng(seed: number): RngState {
  // Ensure seed is a valid 32-bit integer
  const normalizedSeed = seed >>> 0;
  return {
    seed,
    state: [normalizedSeed],
  };
}

/**
 * Generate next random number in range [0, 1)
 * Mutates the RNG state
 */
export function nextFloat(rng: RngState): number {
  let t = (rng.state[0] += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return result;
}

/**
 * Generate random integer in range [0, max)
 * Mutates the RNG state
 */
export function nextInt(rng: RngState, max: number): number {
  return Math.floor(nextFloat(rng) * max);
}

/**
 * Clone RNG state (for immutable operations)
 */
export function cloneRng(rng: RngState): RngState {
  return {
    seed: rng.seed,
    state: [...rng.state],
  };
}
