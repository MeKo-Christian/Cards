/**
 * Tests for the RNG (Random Number Generator) module
 */

import { describe, it, expect } from "vitest";
import { createRng, nextFloat, nextInt, cloneRng } from "./rng";

describe("createRng", () => {
  it("should create RNG state with the given seed", () => {
    const rng = createRng(12345);

    expect(rng.seed).toBe(12345);
    expect(rng.state).toEqual([12345]);
  });

  it("should normalize seed to 32-bit unsigned integer", () => {
    const rng = createRng(-1);

    expect(rng.seed).toBe(-1);
    // -1 >>> 0 = 4294967295 (max 32-bit unsigned)
    expect(rng.state).toEqual([4294967295]);
  });

  it("should handle zero seed", () => {
    const rng = createRng(0);

    expect(rng.seed).toBe(0);
    expect(rng.state).toEqual([0]);
  });

  it("should handle large seeds", () => {
    const rng = createRng(0xffffffff);

    expect(rng.seed).toBe(0xffffffff);
    expect(rng.state).toEqual([0xffffffff]);
  });
});

describe("nextFloat", () => {
  it("should return values in range [0, 1)", () => {
    const rng = createRng(42);

    for (let i = 0; i < 100; i++) {
      const value = nextFloat(rng);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("should be deterministic for same seed", () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);

    for (let i = 0; i < 10; i++) {
      expect(nextFloat(rng1)).toBe(nextFloat(rng2));
    }
  });

  it("should produce different sequences for different seeds", () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);

    const values1 = [nextFloat(rng1), nextFloat(rng1), nextFloat(rng1)];
    const values2 = [nextFloat(rng2), nextFloat(rng2), nextFloat(rng2)];

    expect(values1).not.toEqual(values2);
  });

  it("should mutate RNG state on each call", () => {
    const rng = createRng(42);
    const initialState = rng.state[0];

    nextFloat(rng);

    expect(rng.state[0]).not.toBe(initialState);
  });

  it("should produce varied distribution", () => {
    const rng = createRng(999);
    const values = new Set<number>();

    for (let i = 0; i < 100; i++) {
      values.add(nextFloat(rng));
    }

    // Should produce many unique values
    expect(values.size).toBeGreaterThan(90);
  });
});

describe("nextInt", () => {
  it("should return values in range [0, max)", () => {
    const rng = createRng(42);
    const max = 10;

    for (let i = 0; i < 100; i++) {
      const value = nextInt(rng, max);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(max);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("should be deterministic for same seed", () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);

    for (let i = 0; i < 10; i++) {
      expect(nextInt(rng1, 100)).toBe(nextInt(rng2, 100));
    }
  });

  it("should handle max of 1", () => {
    const rng = createRng(42);

    for (let i = 0; i < 10; i++) {
      expect(nextInt(rng, 1)).toBe(0);
    }
  });

  it("should handle large max values", () => {
    const rng = createRng(42);
    const max = 1000000;

    for (let i = 0; i < 100; i++) {
      const value = nextInt(rng, max);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(max);
    }
  });

  it("should cover the full range over many iterations", () => {
    const rng = createRng(42);
    const max = 5;
    const seen = new Set<number>();

    for (let i = 0; i < 100; i++) {
      seen.add(nextInt(rng, max));
    }

    // Should see all values 0-4
    expect(seen.size).toBe(max);
  });
});

describe("cloneRng", () => {
  it("should create an independent copy", () => {
    const rng1 = createRng(42);

    // Advance rng1 a bit
    nextFloat(rng1);
    nextFloat(rng1);

    const rng2 = cloneRng(rng1);

    // Both should produce the same next value
    expect(nextFloat(rng1)).toBe(nextFloat(rng2));
  });

  it("should not affect original when clone is advanced", () => {
    const rng1 = createRng(42);
    const initialState = rng1.state[0];

    const rng2 = cloneRng(rng1);
    nextFloat(rng2);

    // Original should be unchanged
    expect(rng1.state[0]).toBe(initialState);
  });

  it("should preserve seed", () => {
    const rng1 = createRng(12345);
    const rng2 = cloneRng(rng1);

    expect(rng2.seed).toBe(rng1.seed);
  });

  it("should allow parallel sequences from same point", () => {
    const rng = createRng(42);

    // Advance to some point
    for (let i = 0; i < 5; i++) {
      nextFloat(rng);
    }

    const clone1 = cloneRng(rng);
    const clone2 = cloneRng(rng);

    // Both clones should produce identical sequences
    const seq1 = [nextFloat(clone1), nextFloat(clone1), nextFloat(clone1)];
    const seq2 = [nextFloat(clone2), nextFloat(clone2), nextFloat(clone2)];

    expect(seq1).toEqual(seq2);
  });
});
