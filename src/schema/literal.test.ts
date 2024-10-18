import { Result } from 'result-type-ts'
import { describe, expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredType } from '../utilities'

describe('literal schema', () => {
  test('boolean literals', () => {
    expectInferredType(z.literal(true)).toBe<true>()
    expect(z.validate(z.literal(true), true)).toStrictEqual(Result.success(true))
    expect(z.validate(z.literal(true), false)).toStrictEqual(Result.failure({ message: 'not equal to true', path: [] }))
  })
  test('number literals', () => {
    expectInferredType(z.literal(0)).toBe<0>()
    expect(z.validate(z.literal(0), 0)).toStrictEqual(Result.success(0))
    expect(z.validate(z.literal(0), 1)).toStrictEqual(Result.failure({ message: 'not equal to 0', path: [] }))
  })
  test('string literals', () => {
    expectInferredType(z.literal(1n)).toBe<1n>()
    expect(z.validate(z.literal(1n), 1n)).toStrictEqual(Result.success(1n))
    expect(z.validate(z.literal(1n), 2n)).toStrictEqual(Result.failure({ message: 'not equal to 1n', path: [] }))
  })
  test('bigint literals', () => {
    expectInferredType(z.literal('a')).toBe<'a'>()
    expect(z.validate(z.literal('a'), 'a')).toStrictEqual(Result.success('a'))
    expect(z.validate(z.literal('a'), 'b')).toStrictEqual(Result.failure({ message: 'not equal to "a"', path: [] }))
  })
  test('unique symbols', () => {
    const uniqueSymbol = Symbol('a')
    expectInferredType(z.literal(uniqueSymbol)).toBe<typeof uniqueSymbol>()
    expect(z.validate(z.literal(uniqueSymbol), uniqueSymbol)).toStrictEqual(Result.success(uniqueSymbol))
    expect(z.validate(z.literal(uniqueSymbol), Symbol('a'))).toStrictEqual(
      Result.failure({ message: 'not equal to Symbol(a)', path: [] }),
    )
  })
})
