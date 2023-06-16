import { NonEmptyArray } from 'base-up'
import { describe, expect, expectTypeOf } from 'vitest'
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

describe('isValid', () => {
  it('boolean', () => {
    expect(z.isValid(true, z.boolean)).toBe(true)
    expect(z.isValid('true', z.boolean)).toBe(false)
  })
  it('number', () => {
    expect(z.isValid(123, z.number)).toBe(true)
    expect(z.isValid('123', z.number)).toBe(false)
  })
  it('bigint', () => {
    expect(z.isValid(123n, z.bigint)).toBe(true)
    expect(z.isValid(123, z.bigint)).toBe(false)
  })
  it('string', () => {
    expect(z.isValid('abc', z.string)).toBe(true)
    expect(z.isValid(123, z.string)).toBe(false)
  })
  it('symbol', () => {
    expect(z.isValid(Symbol(), z.symbol)).toBe(true)
    expect(z.isValid('abc', z.symbol)).toBe(false)
  })
  it('null', () => {
    expect(z.isValid(null, z.null)).toBe(true)
    expect(z.isValid(undefined, z.null)).toBe(false)
  })
  it('undefined', () => {
    expect(z.isValid(undefined, z.undefined)).toBe(true)
    expect(z.isValid(null, z.undefined)).toBe(false)
  })
  it('nullish', () => {
    expect(z.isValid(null, z.nullish)).toBe(true)
    expect(z.isValid(undefined, z.nullish)).toBe(true)
    expect(z.isValid(0, z.nullish)).toBe(false)
  })
  it('void', () => {
    expect(z.isValid(undefined, z.void)).toBe(true)
    expect(z.isValid(null, z.void)).toBe(false)
  })
  it('unknown', () => {
    expect(z.isValid(123, z.unknown)).toBe(true)
  })
  it('any', () => {
    expect(z.isValid(123, z.any)).toBe(true)
  })
  it('never', () => {
    expect(z.isValid(123, z.never)).toBe(false)
  })
  it('literal', () => {
    expect(z.isValid('abc', z.literal('abc'))).toBe(true)
    expect(z.isValid('xyz', z.literal('abc'))).toBe(false)
    expect(z.isValid(123, z.literal('abc'))).toBe(false)
  })
  it('array', () => {
    expect(z.isValid([false, true], z.array(z.boolean))).toBe(true)
    expect(z.isValid([], z.array(z.number))).toBe(true)
    expect(z.isValid({ 0: false, 1: true }, z.array(z.boolean))).toBe(false)
    expect(z.isValid([123], z.array(z.boolean))).toBe(false)
  })
  it('nonEmptyArray', () => {
    expect(z.isValid([false, true], z.nonEmptyArray(z.boolean))).toBe(true)
    expect(z.isValid([], z.nonEmptyArray(z.number))).toBe(false)
    expect(z.isValid({ 0: false, 1: true }, z.nonEmptyArray(z.boolean))).toBe(false)
    expect(z.isValid([123], z.nonEmptyArray(z.boolean))).toBe(false)
  })
  it('object', () => {
    expect(z.isValid({ name: 'John' }, z.object({ name: z.string }))).toBe(true)
    expect(z.isValid({ name: 'John' }, z.object({ name: z.symbol }))).toBe(false)

    expect(z.isValid({ name: 'John' }, z.object({}, { age: z.number }))).toBe(true)
    expect(z.isValid({ name: 'John', age: 42 }, z.object({}, { age: z.number }))).toBe(true)
    expect(z.isValid({ name: 'John', age: '42' }, z.object({}, { age: z.number }))).toBe(false)
  })
  it('union', () => {
    expect(z.isValid(123, z.union(z.boolean, z.number))).toBe(true)
    expect(z.isValid(123, z.union(z.literal(123), z.literal(456)))).toBe(true)
    expect(z.isValid(true, z.union())).toBe(false)
  })
  it('intersection', () => {})
  it('tuple', () => {
    expect(z.isValid([true, 123], z.tuple(z.boolean, z.number))).toBe(true)
    expect(z.isValid([true, 123], z.tuple(z.boolean, z.number, z.string))).toBe(false)
    expect(z.isValid([true, 123], z.tuple(z.boolean))).toBe(false)
    expect(z.isValid([true, 123], z.tuple(z.string, z.bigint))).toBe(false)
    expect(z.isValid([], z.tuple())).toBe(true)
  })
  it('recursion', () => {
    const listSchema = z.recursive(
      z.union(
        z.object({ type: z.literal('Nil') }),
        z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
      )
    )
    expect(z.isValid({ type: 'Cons', value: 1, next: { type: 'Nil' } }, listSchema)).toBe(true)
    expect(z.isValid([{ type: 'Nil' }], z.array(listSchema))).toBe(true)
  })
})
