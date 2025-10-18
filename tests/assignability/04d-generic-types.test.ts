import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Generic Type Assignability', () => {
  // Box<T> ~ { value: T }
  const BoxString = z.object({ value: z.string() });
  const BoxStringOrNumber = z.object({
    value: z.union([z.string(), z.number()]),
  });
  const BoxNumber = z.object({ value: z.number() });

  describe('Box<T>', () => {
    it('should allow Box<string> to Box<string | number>', () => {
      expect(isAssignable(BoxString, BoxStringOrNumber)).toBe(true);
      // Type-level: Box<string> extends Box<string | number> => true
      expectTypeOf<
        Extends<typeof BoxString, typeof BoxStringOrNumber>
      >().toEqualTypeOf<true>();
    });

    it('should not allow Box<string | number> to Box<string>', () => {
      expect(isAssignable(BoxStringOrNumber, BoxString)).toBe(false);
      // Type-level: Box<string | number> extends Box<string> => false
      expectTypeOf<
        Extends<typeof BoxStringOrNumber, typeof BoxString>
      >().toEqualTypeOf<false>();
    });

    it('should not allow Box<number> to Box<string>', () => {
      expect(isAssignable(BoxNumber, BoxString)).toBe(false);
      // Type-level: Box<number> extends Box<string> => false
      expectTypeOf<
        Extends<typeof BoxNumber, typeof BoxString>
      >().toEqualTypeOf<false>();
    });
  });

  // Maybe<T> ~ T | undefined
  const MaybeString = z.string().optional();
  const StringSchema = z.string();

  describe('Maybe<T>', () => {
    it('should allow string to Maybe<string>', () => {
      expect(isAssignable(StringSchema, MaybeString)).toBe(true);
      // Type-level: string extends string | undefined => true
      expectTypeOf<
        Extends<typeof StringSchema, typeof MaybeString>
      >().toEqualTypeOf<true>();
    });

    it('should not allow Maybe<string> to string', () => {
      expect(isAssignable(MaybeString, StringSchema)).toBe(false);
      // Type-level: string | undefined extends string => false
      expectTypeOf<
        Extends<typeof MaybeString, typeof StringSchema>
      >().toEqualTypeOf<false>();
    });
  });

  // Id<T extends string | number> ~ { id: T }
  const IdString = z.object({ id: z.string() });
  const IdNumber = z.object({ id: z.number() });
  const IdStringOrNumber = z.object({ id: z.union([z.string(), z.number()]) });

  describe('Id<T extends string | number>', () => {
    it('should allow Id<string> to Id<string | number>', () => {
      expect(isAssignable(IdString, IdStringOrNumber)).toBe(true);
      expectTypeOf<
        Extends<typeof IdString, typeof IdStringOrNumber>
      >().toEqualTypeOf<true>();
    });

    it('should allow Id<number> to Id<string | number>', () => {
      expect(isAssignable(IdNumber, IdStringOrNumber)).toBe(true);
      expectTypeOf<
        Extends<typeof IdNumber, typeof IdStringOrNumber>
      >().toEqualTypeOf<true>();
    });

    it('should not allow Id<string | number> to Id<string>', () => {
      expect(isAssignable(IdStringOrNumber, IdString)).toBe(false);
      expectTypeOf<
        Extends<typeof IdStringOrNumber, typeof IdString>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Nested generics: Box<Array<string>>', () => {
    const BoxArrayString = z.object({ value: z.array(z.string()) });
    const BoxArrayUnion = z.object({
      value: z.array(z.union([z.string(), z.number()])),
    });

    it('should allow Box<string[]> to Box<(string | number)[]>', () => {
      expect(isAssignable(BoxArrayString, BoxArrayUnion)).toBe(true);
      expectTypeOf<
        Extends<typeof BoxArrayString, typeof BoxArrayUnion>
      >().toEqualTypeOf<true>();
    });

    it('should not allow Box<(string | number)[]> to Box<string[]>', () => {
      expect(isAssignable(BoxArrayUnion, BoxArrayString)).toBe(false);
      expectTypeOf<
        Extends<typeof BoxArrayUnion, typeof BoxArrayString>
      >().toEqualTypeOf<false>();
    });
  });
});
