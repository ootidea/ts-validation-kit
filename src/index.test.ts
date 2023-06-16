import { NonEmptyArray } from 'base-up'
import { describe, expect, expectTypeOf } from 'vitest'
import { fct } from './index'

test('Infer', () => {
  /**
   * Helper function to infer the type of a schema.
   * It is convenient when used in combination with expectTypeOf.
   */
  function infer<const T>(value: T): fct.Infer<T> {
    return value as any
  }

  expectTypeOf(infer(fct.boolean)).toEqualTypeOf<boolean>()
  expectTypeOf(infer(fct.number)).toEqualTypeOf<number>()
  expectTypeOf(infer(fct.bigint)).toEqualTypeOf<bigint>()
  expectTypeOf(infer(fct.string)).toEqualTypeOf<string>()
  expectTypeOf(infer(fct.symbol)).toEqualTypeOf<symbol>()
  expectTypeOf(infer(fct.null)).toEqualTypeOf<null>()
  expectTypeOf(infer(fct.undefined)).toEqualTypeOf<undefined>()
  expectTypeOf(infer(fct.void)).toEqualTypeOf<void>()
  expectTypeOf(infer(fct.unknown)).toEqualTypeOf<unknown>()
  expectTypeOf(infer(fct.any)).toEqualTypeOf<any>()
  expectTypeOf(infer(fct.never)).toEqualTypeOf<never>()

  expectTypeOf(infer(fct.literal('abc'))).toMatchTypeOf<'abc'>()
  expectTypeOf(infer(fct.literal(123))).toEqualTypeOf<123>()

  expectTypeOf(infer(fct.array(fct.boolean))).toEqualTypeOf<boolean[]>()
  expectTypeOf(infer(fct.nonEmptyArray(fct.any))).toEqualTypeOf<NonEmptyArray<any>>()

  expectTypeOf(infer(fct.object({ name: fct.string }))).toEqualTypeOf<{ name: string }>()
  expectTypeOf(infer(fct.object({ name: fct.string }, { age: fct.number }))).toEqualTypeOf<{
    name: string
    age?: number
  }>()

  expectTypeOf(infer(fct.union(fct.number, fct.undefined))).toEqualTypeOf<number | undefined>()
  expectTypeOf(infer(fct.union(fct.literal('abc'), fct.literal(123)))).toEqualTypeOf<'abc' | 123>()
  expectTypeOf(infer(fct.union())).toEqualTypeOf<never>()

  expectTypeOf(
    infer(fct.intersection(fct.object({ name: fct.string }), fct.object({ age: fct.number })))
  ).toEqualTypeOf<{ name: string; age: number }>()

  expectTypeOf(infer(fct.tuple(fct.number, fct.string))).toEqualTypeOf<[number, string]>()
  expectTypeOf(infer(fct.tuple())).toEqualTypeOf<[]>()

  type List = { type: 'Nil' } | { type: 'Cons'; value: number; next: List }
  expectTypeOf(
    infer(
      fct.union(
        fct.object({ type: fct.literal('Nil') }),
        fct.object({ type: fct.literal('Cons'), value: fct.number, next: fct.recursion })
      )
    )
  ).toEqualTypeOf<List>()

  expectTypeOf(
    infer(
      fct.array(
        fct.recursive(
          fct.union(
            fct.object({ type: fct.literal('Nil') }),
            fct.object({ type: fct.literal('Cons'), value: fct.number, next: fct.recursion })
          )
        )
      )
    )
  ).toEqualTypeOf<List[]>()
})

