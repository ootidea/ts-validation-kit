import { Result } from 'result-type-ts'
import { describe, expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

describe('object schema', () => {
  test('object schema without optional properties', () => {
    expectInferredType(z.object({})).toBe<{}>()
    expectInferredType(z.object({ a: z.number })).toBe<{ a: number }>()
    expectInferredType(z.object({ a: z.number, b: z.string })).toBe<{ a: number; b: string }>()
    expectInferredInputType(z.object({ a: z.number })).toBe<unknown>()
    expect(z.validate(z.object({ a: z.number }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
    expect(z.validate(z.object({ a: z.number }), { a: null })).toStrictEqual(
      Result.failure({ message: 'not a number', path: ['a'] }),
    )
    expect(z.validate(z.object({ a: z.number }), null)).toStrictEqual(
      Result.failure({ message: 'not an object', path: [] }),
    )
  })
  test('object schema with optional properties', () => {
    expectInferredType(z.object({ a: z.optional(z.number) })).toBe<{ a?: number }>()
    expectInferredType(z.object({ a: z.optional(z.number), b: z.string })).toBe<{ a?: number; b: string }>()
    expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
    expect(z.validate(z.object({ a: z.optional(z.number) }), {})).toStrictEqual(Result.success({}))
    expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 'a' })).toStrictEqual(
      Result.failure({ message: 'not a number', path: ['a'] }),
    )
  })
})
