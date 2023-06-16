import { NonEmptyArray } from 'base-up'
import { expectTypeOf } from 'vitest'
import { z } from './index'

test('Infer', () => {
  /**
   * Helper function to infer the type of a schema.
   * It is convenient when used in combination with expectTypeOf.
   */
  function infer<const T>(value: T): z.Infer<T> {
    return value as any
  }

  expectTypeOf(infer(z.boolean)).toEqualTypeOf<boolean>()
  expectTypeOf(infer(z.number)).toEqualTypeOf<number>()
  expectTypeOf(infer(z.bigint)).toEqualTypeOf<bigint>()
  expectTypeOf(infer(z.string)).toEqualTypeOf<string>()
  expectTypeOf(infer(z.symbol)).toEqualTypeOf<symbol>()
  expectTypeOf(infer(z.null)).toEqualTypeOf<null>()
  expectTypeOf(infer(z.undefined)).toEqualTypeOf<undefined>()
  expectTypeOf(infer(z.nullish)).toEqualTypeOf<null | undefined>()
  expectTypeOf(infer(z.void)).toEqualTypeOf<void>()
  expectTypeOf(infer(z.unknown)).toEqualTypeOf<unknown>()
  expectTypeOf(infer(z.any)).toEqualTypeOf<any>()
  expectTypeOf(infer(z.never)).toEqualTypeOf<never>()

  expectTypeOf(infer(z.literal('abc'))).toMatchTypeOf<'abc'>()
  expectTypeOf(infer(z.literal(123))).toEqualTypeOf<123>()

  expectTypeOf(infer(z.array(z.boolean))).toEqualTypeOf<boolean[]>()
  expectTypeOf(infer(z.nonEmptyArray(z.any))).toEqualTypeOf<NonEmptyArray<any>>()

  expectTypeOf(infer(z.object({ name: z.string }))).toEqualTypeOf<{ name: string }>()
  expectTypeOf(infer(z.object({ name: z.string }, { age: z.number }))).toEqualTypeOf<{
    name: string
    age?: number
  }>()

  expectTypeOf(infer(z.union(z.number, z.undefined))).toEqualTypeOf<number | undefined>()
  expectTypeOf(infer(z.union(z.literal('abc'), z.literal(123)))).toEqualTypeOf<'abc' | 123>()
  expectTypeOf(infer(z.union())).toEqualTypeOf<never>()

  expectTypeOf(infer(z.intersection(z.object({ name: z.string }), z.object({ age: z.number })))).toEqualTypeOf<{
    name: string
    age: number
  }>()

  expectTypeOf(infer(z.tuple(z.number, z.string))).toEqualTypeOf<[number, string]>()
  expectTypeOf(infer(z.tuple())).toEqualTypeOf<[]>()

  type List = { type: 'Nil' } | { type: 'Cons'; value: number; next: List }
  expectTypeOf(
    infer(
      z.union(
        z.object({ type: z.literal('Nil') }),
        z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
      )
    )
  ).toEqualTypeOf<List>()

  expectTypeOf(
    infer(
      z.array(
        z.recursive(
          z.union(
            z.object({ type: z.literal('Nil') }),
            z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
          )
        )
      )
    )
  ).toEqualTypeOf<List[]>()
})
