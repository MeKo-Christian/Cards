/**
 * Deterministic random number generator
 * Uses Alea algorithm to match legacy behavior.
 */

import type { RngState } from "./types";

/**
 * Create a new RNG state from a seed
 */
export function createRng(seed: number): RngState {
  const { s0, s1, s2, c } = initAlea([seed]);
  return {
    seed,
    state: [s0, s1, s2, c],
  };
}

/**
 * Generate next random number in range [0, 1)
 * Mutates the RNG state
 */
export function nextFloat(rng: RngState): number {
  let s0 = rng.state[0];
  let s1 = rng.state[1];
  let s2 = rng.state[2];
  let c = rng.state[3];

  const t = 2091639 * s0 + c * 2.3283064365386963e-10;
  s0 = s1;
  s1 = s2;
  s2 = t - (c = t | 0);

  rng.state[0] = s0;
  rng.state[1] = s1;
  rng.state[2] = s2;
  rng.state[3] = c;

  return s2;
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

function initAlea(args: unknown[]): {
  s0: number;
  s1: number;
  s2: number;
  c: number;
} {
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  const c = 1;

  const mash = createMash();
  s0 = mash(" ");
  s1 = mash(" ");
  s2 = mash(" ");

  if (args.length === 0) {
    args = [Date.now()];
  }

  for (const arg of args) {
    s0 -= mash(arg);
    if (s0 < 0) {
      s0 += 1;
    }
    s1 -= mash(arg);
    if (s1 < 0) {
      s1 += 1;
    }
    s2 -= mash(arg);
    if (s2 < 0) {
      s2 += 1;
    }
  }

  return { s0, s1, s2, c };
}

function createMash() {
  let n = 0xefc8249d;

  return (data: unknown): number => {
    const str = String(data);
    for (let i = 0; i < str.length; i += 1) {
      n += str.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }
    return (n >>> 0) * 2.3283064365386963e-10;
  };
}