describe('isValid', () => {
  it('boolean', () => {
    expect(fct.isValid(true, fct.boolean)).toBe(true)
    expect(fct.isValid('true', fct.boolean)).toBe(false)
  })
  it('number', () => {
    expect(fct.isValid(123, fct.number)).toBe(true)
    expect(fct.isValid('123', fct.number)).toBe(false)
  })
  it('bigint', () => {
    expect(fct.isValid(123n, fct.bigint)).toBe(true)
    expect(fct.isValid(123, fct.bigint)).toBe(false)
  })
  it('string', () => {
    expect(fct.isValid('abc', fct.string)).toBe(true)
    expect(fct.isValid(123, fct.string)).toBe(false)
  })
  it('symbol', () => {
    expect(fct.isValid(Symbol(), fct.symbol)).toBe(true)
    expect(fct.isValid('abc', fct.symbol)).toBe(false)
  })
  it('null', () => {
    expect(fct.isValid(null, fct.null)).toBe(true)
    expect(fct.isValid(undefined, fct.null)).toBe(false)
  })
  it('undefined', () => {
    expect(fct.isValid(undefined, fct.undefined)).toBe(true)
    expect(fct.isValid(null, fct.undefined)).toBe(false)
  })
  it('void', () => {
    expect(fct.isValid(undefined, fct.void)).toBe(true)
    expect(fct.isValid(null, fct.void)).toBe(false)
  })
  it('unknown', () => {
    expect(fct.isValid(123, fct.unknown)).toBe(true)
  })
  it('any', () => {
    expect(fct.isValid(123, fct.any)).toBe(true)
  })
  it('never', () => {
    expect(fct.isValid(123, fct.never)).toBe(false)
  })
  it('literal', () => {
    expect(fct.isValid('abc', fct.literal('abc'))).toBe(true)
    expect(fct.isValid('xyz', fct.literal('abc'))).toBe(false)
    expect(fct.isValid(123, fct.literal('abc'))).toBe(false)
  })
  it('array', () => {
    expect(fct.isValid([false, true], fct.array(fct.boolean))).toBe(true)
    expect(fct.isValid([], fct.array(fct.number))).toBe(true)
    expect(fct.isValid({ 0: false, 1: true }, fct.array(fct.boolean))).toBe(false)
    expect(fct.isValid([123], fct.array(fct.boolean))).toBe(false)
  })
  it('nonEmptyArray', () => {
    expect(fct.isValid([false, true], fct.nonEmptyArray(fct.boolean))).toBe(true)
    expect(fct.isValid([], fct.nonEmptyArray(fct.number))).toBe(false)
    expect(fct.isValid({ 0: false, 1: true }, fct.nonEmptyArray(fct.boolean))).toBe(false)
    expect(fct.isValid([123], fct.nonEmptyArray(fct.boolean))).toBe(false)
  })
  it('object', () => {
    expect(fct.isValid({ name: 'John' }, fct.object({ name: fct.string }))).toBe(true)
    expect(fct.isValid({ name: 'John' }, fct.object({ name: fct.symbol }))).toBe(false)

    expect(fct.isValid({ name: 'John' }, fct.object({}, { age: fct.number }))).toBe(true)
    expect(fct.isValid({ name: 'John', age: 42 }, fct.object({}, { age: fct.number }))).toBe(true)
    expect(fct.isValid({ name: 'John', age: '42' }, fct.object({}, { age: fct.number }))).toBe(false)
  })
  it('union', () => {
    expect(fct.isValid(123, fct.union(fct.boolean, fct.number))).toBe(true)
    expect(fct.isValid(123, fct.union(fct.literal(123), fct.literal(456)))).toBe(true)
    expect(fct.isValid(true, fct.union())).toBe(false)
  })
  it('intersection', () => {})
  it('tuple', () => {
    expect(fct.isValid([true, 123], fct.tuple(fct.boolean, fct.number))).toBe(true)
    expect(fct.isValid([true, 123], fct.tuple(fct.boolean, fct.number, fct.string))).toBe(false)
    expect(fct.isValid([true, 123], fct.tuple(fct.boolean))).toBe(false)
    expect(fct.isValid([true, 123], fct.tuple(fct.string, fct.bigint))).toBe(false)
    expect(fct.isValid([], fct.tuple())).toBe(true)
  })
  it('recursion', () => {
    const listSchema = fct.recursive(
      fct.union(
        fct.object({ type: fct.literal('Nil') }),
        fct.object({ type: fct.literal('Cons'), value: fct.number, next: fct.recursion })
      )
    )
    expect(fct.isValid({ type: 'Cons', value: 1, next: { type: 'Nil' } }, listSchema)).toBe(true)
    expect(fct.isValid([{ type: 'Nil' }], fct.array(listSchema))).toBe(true)
  })
})
