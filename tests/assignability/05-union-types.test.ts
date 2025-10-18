import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Union Type Assignability', () => {
  const unionAB = z.union([z.literal('a'), z.literal('b')]);
  const unionABC = z.union([z.literal('a'), z.literal('b'), z.literal('c')]);
  const unionXY = z.union([z.literal('x'), z.literal('y')]);

  describe('Union to Union Assignment', () => {
    it('should allow subset union to superset union', () => {
      expect(isAssignable(unionAB, unionABC)).toBe(true);
      // Type-level: 'a' | 'b' extends 'a' | 'b' | 'c' => true
      expectTypeOf<
        Extends<typeof unionAB, typeof unionABC>
      >().toEqualTypeOf<true>();
    });

    it('should not allow superset union to subset union', () => {
      expect(isAssignable(unionABC, unionAB)).toBe(false);
      // Type-level: 'a' | 'b' | 'c' extends 'a' | 'b' => false
      expectTypeOf<
        Extends<typeof unionABC, typeof unionAB>
      >().toEqualTypeOf<false>();
    });

    it('should not allow disjoint unions', () => {
      expect(isAssignable(unionAB, unionXY)).toBe(false);
      // Type-level: 'a' | 'b' extends 'x' | 'y' => false
      expectTypeOf<
        Extends<typeof unionAB, typeof unionXY>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Literal to Union Assignment', () => {
    it('should allow literal that is part of union', () => {
      const litA = z.literal('a');
      expect(isAssignable(litA, unionAB)).toBe(true);
      // Type-level: 'a' extends 'a' | 'b' => true
      expectTypeOf<
        Extends<typeof litA, typeof unionAB>
      >().toEqualTypeOf<true>();
    });

    it('should not allow literal that is not part of union', () => {
      const litC = z.literal('c');
      expect(isAssignable(litC, unionAB)).toBe(false);
      // Type-level: 'c' extends 'a' | 'b' => false
      expectTypeOf<
        Extends<typeof litC, typeof unionAB>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Complex Union Types', () => {
    const stringNumberUnion = z.union([z.string(), z.number()]);
    const stringUnion = z.union([z.string()]);

    it('should not allow broader union to narrower union', () => {
      expect(isAssignable(stringNumberUnion, stringUnion)).toBe(false);
      // Type-level: string | number extends string => false
      expectTypeOf<
        Extends<typeof stringNumberUnion, typeof stringUnion>
      >().toEqualTypeOf<false>();
    });

    it('should allow narrower union to broader union', () => {
      expect(isAssignable(stringUnion, stringNumberUnion)).toBe(true);
      // Type-level: string extends string | number => true
      expectTypeOf<
        Extends<typeof stringUnion, typeof stringNumberUnion>
      >().toEqualTypeOf<true>();
    });
  });
});
