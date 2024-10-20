import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('Record schema', () => {
  expectInferredType(z.Record(z.string, z.any)).toBe<Record<string, any>>()
  expectInferredType(z.Record(z.number, z.any)).toBe<Record<number, any>>()
  expectInferredType(z.Record(z.symbol, z.any)).toBe<Record<symbol, any>>()
  expectInferredType(z.Record(z.or(z.string, z.number, z.symbol), z.any)).toBe<Record<keyof any, any>>()
  expectInferredInputType(z.Record(z.string, z.any)).toBe<unknown>()
  expect(z.validate(z.Record(z.string, z.any), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.Record(z.number, z.string), { 0: null })).toStrictEqual(
    Result.failure({ message: 'Record value: not a string', path: ['0'] }),
  )
  expect(z.validate(z.Record(z.symbol, z.null), { a: null })).toStrictEqual(
    Result.failure({ message: 'Record key: not a symbol', path: ['a'] }),
  )
})
test('Record schema with literal keys', () => {
  expectInferredType(z.Record(z.literal('a'), z.number)).toBe<{ a: number }>()
  expectInferredType(z.Record(z.literal(1), z.null)).toBe<{ 1: null }>()
  expect(z.validate(z.Record(z.literal('a'), z.number), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.Record(z.literal('a'), z.number), { a: null })).toStrictEqual(
    Result.failure({ message: 'Record value: not a number', path: ['a'] }),
  )
  expect(z.validate(z.Record(z.literal('a'), z.number), { b: 1 })).toStrictEqual(
    Result.failure({ message: 'Record key: not equal to "a"', path: ['b'] }),
  )
})
