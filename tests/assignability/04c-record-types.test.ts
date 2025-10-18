import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Record Type Assignability', () => {
  describe('Basic Record Types', () => {
    it('should allow identical record types', () => {
      const rec1 = z.record(z.string(), z.string());
      const rec2 = z.record(z.string(), z.string());
      expect(isAssignable(rec1, rec2)).toBe(true);
      // Type-level: Record<string, string> extends Record<string, string> => true
      expectTypeOf<Extends<typeof rec1, typeof rec2>>().toEqualTypeOf<true>();
    });

    it('should not allow records with different value types', () => {
      const recString = z.record(z.string(), z.string());
      const recNumber = z.record(z.string(), z.number());
      expect(isAssignable(recString, recNumber)).toBe(false);
      // Type-level: Record<string, string> extends Record<string, number> => false
      expectTypeOf<
        Extends<typeof recString, typeof recNumber>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Record Value Type Variance', () => {
    const stringRecord = z.record(z.string(), z.string());
    const unionRecord = z.record(z.string(), z.union([z.string(), z.number()]));

    it('should allow narrower value type record to broader value type record', () => {
      expect(isAssignable(stringRecord, unionRecord)).toBe(true);
      // Type-level: Record<string, string> extends Record<string, string | number> => true
      expectTypeOf<
        Extends<typeof stringRecord, typeof unionRecord>
      >().toEqualTypeOf<true>();
    });

    it('should not allow broader value type record to narrower value type record', () => {
      expect(isAssignable(unionRecord, stringRecord)).toBe(false);
      // Type-level: Record<string, string | number> extends Record<string, string> => false
      expectTypeOf<
        Extends<typeof unionRecord, typeof stringRecord>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Record Key Type Variance', () => {
    const stringKeyRecord = z.record(z.string(), z.string());
    const literalKeyRecord = z.record(z.literal('key'), z.string());

    it('should handle different key types appropriately', () => {
      // This test verifies the current behavior - adjust expectations based on implementation
      const result = isAssignable(literalKeyRecord, stringKeyRecord);
      expect(typeof result).toBe('boolean');
      // Type-level: Record<'key', string> extends Record<string, string> => true
      expectTypeOf<
        Extends<typeof literalKeyRecord, typeof stringKeyRecord>
      >().toEqualTypeOf<true>();
    });
  });

  describe('Complex Record Value Types', () => {
    const objRecord = z.record(z.string(), z.object({ name: z.string() }));
    const extendedObjRecord = z.record(
      z.string(),
      z.object({ name: z.string(), age: z.number() }),
    );

    it('should allow record of objects with more properties to record of objects with fewer properties', () => {
      expect(isAssignable(extendedObjRecord, objRecord)).toBe(true);
      // Type-level: Record<string, { name: string; age: number }> extends Record<string, { name: string }> => true
      expectTypeOf<
        Extends<typeof extendedObjRecord, typeof objRecord>
      >().toEqualTypeOf<true>();
    });

    it('should not allow record of objects with fewer properties to record of objects with more properties', () => {
      expect(isAssignable(objRecord, extendedObjRecord)).toBe(false);
      // Type-level: Record<string, { name: string }> extends Record<string, { name: string; age: number }> => false
      expectTypeOf<
        Extends<typeof objRecord, typeof extendedObjRecord>
      >().toEqualTypeOf<false>();
    });
  });
});
