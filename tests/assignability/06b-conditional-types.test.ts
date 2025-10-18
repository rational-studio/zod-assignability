import { describe, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import type { Extends } from '../type-helpers';

type DistributiveExtends<A, B> = z.infer<A> extends z.infer<B> ? true : false;

type IsString<A> = z.infer<A> extends string ? true : false;

// Helper to assert distributive result is a boolean
type IsBoolean<T> = [T] extends [boolean] ? true : false;

describe('Conditional Type Extends (Distributive vs Non-Distributive)', () => {
  const str = z.string();
  const num = z.number();
  const unionSN = z.union([z.string(), z.number()]);

  // Use variables to avoid lint errors about "only used as a type"
  void [str, num, unionSN];

  it('non-distributive: [A] extends [B] yields a single boolean', () => {
    // string | number extends string => false (non-distributive)
    expectTypeOf<Extends<typeof unionSN, typeof str>>().toEqualTypeOf<false>();
    // string extends string => true
    expectTypeOf<Extends<typeof str, typeof str>>().toEqualTypeOf<true>();
  });

  it('distributive: A extends B splits over unions', () => {
    // (string extends string ? true : false) | (number extends string ? true : false)
    // => boolean
    expectTypeOf<
      IsBoolean<DistributiveExtends<typeof unionSN, typeof str>>
    >().toEqualTypeOf<true>();
  });

  it('IsString<T> behaves distributively over unions', () => {
    // IsString<string | number> => boolean
    expectTypeOf<IsBoolean<IsString<typeof unionSN>>>().toEqualTypeOf<true>();
    // IsString<'a'> => true
    const litA = z.literal('a');
    void litA;
    expectTypeOf<IsString<typeof litA>>().toEqualTypeOf<true>();
  });

  it('Edge cases: any, unknown, never', () => {
    const anySchema = z.any();
    const unknownSchema = z.unknown();
    const neverSchema = z.never();

    void [anySchema, unknownSchema, neverSchema];

    // any extends string => boolean (distributive semantics)
    expectTypeOf<
      IsBoolean<DistributiveExtends<typeof anySchema, typeof str>>
    >().toEqualTypeOf<true>();
    // unknown extends string => false
    expectTypeOf<
      DistributiveExtends<typeof unknownSchema, typeof str>
    >().toEqualTypeOf<false>();
    // never extends string => true
    expectTypeOf<
      DistributiveExtends<typeof neverSchema, typeof str>
    >().toEqualTypeOf<true>();
  });
});
