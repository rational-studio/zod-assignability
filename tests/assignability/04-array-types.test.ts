import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Array Type Assignability', () => {
  describe('Basic Array Types', () => {
    it('should allow identical array types', () => {
      const arr1 = z.array(z.string());
      const arr2 = z.array(z.string());
      expect(isAssignable(arr1, arr2)).toBe(true);
      // Type-level check: A extends B should be true
      expectTypeOf<Extends<typeof arr1, typeof arr2>>().toEqualTypeOf<true>();
    });

    it('should not allow arrays with different element types', () => {
      const arrString = z.array(z.string());
      const arrNumber = z.array(z.number());
      expect(isAssignable(arrString, arrNumber)).toBe(false);
      // Type-level check: A extends B should be false
      expectTypeOf<
        Extends<typeof arrString, typeof arrNumber>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Array Element Type Variance', () => {
    const unionArray = z.array(z.union([z.string(), z.number()]));
    const stringArray = z.array(z.string());

    it('should not allow broader element type array to narrower element type array', () => {
      expect(isAssignable(unionArray, stringArray)).toBe(false);
      // Type-level check: (string | number)[] extends string[] should be false
      expectTypeOf<
        Extends<typeof unionArray, typeof stringArray>
      >().toEqualTypeOf<false>();
    });

    it('should allow narrower element type array to broader element type array', () => {
      expect(isAssignable(stringArray, unionArray)).toBe(true);
      // Type-level check: string[] extends (string | number)[] should be true
      expectTypeOf<
        Extends<typeof stringArray, typeof unionArray>
      >().toEqualTypeOf<true>();
    });
  });

  describe('Complex Array Element Types', () => {
    const objArray = z.array(z.object({ name: z.string() }));
    const extendedObjArray = z.array(
      z.object({ name: z.string(), age: z.number() }),
    );

    it('should allow array of objects with more properties to array of objects with fewer properties', () => {
      expect(isAssignable(extendedObjArray, objArray)).toBe(true);
      // Type-level check: { name: string; age: number }[] extends { name: string }[] should be true
      expectTypeOf<
        Extends<typeof extendedObjArray, typeof objArray>
      >().toEqualTypeOf<true>();
    });

    it('should not allow array of objects with fewer properties to array of objects with more properties', () => {
      expect(isAssignable(objArray, extendedObjArray)).toBe(false);
      // Type-level check: { name: string }[] extends { name: string; age: number }[] should be false
      expectTypeOf<
        Extends<typeof objArray, typeof extendedObjArray>
      >().toEqualTypeOf<false>();
    });
  });
});
