import { NonEmptyArray } from 'base-up'
import { describe, expectTypeOf, test } from 'vitest'
import { z } from './index'
import { Schema } from './schema'

describe('Infer', () => {
  /**
   * Helper function to infer the type from the schema.
   * It is convenient when used in combination with expectTypeOf.
   */
  function infer<const T extends Schema>(value: T): z.Infer<T> {
    return value as any
  }

  test('atomic types', () => {
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
  })
  test('literal types', () => {
    expectTypeOf(infer(z.literal('abc'))).toMatchTypeOf<'abc'>()
    expectTypeOf(infer(z.literal(123))).toEqualTypeOf<123>()
    expectTypeOf(infer(z.literal([]))).toEqualTypeOf<readonly []>()
    expectTypeOf(infer(z.literal([1, 2, 3]))).toEqualTypeOf<readonly [1, 2, 3]>()
    expectTypeOf(infer(z.literal({}))).toEqualTypeOf<{}>()
    expectTypeOf(infer(z.literal({ name: 'Bob' }))).toEqualTypeOf<{ readonly name: 'Bob' }>()
  })
  test('class types', () => {
    expectTypeOf(infer(z.class(Blob))).toEqualTypeOf<Blob>()
    expectTypeOf(infer(z.class(URL))).toEqualTypeOf<URL>()
    expectTypeOf(infer(z.class(Date))).toEqualTypeOf<Date>()
    expectTypeOf(infer(z.class(RegExp))).toEqualTypeOf<RegExp>()
    expectTypeOf(infer(z.class(Error))).toEqualTypeOf<Error>()
    expectTypeOf(infer(z.class(Set))).toEqualTypeOf<Set<unknown>>()
    expectTypeOf(infer(z.class(Promise))).toEqualTypeOf<Promise<unknown>>()

    class MyClass {}
    expectTypeOf(infer(z.class(MyClass))).toEqualTypeOf<MyClass>()
    abstract class MyAbstractClass {}
    expectTypeOf(infer(z.class(MyAbstractClass))).toEqualTypeOf<MyAbstractClass>()
  })
  test('Array types', () => {
    expectTypeOf(infer(z.Array(z.boolean))).toEqualTypeOf<boolean[]>()
    expectTypeOf(infer(z.Array(z.union(z.number, z.string)))).toEqualTypeOf<(number | string)[]>()
    expectTypeOf(infer(z.NonEmptyArray(z.any))).toEqualTypeOf<NonEmptyArray<any>>()
  })
  test('object types', () => {
    expectTypeOf(infer(z.object({ name: z.string }))).toEqualTypeOf<{ name: string }>()
    expectTypeOf(infer(z.object({ name: z.string }, { age: z.number }))).toEqualTypeOf<{
      name: string
      age?: number
    }>()
    expectTypeOf(infer(z.object({}))).toEqualTypeOf<{}>()
  })
  test('union types', () => {
    expectTypeOf(infer(z.union(z.number, z.undefined))).toEqualTypeOf<number | undefined>()
    expectTypeOf(infer(z.union(z.literal('abc'), z.literal(123)))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.union())).toEqualTypeOf<never>()
  })
  test('intersection types', () => {
    expectTypeOf(infer(z.intersection(z.string, z.object({})))).toEqualTypeOf<string & {}>()
    expectTypeOf(infer(z.intersection(z.object({ name: z.string }), z.object({ age: z.number })))).toEqualTypeOf<
      {
        name: string
      } & {
        age: number
      }
    >()
  })
  test('tuple types', () => {
    expectTypeOf(infer(z.tuple(z.number, z.string))).toEqualTypeOf<[number, string]>()
    expectTypeOf(infer(z.tuple())).toEqualTypeOf<[]>()
  })
  test('literalUnion shorthand', () => {
    expectTypeOf(infer(z.literalUnion('abc', 123))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.literalUnion('abc'))).toEqualTypeOf<'abc'>()
    expectTypeOf(infer(z.literalUnion())).toEqualTypeOf<never>()
  })
  test('Record types', () => {
    expectTypeOf(infer(z.Record(z.string, z.number))).toEqualTypeOf<Record<string, number>>()
    expectTypeOf(infer(z.Record(z.literal('a'), z.number))).toEqualTypeOf<{ a: number }>()
    expectTypeOf(infer(z.Record(z.number, z.number))).toEqualTypeOf<Record<number, number>>()
    expectTypeOf(infer(z.Record(z.literal(0), z.boolean))).toEqualTypeOf<{ 0: boolean }>()
    expectTypeOf(infer(z.Record(z.symbol, z.any))).toEqualTypeOf<Record<symbol, any>>()
    expectTypeOf(infer(z.Record(z.never, z.any))).toEqualTypeOf<Record<never, any>>()
    expectTypeOf(infer(z.Record(z.boolean, z.any))).toEqualTypeOf<never>()
  })
  test('recursive types', () => {
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
        z.Array(
          z.recursive(
            z.union(
              z.object({ type: z.literal('Nil') }),
              z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
            )
          )
        )
      )
    ).toEqualTypeOf<List[]>()
    expectTypeOf(
      infer(
        z.Array(
          z.recursive(
            'List',
            z.union(
              z.object({ type: z.literal('Nil') }),
              z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion('List') })
            )
          )
        )
      )
    ).toEqualTypeOf<List[]>()
  })
})
