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
    expectTypeOf(infer(z.string)).toEqualTypeOf<string>()
    expectTypeOf(infer(z.number)).toEqualTypeOf<number>()
    expectTypeOf(infer(z.boolean)).toEqualTypeOf<boolean>()
    expectTypeOf(infer(z.bigint)).toEqualTypeOf<bigint>()
    expectTypeOf(infer(z.symbol)).toEqualTypeOf<symbol>()
    expectTypeOf(infer(z.undefined)).toEqualTypeOf<undefined>()
    expectTypeOf(infer(z.null)).toEqualTypeOf<null>()
    expectTypeOf(infer(z.nullish)).toEqualTypeOf<null | undefined>()
    expectTypeOf(infer(z.unknown)).toEqualTypeOf<unknown>()
    expectTypeOf(infer(z.any)).toEqualTypeOf<any>()
    expectTypeOf(infer(z.never)).toEqualTypeOf<never>()
    expectTypeOf(infer(z.void)).toEqualTypeOf<void>()
  })
  test('literal function', () => {
    expectTypeOf(infer(z.literal('abc'))).toMatchTypeOf<'abc'>()
    expectTypeOf(infer(z.literal(123))).toEqualTypeOf<123>()
    expectTypeOf(infer(z.literal([]))).toEqualTypeOf<readonly []>()
    expectTypeOf(infer(z.literal([1, 2, 3]))).toEqualTypeOf<readonly [1, 2, 3]>()
    expectTypeOf(infer(z.literal({}))).toEqualTypeOf<{}>()
    expectTypeOf(infer(z.literal({ name: 'Bob' }))).toEqualTypeOf<{ readonly name: 'Bob' }>()
  })
  test('Array function', () => {
    expectTypeOf(infer(z.Array(z.boolean))).toEqualTypeOf<boolean[]>()
    expectTypeOf(infer(z.Array(z.union(z.number, z.string)))).toEqualTypeOf<(number | string)[]>()

    expectTypeOf(infer(z.NonEmptyArray(z.any))).toEqualTypeOf<NonEmptyArray<any>>()
  })
  test('tuple function', () => {
    expectTypeOf(infer(z.tuple(z.number, z.string))).toEqualTypeOf<[number, string]>()
    expectTypeOf(infer(z.tuple())).toEqualTypeOf<[]>()
  })
  test('object function', () => {
    expectTypeOf(infer(z.object({ name: z.string }))).toEqualTypeOf<{ name: string }>()
    expectTypeOf(infer(z.object({ name: z.string }, { age: z.number }))).toEqualTypeOf<{
      name: string
      age?: number
    }>()
    expectTypeOf(infer(z.object({}))).toEqualTypeOf<{}>()
  })
  test('Record function', () => {
    expectTypeOf(infer(z.Record(z.string, z.number))).toEqualTypeOf<Record<string, number>>()
    expectTypeOf(infer(z.Record(z.literal('a'), z.number))).toEqualTypeOf<{ a: number }>()
    expectTypeOf(infer(z.Record(z.number, z.number))).toEqualTypeOf<Record<number, number>>()
    expectTypeOf(infer(z.Record(z.literal(0), z.boolean))).toEqualTypeOf<{ 0: boolean }>()
    expectTypeOf(infer(z.Record(z.symbol, z.any))).toEqualTypeOf<Record<symbol, any>>()
    expectTypeOf(infer(z.Record(z.never, z.any))).toEqualTypeOf<Record<never, any>>()
    expectTypeOf(infer(z.Record(z.boolean, z.any))).toEqualTypeOf<never>()
  })
  test('union function', () => {
    expectTypeOf(infer(z.union(z.number, z.undefined))).toEqualTypeOf<number | undefined>()
    expectTypeOf(infer(z.union(z.literal('abc'), z.literal(123)))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.union())).toEqualTypeOf<never>()
  })
  test('or method', () => {
    expectTypeOf(infer(z.number.or(z.undefined))).toEqualTypeOf<number | undefined>()
    expectTypeOf(infer(z.literal('abc').or(z.literal(123)))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.number.or(z.undefined).or(z.null))).toEqualTypeOf<number | undefined | null>()
  })
  test('literalUnion function', () => {
    expectTypeOf(infer(z.literalUnion('abc', 123))).toEqualTypeOf<'abc' | 123>()
    expectTypeOf(infer(z.literalUnion('abc'))).toEqualTypeOf<'abc'>()
    expectTypeOf(infer(z.literalUnion())).toEqualTypeOf<never>()
  })
  test('intersection function', () => {
    expectTypeOf(infer(z.intersection(z.string, z.object({})))).toEqualTypeOf<string & {}>()
    expectTypeOf(infer(z.intersection(z.object({ name: z.string }), z.object({ age: z.number })))).toEqualTypeOf<
      {
        name: string
      } & {
        age: number
      }
    >()
  })
  test('refine function', () => {
    expectTypeOf(infer(z.refine(z.number, (value) => value > 0))).toEqualTypeOf<number>()

    const isEmpty = (value: string): value is '' => value === ''
    expectTypeOf(infer(z.refine(z.string, isEmpty))).toEqualTypeOf<''>()

    const isUnder3 = (value: number): value is 0 | 1 | 2 => Number.isInteger(value) && 0 <= value && value <= 2
    expectTypeOf(infer(z.refine(z.number, isUnder3))).toEqualTypeOf<0 | 1 | 2>()
  })
  test('refine method', () => {
    expectTypeOf(infer(z.number.refine((value) => value > 0))).toEqualTypeOf<number>()

    const isEmpty = (value: string): value is '' => value === ''
    expectTypeOf(infer(z.string.refine(isEmpty))).toEqualTypeOf<''>()

    const isUnder3 = (value: number): value is 0 | 1 | 2 => Number.isInteger(value) && 0 <= value && value <= 2
    expectTypeOf(infer(z.number.refine(isUnder3))).toEqualTypeOf<0 | 1 | 2>()
  })
  test('class function', () => {
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
  describe('recursion function', () => {
    type List<T> = { type: 'Nil' } | { type: 'Cons'; value: T; next: List<T> }
    test('without z.recursive', () => {
      expectTypeOf(
        infer(
          z.union(
            z.object({ type: z.literal('Nil') }),
            z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
          )
        )
      ).toEqualTypeOf<List<number>>()
    })
    test('with z.recursive', () => {
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
      ).toEqualTypeOf<List<number>[]>()
    })
    test('keyed recursion', () => {
      expectTypeOf(
        infer(
          z.recursive(
            'List',
            z.union(
              z.object({ type: z.literal('Nil') }),
              z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion('List') })
            )
          )
        )
      ).toEqualTypeOf<List<number>>()
    })
  })
})
