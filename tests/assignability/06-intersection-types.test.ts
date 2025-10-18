import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Intersection Type Assignability', () => {
  const objName = z.object({ name: z.string() });
  const objAge = z.object({ age: z.number() });
  const objNameAge = z.object({ name: z.string(), age: z.number() });
  const nameAndAge = z.intersection(objName, objAge);

  describe('A extends B & C (target is intersection)', () => {
    it('should allow object with all properties to intersection of each', () => {
      expect(isAssignable(objNameAge, nameAndAge)).toBe(true);
      // Type-level: { name: string; age: number } extends { name: string } & { age: number } => true
      expectTypeOf<
        Extends<typeof objNameAge, typeof nameAndAge>
      >().toEqualTypeOf<true>();
    });

    it('should not allow object missing one side to intersection', () => {
      expect(isAssignable(objName, nameAndAge)).toBe(false);
      // Type-level: { name: string } extends { name: string } & { age: number } => false
      expectTypeOf<
        Extends<typeof objName, typeof nameAndAge>
      >().toEqualTypeOf<false>();
    });
  });

  describe('(A & B) extends C (source is intersection)', () => {
    it('should not allow intersection to extend one side', () => {
      expect(isAssignable(nameAndAge, objName)).toBe(true);
      // Type-level: ({ name: string } & { age: number }) extends { name: string } => true
      expectTypeOf<
        Extends<typeof nameAndAge, typeof objName>
      >().toEqualTypeOf<true>();
    });

    it('should not allow intersection to extend combined object', () => {
      expect(isAssignable(nameAndAge, objNameAge)).toBe(true);
      // Type-level: ({ name: string } & { age: number }) extends { name: string; age: number } => true
      expectTypeOf<
        Extends<typeof nameAndAge, typeof objNameAge>
      >().toEqualTypeOf<true>();
    });

    it('should allow identical intersection types', () => {
      expect(isAssignable(nameAndAge, nameAndAge)).toBe(true);
      // Type-level: (A & B) extends (A & B) => true
      expectTypeOf<
        Extends<typeof nameAndAge, typeof nameAndAge>
      >().toEqualTypeOf<true>();
    });
  });
});
