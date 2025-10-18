import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { isAssignable } from '../../src/assignability';
import type { Extends } from '../type-helpers';

describe('Instanceof Type Assignability', () => {
  // Test classes
  class Animal {
    name: string = '';
  }

  class Dog extends Animal {
    breed: string = '';
  }

  class Cat extends Animal {
    color: string = '';
  }

  class Vehicle {
    wheels: number = 0;
  }

  const animalSchema = z.instanceof(Animal);
  const dogSchema = z.instanceof(Dog);
  const catSchema = z.instanceof(Cat);
  const vehicleSchema = z.instanceof(Vehicle);

  describe('Inheritance Relationships', () => {
    it('should not allow Dog to Animal assignment (conservative approach)', () => {
      expect(isAssignable(dogSchema, animalSchema)).toBe(false);
      // Type-level: Dog extends Animal => true
      expectTypeOf<
        Extends<typeof dogSchema, typeof animalSchema>
      >().toEqualTypeOf<true>();
    });

    it('should not allow Animal to Dog assignment', () => {
      expect(isAssignable(animalSchema, dogSchema)).toBe(false);
      // Type-level: Animal extends Dog => false
      expectTypeOf<
        Extends<typeof animalSchema, typeof dogSchema>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Sibling Class Relationships', () => {
    it('should not allow Dog to Cat assignment', () => {
      expect(isAssignable(dogSchema, catSchema)).toBe(false);
      // Type-level: Dog extends Cat => false
      expectTypeOf<
        Extends<typeof dogSchema, typeof catSchema>
      >().toEqualTypeOf<false>();
    });

    it('should not allow Cat to Dog assignment', () => {
      expect(isAssignable(catSchema, dogSchema)).toBe(false);
      // Type-level: Cat extends Dog => false
      expectTypeOf<
        Extends<typeof catSchema, typeof dogSchema>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Unrelated Class Relationships', () => {
    it('should not allow Dog to Vehicle assignment', () => {
      expect(isAssignable(dogSchema, vehicleSchema)).toBe(false);
      // Type-level: Dog extends Vehicle => false
      expectTypeOf<
        Extends<typeof dogSchema, typeof vehicleSchema>
      >().toEqualTypeOf<false>();
    });

    it('should not allow Vehicle to Animal assignment', () => {
      expect(isAssignable(vehicleSchema, animalSchema)).toBe(false);
      // Type-level: Vehicle extends Animal => false
      expectTypeOf<
        Extends<typeof vehicleSchema, typeof animalSchema>
      >().toEqualTypeOf<false>();
    });
  });

  describe('Identical Instanceof Types', () => {
    it('should allow identical instanceof types', () => {
      expect(isAssignable(dogSchema, dogSchema)).toBe(true);
      // Type-level: Dog extends Dog => true
      expectTypeOf<
        Extends<typeof dogSchema, typeof dogSchema>
      >().toEqualTypeOf<true>();
    });

    it('should allow identical animal instanceof types', () => {
      expect(isAssignable(animalSchema, animalSchema)).toBe(true);
      // Type-level: Animal extends Animal => true
      expectTypeOf<
        Extends<typeof animalSchema, typeof animalSchema>
      >().toEqualTypeOf<true>();
    });
  });
});
