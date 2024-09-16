import { describe, expectTypeOf, test } from 'vitest'
import { z } from './index'

describe('Infer', () => {
  /**
   * Helper function to infer the type from the schema.
   * It is convenient when used in combination with expectTypeOf.
   */
  function infer<const T>(value: T): z.Infer<T> {
    return value as any
  }

  test('atomic types', () => {
    expectTypeOf(infer(z.number)).toEqualTypeOf<number>()
  })
  test('literal function', () => {
    expectTypeOf(infer(z.literal('abc'))).toMatchTypeOf<'abc'>()
    expectTypeOf(infer(z.literal(123))).toEqualTypeOf<123>()
    expectTypeOf(infer(z.literal([]))).toEqualTypeOf<readonly []>()
    expectTypeOf(infer(z.literal([1, 2, 3]))).toEqualTypeOf<readonly [1, 2, 3]>()
    expectTypeOf(infer(z.literal({}))).toEqualTypeOf<{}>()
    expectTypeOf(infer(z.literal({ name: 'Bob' }))).toEqualTypeOf<{ readonly name: 'Bob' }>()
  })
  test('number methods', () => {
    expectTypeOf(infer(z.number.integer())).toEqualTypeOf<number>()
  })
  describe('Array', () => {
    test('Array function', () => {
      expectTypeOf(infer(z.Array(z.number))).toEqualTypeOf<number[]>()
    })
  })
  test('union function', () => {
    expectTypeOf(infer(z.union(z.literal('abc'), z.literal(123)))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.union())).toEqualTypeOf<never>()
  })
  test('refine method', () => {
    const isUnder3 = (value: number): value is 0 | 1 | 2 => Number.isInteger(value) && 0 <= value && value <= 2
    expectTypeOf(infer(z.number.refine(isUnder3))).toEqualTypeOf<0 | 1 | 2>()
  })
})
