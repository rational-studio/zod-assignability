import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Basic Type Assignability', () => {
  describe('Primitive Types', () => {
    it('should allow string to string assignment', () => {
      const s1 = z.string();
      const s2 = z.string();
      expect(isAssignable(s1, s2)).toBe(true);
      expectTypeOf<Extends<typeof s1, typeof s2>>().toEqualTypeOf<true>();
    });

    it('should not allow string to number assignment', () => {
      const s = z.string();
      const n = z.number();
      expect(isAssignable(s, n)).toBe(false);
      expectTypeOf<Extends<typeof s, typeof n>>().toEqualTypeOf<false>();
    });

    it('should allow number to number assignment', () => {
      const n1 = z.number();
      const n2 = z.number();
      expect(isAssignable(n1, n2)).toBe(true);
      expectTypeOf<Extends<typeof n1, typeof n2>>().toEqualTypeOf<true>();
    });

    it('should allow boolean to boolean assignment', () => {
      const b1 = z.boolean();
      const b2 = z.boolean();
      expect(isAssignable(b1, b2)).toBe(true);
      expectTypeOf<Extends<typeof b1, typeof b2>>().toEqualTypeOf<true>();
    });

    it('should not allow string to boolean assignment', () => {
      const s = z.string();
      const b = z.boolean();
      expect(isAssignable(s, b)).toBe(false);
      expectTypeOf<Extends<typeof s, typeof b>>().toEqualTypeOf<false>();
    });
  });

  describe('Literal Types', () => {
    it('should allow identical string literals', () => {
      const hello1 = z.literal('hello');
      const hello2 = z.literal('hello');
      expect(isAssignable(hello1, hello2)).toBe(true);
      expectTypeOf<
        Extends<typeof hello1, typeof hello2>
      >().toEqualTypeOf<true>();
    });

    it('should not allow different string literals', () => {
      const hello = z.literal('hello');
      const world = z.literal('world');
      expect(isAssignable(hello, world)).toBe(false);
      expectTypeOf<
        Extends<typeof hello, typeof world>
      >().toEqualTypeOf<false>();
    });

    it('should allow identical number literals', () => {
      const n42a = z.literal(42);
      const n42b = z.literal(42);
      expect(isAssignable(n42a, n42b)).toBe(true);
      expectTypeOf<Extends<typeof n42a, typeof n42b>>().toEqualTypeOf<true>();
    });

    it('should not allow different number literals', () => {
      const n42 = z.literal(42);
      const n43 = z.literal(43);
      expect(isAssignable(n42, n43)).toBe(false);
      expectTypeOf<Extends<typeof n42, typeof n43>>().toEqualTypeOf<false>();
    });
  });

  describe('Type Widening', () => {
    it('should allow string literal to string assignment', () => {
      const litHello = z.literal('hello');
      const str = z.string();
      expect(isAssignable(litHello, str)).toBe(true);
      expectTypeOf<
        Extends<typeof litHello, typeof str>
      >().toEqualTypeOf<true>();
    });

    it('should allow number literal to number assignment', () => {
      const lit42 = z.literal(42);
      const num = z.number();
      expect(isAssignable(lit42, num)).toBe(true);
      expectTypeOf<Extends<typeof lit42, typeof num>>().toEqualTypeOf<true>();
    });

    it('should allow boolean literal to boolean assignment', () => {
      const litTrue = z.literal(true);
      const bool = z.boolean();
      expect(isAssignable(litTrue, bool)).toBe(true);
      expectTypeOf<
        Extends<typeof litTrue, typeof bool>
      >().toEqualTypeOf<true>();
    });

    it('should allow union of string literals to string assignment', () => {
      const unionAB = z.union([z.literal('a'), z.literal('b')]);
      const str = z.string();
      expect(isAssignable(unionAB, str)).toBe(true);
      expectTypeOf<Extends<typeof unionAB, typeof str>>().toEqualTypeOf<true>();
    });

    it('should allow union of number literals to number assignment', () => {
      const union12 = z.union([z.literal(1), z.literal(2)]);
      const num = z.number();
      expect(isAssignable(union12, num)).toBe(true);
      expectTypeOf<Extends<typeof union12, typeof num>>().toEqualTypeOf<true>();
    });

    it('should not allow string to string literal assignment', () => {
      const str = z.string();
      const litHello = z.literal('hello');
      expect(isAssignable(str, litHello)).toBe(false);
      expectTypeOf<
        Extends<typeof str, typeof litHello>
      >().toEqualTypeOf<false>();
    });

    it('should not allow number to number literal assignment', () => {
      const num = z.number();
      const lit42 = z.literal(42);
      expect(isAssignable(num, lit42)).toBe(false);
      expectTypeOf<Extends<typeof num, typeof lit42>>().toEqualTypeOf<false>();
    });
  });

  describe('Type Narrowing (Not Assignable)', () => {
    it('should not allow string to string literal assignment', () => {
      const str = z.string();
      const litHello = z.literal('hello');
      expect(isAssignable(str, litHello)).toBe(false);
      expectTypeOf<
        Extends<typeof str, typeof litHello>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Enums', () => {
    it('should not allow string to enum assignment', () => {
      const ColorEnum = z.enum(['red', 'green', 'blue']);
      const str = z.string();
      expect(isAssignable(str, ColorEnum)).toBe(false);
      // A extends B => false (string not assignable to specific union)
      expectTypeOf<
        Extends<typeof str, typeof ColorEnum>
      >().toEqualTypeOf<false>();
    });

    it('should not allow number to enum assignment', () => {
      const NumEnum = z.enum(['1', '2', '3']);
      const num = z.number();
      expect(isAssignable(num, NumEnum)).toBe(false);
      // A extends B => false (number not assignable to specific string union)
      expectTypeOf<
        Extends<typeof num, typeof NumEnum>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Optional and Nullable Types', () => {
    it('should allow string to optional string assignment', () => {
      const s = z.string();
      const sOpt = z.string().optional();
      expect(isAssignable(s, sOpt)).toBe(true);
      // A extends B => true
      expectTypeOf<Extends<typeof s, typeof sOpt>>().toEqualTypeOf<true>();
    });

    it('should not allow optional string to string assignment', () => {
      const sOpt = z.string().optional();
      const s = z.string();
      expect(isAssignable(sOpt, s)).toBe(false);
      // A extends B => false
      expectTypeOf<Extends<typeof sOpt, typeof s>>().toEqualTypeOf<false>();
    });

    it('should allow string to nullable string assignment', () => {
      const s = z.string();
      const sNull = z.string().nullable();
      expect(isAssignable(s, sNull)).toBe(true);
      // A extends B => true
      expectTypeOf<Extends<typeof s, typeof sNull>>().toEqualTypeOf<true>();
    });

    it('should not allow nullable string to string assignment', () => {
      const sNull = z.string().nullable();
      const s = z.string();
      expect(isAssignable(sNull, s)).toBe(false);
      // A extends B => false
      expectTypeOf<Extends<typeof sNull, typeof s>>().toEqualTypeOf<false>();
    });

    it('should handle Extends<any, string> correctly', () => {
      const anySchema = z.any();
      const stringSchema = z.string();
      expect(isAssignable(anySchema, stringSchema)).toBe(true);
      // any extends string => true
      expectTypeOf<
        Extends<typeof anySchema, typeof stringSchema>
      >().toEqualTypeOf<true>();
    });
  });
});

describe('Additional Primitive Types', () => {
  it('should allow bigint to bigint assignment', () => {
    const b1 = z.bigint();
    const b2 = z.bigint();
    expect(isAssignable(b1, b2)).toBe(true);
    expectTypeOf<Extends<typeof b1, typeof b2>>().toEqualTypeOf<true>();
  });

  it('should not allow bigint to number assignment', () => {
    const bi = z.bigint();
    const num = z.number();
    expect(isAssignable(bi, num)).toBe(false);
    expectTypeOf<Extends<typeof bi, typeof num>>().toEqualTypeOf<false>();
  });

  it('should allow symbol to symbol assignment', () => {
    const s1 = z.symbol();
    const s2 = z.symbol();
    expect(isAssignable(s1, s2)).toBe(true);
    expectTypeOf<Extends<typeof s1, typeof s2>>().toEqualTypeOf<true>();
  });

  it('should not allow symbol to string assignment', () => {
    const sym = z.symbol();
    const str = z.string();
    expect(isAssignable(sym, str)).toBe(false);
    expectTypeOf<Extends<typeof sym, typeof str>>().toEqualTypeOf<false>();
  });
});

describe('Unknown and Never', () => {
  it('should allow string to unknown assignment', () => {
    const str = z.string();
    const unk = z.unknown();
    expect(isAssignable(str, unk)).toBe(true);
    expectTypeOf<Extends<typeof str, typeof unk>>().toEqualTypeOf<true>();
  });

  it('should not allow unknown to string assignment', () => {
    const unk = z.unknown();
    const str = z.string();
    expect(isAssignable(unk, str)).toBe(false);
    expectTypeOf<Extends<typeof unk, typeof str>>().toEqualTypeOf<false>();
  });

  it('should allow never to string assignment', () => {
    const nev = z.never();
    const str = z.string();
    expect(isAssignable(nev, str)).toBe(true);
    expectTypeOf<Extends<typeof nev, typeof str>>().toEqualTypeOf<true>();
  });

  it('should not allow string to never assignment', () => {
    const str = z.string();
    const nev = z.never();
    expect(isAssignable(str, nev)).toBe(false);
    expectTypeOf<Extends<typeof str, typeof nev>>().toEqualTypeOf<false>();
  });
});
