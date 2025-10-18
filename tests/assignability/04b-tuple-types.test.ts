import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Tuple Type Assignability', () => {
  describe('Basic Tuple Types', () => {
    it('should allow identical tuple types', () => {
      const t1 = z.tuple([z.string(), z.number()]);
      const t2 = z.tuple([z.string(), z.number()]);
      expect(isAssignable(t1, t2)).toBe(true);
      // Type-level: [string, number] extends [string, number] => true
      expectTypeOf<Extends<typeof t1, typeof t2>>().toEqualTypeOf<true>();
    });

    it('should not allow tuples with different element types', () => {
      const tA = z.tuple([z.string(), z.number()]);
      const tB = z.tuple([z.string(), z.string()]);
      expect(isAssignable(tA, tB)).toBe(false);
      // Type-level: [string, number] extends [string, string] => false
      expectTypeOf<Extends<typeof tA, typeof tB>>().toEqualTypeOf<false>();
    });
  });

  describe('Tuple Length Differences', () => {
    it('should not allow shorter tuple to longer tuple', () => {
      const shortT = z.tuple([z.string()]);
      const longT = z.tuple([z.string(), z.number()]);
      expect(isAssignable(shortT, longT)).toBe(false);
      // Type-level: [string] extends [string, number] => false
      expectTypeOf<
        Extends<typeof shortT, typeof longT>
      >().toEqualTypeOf<false>();
    });

    it('should not allow longer tuple to shorter tuple', () => {
      const longT = z.tuple([z.string(), z.number()]);
      const shortT = z.tuple([z.string()]);
      expect(isAssignable(longT, shortT)).toBe(false);
      // Type-level: [string, number] extends [string] => false
      expectTypeOf<
        Extends<typeof longT, typeof shortT>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Tuple Element Type Variance', () => {
    const literalTuple = z.tuple([z.literal('hello'), z.literal(42)]);
    const typeTuple = z.tuple([z.string(), z.number()]);

    it('should allow more specific tuple to more general tuple', () => {
      expect(isAssignable(literalTuple, typeTuple)).toBe(true);
      // Type-level: ['hello', 42] extends [string, number] => true
      expectTypeOf<
        Extends<typeof literalTuple, typeof typeTuple>
      >().toEqualTypeOf<true>();
    });

    it('should not allow more general tuple to more specific tuple', () => {
      expect(isAssignable(typeTuple, literalTuple)).toBe(false);
      // Type-level: [string, number] extends ['hello', 42] => false
      expectTypeOf<
        Extends<typeof typeTuple, typeof literalTuple>
      >().toEqualTypeOf<false>();
    });

    describe('Complex Tuple Element Types', () => {
      const objTuple = z.tuple([
        z.object({ name: z.string() }),
        z.array(z.string()),
      ]);

      const extendedObjTuple = z.tuple([
        z.object({ name: z.string(), age: z.number() }),
        z.array(z.string()),
      ]);

      it('should allow tuple with more specific object to tuple with less specific object', () => {
        expect(isAssignable(extendedObjTuple, objTuple)).toBe(true);
        // Type-level: [{ name: string; age: number }, string[]] extends [{ name: string }, string[]] => true
        expectTypeOf<
          Extends<typeof extendedObjTuple, typeof objTuple>
        >().toEqualTypeOf<true>();
      });

      it('should not allow tuple with less specific object to tuple with more specific object', () => {
        expect(isAssignable(objTuple, extendedObjTuple)).toBe(false);
        // Type-level: [{ name: string }, string[]] extends [{ name: string; age: number }, string[]] => false
        expectTypeOf<
          Extends<typeof objTuple, typeof extendedObjTuple>
        >().toEqualTypeOf<false>();
      });
    });

    describe('Empty Tuples', () => {
      it('should allow empty tuple to empty tuple', () => {
        const empty1 = z.tuple([]);
        const empty2 = z.tuple([]);
        expect(isAssignable(empty1, empty2)).toBe(true);
        // Type-level: [] extends [] => true
        expectTypeOf<
          Extends<typeof empty1, typeof empty2>
        >().toEqualTypeOf<true>();
      });

      it('should not allow empty tuple to non-empty tuple', () => {
        const empty = z.tuple([]);
        const nonEmpty = z.tuple([z.string()]);
        expect(isAssignable(empty, nonEmpty)).toBe(false);
        // Type-level: [] extends [string] => false
        expectTypeOf<
          Extends<typeof empty, typeof nonEmpty>
        >().toEqualTypeOf<false>();
      });

      it('should not allow non-empty tuple to empty tuple', () => {
        const nonEmpty = z.tuple([z.string()]);
        const empty = z.tuple([]);
        expect(isAssignable(nonEmpty, empty)).toBe(false);
        // Type-level: [string] extends [] => false
        expectTypeOf<
          Extends<typeof nonEmpty, typeof empty>
        >().toEqualTypeOf<false>();
      });
    });
  });
});
