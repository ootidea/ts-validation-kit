import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('boolean schema', () => {
  expectInferredType(z.boolean).toBe<boolean>()
  expectInferredInputType(z.boolean).toBe<unknown>()
  expect(z.validate(z.boolean, true)).toStrictEqual(Result.success(true))
  expect(z.validate(z.boolean, 1)).toStrictEqual(Result.failure({ message: 'not a boolean', path: [] }))
})
test('number schema', () => {
  expectInferredType(z.number).toBe<number>()
  expectInferredInputType(z.number).toBe<unknown>()
  expect(z.validate(z.number, 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.number, 1n)).toStrictEqual(Result.failure({ message: 'not a number', path: [] }))
})
test('bigint schema', () => {
  expectInferredType(z.bigint).toBe<bigint>()
  expectInferredInputType(z.bigint).toBe<unknown>()
  expect(z.validate(z.bigint, 1n)).toStrictEqual(Result.success(1n))
  expect(z.validate(z.bigint, 'a')).toStrictEqual(Result.failure({ message: 'not a bigint', path: [] }))
})
test('string schema', () => {
  expectInferredType(z.string).toBe<string>()
  expectInferredInputType(z.string).toBe<unknown>()
  expect(z.validate(z.string, 'a')).toStrictEqual(Result.success('a'))
  expect(z.validate(z.string, Symbol('a'))).toStrictEqual(Result.failure({ message: 'not a string', path: [] }))
})
test('symbol schema', () => {
  expectInferredType(z.symbol).toBe<symbol>()
  expectInferredInputType(z.symbol).toBe<unknown>()
  const uniqueSymbol = Symbol('a')
  expect(z.validate(z.symbol, uniqueSymbol)).toStrictEqual(Result.success(uniqueSymbol))
  expect(z.validate(z.symbol, true)).toStrictEqual(Result.failure({ message: 'not a symbol', path: [] }))
})
test('unknown schema', () => {
  expectInferredType(z.unknown).toBe<unknown>()
  expectInferredInputType(z.unknown).toBe<unknown>()
  expect(z.validate(z.unknown, 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.unknown, null)).toStrictEqual(Result.success(null))
})
test('any schema', () => {
  expectInferredType(z.any).toBe<any>()
  expectInferredInputType(z.any).toBe<unknown>()
  expect(z.validate(z.any, 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.any, null)).toStrictEqual(Result.success(null))
})
test('never schema', () => {
  expectInferredType(z.never).toBe<never>()
  expectInferredInputType(z.never).toBe<unknown>()
  expect(z.validate(z.never, 1)).toStrictEqual(
    Result.failure({ message: 'never type does not accept any value', path: [] }),
  )
})
