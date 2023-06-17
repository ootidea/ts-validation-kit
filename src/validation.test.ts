import { describe, expect } from 'vitest'
import { z } from './index'

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
  it('Array', () => {
    expect(z.isValid([false, true], z.Array(z.boolean))).toBe(true)
    expect(z.isValid([], z.Array(z.number))).toBe(true)
    expect(z.isValid({ 0: false, 1: true }, z.Array(z.boolean))).toBe(false)
    expect(z.isValid([123], z.Array(z.boolean))).toBe(false)
  })
  it('NonEmptyArray', () => {
    expect(z.isValid([false, true], z.NonEmptyArray(z.boolean))).toBe(true)
    expect(z.isValid([], z.NonEmptyArray(z.number))).toBe(false)
    expect(z.isValid({ 0: false, 1: true }, z.NonEmptyArray(z.boolean))).toBe(false)
    expect(z.isValid([123], z.NonEmptyArray(z.boolean))).toBe(false)
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
  it('Record', () => {
    expect(z.isValid({ a: 1, b: 2 }, z.Record(z.string, z.number))).toBe(true)
    expect(z.isValid({ a: 1, b: 2 }, z.Record(z.number, z.number))).toBe(false)

    expect(z.isValid({ name: 'Bob', age: 5 }, z.Record(z.any, z.union(z.string, z.number)))).toBe(true)

    expect(z.isValid({ a: true, 0: 'first' }, z.Record(z.literalUnion('a', 0), z.any))).toBe(true)
    expect(z.isValid({ a: true, 0: 'first' }, z.Record(z.string, z.any))).toBe(true)
    expect(z.isValid({ a: true, 0: 'first' }, z.Record(z.number, z.any))).toBe(false)
  })
  it('recursion', () => {
    const listSchema = z.recursive(
      z.union(
        z.object({ type: z.literal('Nil') }),
        z.object({ type: z.literal('Cons'), value: z.number, next: z.recursion })
      )
    )
    expect(z.isValid({ type: 'Cons', value: 1, next: { type: 'Nil' } }, listSchema)).toBe(true)
    expect(z.isValid([{ type: 'Nil' }], z.Array(listSchema))).toBe(true)
  })
})
