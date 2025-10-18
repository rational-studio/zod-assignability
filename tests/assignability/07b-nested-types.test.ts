import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Complex Nested Type Assignability', () => {
  const NestedGeneral = z.object({
    user: z.object({
      id: z.union([z.string(), z.number()]),
      profile: z.object({ email: z.string().optional() }),
    }),
    tags: z.array(z.object({ label: z.string() })),
    settings: z.record(
      z.string(),
      z.object({ flag: z.union([z.boolean(), z.number()]) }),
    ),
  });

  const NestedSpecific = z.object({
    user: z.object({
      id: z.string(),
      profile: z.object({ email: z.string().optional() }),
    }),
    tags: z.array(z.object({ label: z.string() })),
    settings: z.record(z.string(), z.object({ flag: z.boolean() })),
  });

  describe('Nested covariance', () => {
    it('should allow more specific nested types to broader nested types', () => {
      expect(isAssignable(NestedSpecific, NestedGeneral)).toBe(true);
      // Type-level: narrower nested fields extend broader nested fields
      expectTypeOf<
        Extends<typeof NestedSpecific, typeof NestedGeneral>
      >().toEqualTypeOf<true>();
    });

    it('should not allow broader nested types to narrower nested types', () => {
      expect(isAssignable(NestedGeneral, NestedSpecific)).toBe(false);
      expectTypeOf<
        Extends<typeof NestedGeneral, typeof NestedSpecific>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Optional nested properties', () => {
    const WithOptionalMeta = NestedSpecific.extend({
      meta: z.object({ source: z.literal('web') }).optional(),
    });

    const WithoutMeta = NestedSpecific;

    it('should allow object missing optional nested property', () => {
      // This now passes because our runtime check aligns with TypeScript's structural typing for optional properties.
      expect(isAssignable(WithoutMeta, WithOptionalMeta)).toBe(true);
      // Type-level: { ... } extends { meta?: { source: 'web' } } => true
      expectTypeOf<
        Extends<typeof WithoutMeta, typeof WithOptionalMeta>
      >().toEqualTypeOf<true>();
    });

    it('should allow object with optional nested property to object without it', () => {
      expect(isAssignable(WithOptionalMeta, WithoutMeta)).toBe(true);
      // Type-level: { meta?: ... } extends { ... } => true
      expectTypeOf<
        Extends<typeof WithOptionalMeta, typeof WithoutMeta>
      >().toEqualTypeOf<true>();
    });
  });

  describe('Arrays of objects with differing shapes', () => {
    const PostsA = z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string().optional(),
      }),
    );
    const PostsB = z.array(z.object({ id: z.string(), title: z.string() }));

    it('should allow array of richer objects to array of simpler objects', () => {
      expect(isAssignable(PostsA, PostsB)).toBe(true);
      expectTypeOf<
        Extends<typeof PostsA, typeof PostsB>
      >().toEqualTypeOf<true>();
    });

    it('should allow array of simpler objects to array of richer objects (with optional properties)', () => {
      // Runtime now aligns with TS: Array<A> is assignable to Array<B> if A is assignable to B.
      // {id, title} is assignable to {id, title, body?}, so the array is assignable.
      expect(isAssignable(PostsB, PostsA)).toBe(true);
      // Type-level: { id: string; title: string }[] extends { id: string; title: string; body?: string }[] => true
      expectTypeOf<
        Extends<typeof PostsB, typeof PostsA>
      >().toEqualTypeOf<true>();
    });
  });
});
