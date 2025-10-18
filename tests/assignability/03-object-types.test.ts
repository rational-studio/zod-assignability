import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Object Type Assignability', () => {
  const objA = z.object({ name: z.string() });
  const objB = z.object({ name: z.string(), age: z.number() });
  const objC = z.object({ name: z.string(), age: z.number().optional() });

  describe('Required Properties', () => {
    it('should not allow object with fewer properties to object with more required properties', () => {
      expect(isAssignable(objA, objB)).toBe(false);
      // Type-level check: { name: string } extends { name: string; age: number } should be false
      expectTypeOf<Extends<typeof objA, typeof objB>>().toEqualTypeOf<false>();
    });

    it('should allow object with more properties to object with fewer properties', () => {
      expect(isAssignable(objB, objA)).toBe(true);
      // Type-level check: { name: string; age: number } extends { name: string } should be true
      expectTypeOf<Extends<typeof objB, typeof objA>>().toEqualTypeOf<true>();
    });
  });

  describe('Optional Properties', () => {
    it('should allow object with required property to object with optional property', () => {
      expect(isAssignable(objB, objC)).toBe(true);
      // Type-level check: { name: string; age: number } extends { name: string; age?: number } should be true
      expectTypeOf<Extends<typeof objB, typeof objC>>().toEqualTypeOf<true>();
    });

    it('should allow object without optional property to object with optional property', () => {
      // This now passes because our runtime check aligns with TypeScript's structural typing for optional properties.
      expect(isAssignable(objA, objC)).toBe(true);
      // Type-level: { name: string } extends { name: string; age?: number } => true
      expectTypeOf<Extends<typeof objA, typeof objC>>().toEqualTypeOf<true>();
    });
  });

  describe('Complex Nested Objects', () => {
    const nestedA = z.object({
      user: z.object({ name: z.string() }),
      tags: z.array(z.string()),
    });

    const nestedB = z.object({
      user: z.object({ name: z.string(), email: z.string().optional() }),
      tags: z.array(z.string()),
    });

    it('should allow nested object with fewer properties to nested object with more optional properties', () => {
      // This also passes due to the corrected optional property logic.
      expect(isAssignable(nestedA, nestedB)).toBe(true);
      // Type-level: { user: { name: string }, tags: string[] } extends { user: { name: string; email?: string }, tags: string[] } => true
      expectTypeOf<
        Extends<typeof nestedA, typeof nestedB>
      >().toEqualTypeOf<true>();
    });

    it('should allow nested object with more properties to nested object with fewer properties', () => {
      expect(isAssignable(nestedB, nestedA)).toBe(true);
      // Type-level check: { user: { name: string; email?: string }, tags: string[] } extends { user: { name: string }, tags: string[] } should be true
      expectTypeOf<
        Extends<typeof nestedB, typeof nestedA>
      >().toEqualTypeOf<true>();
    });
  });

  describe('Property Type Compatibility', () => {
    const objStringName = z.object({ name: z.string() });
    const objNumberName = z.object({ name: z.number() });

    it('should not allow objects with incompatible property types', () => {
      expect(isAssignable(objStringName, objNumberName)).toBe(false);
      // Type-level check: { name: string } extends { name: number } should be false
      expectTypeOf<
        Extends<typeof objStringName, typeof objNumberName>
      >().toEqualTypeOf<false>();
    });
  });
});
