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
  expectTypeOf(infer(fct.object({ name: fct.string }))).toEqualTypeOf<{ name: string }>()
  expectTypeOf(infer(fct.object({ name: fct.string }, { age: fct.number }))).toEqualTypeOf<{
    name: string
    age?: number
  }>()

  expectTypeOf(infer(fct.union(fct.number, fct.undefined))).toEqualTypeOf<number | undefined>()
  expectTypeOf(infer(fct.union(fct.literal('abc'), fct.literal(123)))).toEqualTypeOf<'abc' | 123>()
  expectTypeOf(infer(fct.union())).toEqualTypeOf<never>()

  expectTypeOf(infer(fct.tuple(fct.number, fct.string))).toEqualTypeOf<[number, string]>()
  expectTypeOf(infer(fct.tuple())).toEqualTypeOf<[]>()
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
  it('object', () => {
    expect(fct.isValid({ name: 'John' }, fct.object({ name: fct.string }))).toBe(true)
    expect(fct.isValid({ name: 'John' }, fct.object({ name: fct.symbol }))).toBe(false)
  })
  it('union', () => {
    expect(fct.isValid(123, fct.union(fct.boolean, fct.number))).toBe(true)
  })
  it('intersection', () => {})
  it('tuple', () => {})
})
