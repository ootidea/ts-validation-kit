import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer', () => {
  it('infers literal types', () => {
    expectInferredType(z.literal(true)).toBe<true>()
    expectInferredType(z.literal(123)).toBe<123>()
    expectInferredType(z.literal(123n)).toBe<123n>()
    expectInferredType(z.literal('abc')).toBe<'abc'>()
  })
  it('infers aliased literal types', () => {
    expectInferredType(z.true).toBe<true>()
    expectInferredType(z.false).toBe<false>()
    expectInferredType(z.null).toBe<null>()
    expectInferredType(z.undefined).toBe<undefined>()
  })
  it('infers other standard lowercase types', () => {
    expectInferredType(z.boolean).toBe<boolean>()
    expectInferredType(z.number).toBe<number>()
    expectInferredType(z.bigint).toBe<bigint>()
    expectInferredType(z.string).toBe<string>()
    expectInferredType(z.symbol).toBe<symbol>()
    expectInferredType(z.object).toBe<object>()
    expectInferredType(z.unknown).toBe<unknown>()
    expectInferredType(z.any).toBe<any>()
    expectInferredType(z.never).toBe<never>()
  })
  it('infers union types', () => {
    expectInferredType(z.union(z.number, z.string)).toBe<number | string>()
    expectInferredType(z.union(z.number, z.undefined, z.null)).toBe<number | undefined | null>()
    expectInferredType(z.union()).toBe<never>()
  })
  it('infers object types', () => {
    expectInferredType(z.object({ a: z.number, b: z.string })).toBe<{ a: number; b: string }>()
    expectInferredType(z.object({})).toBe<{}>()
  })
  it('infers optional properties', () => {
    expectInferredType(z.object({ a: z.optional(z.string) })).toBe<{ a?: string }>()
  })
  it('infers array types', () => {
    expectInferredType(z.Array(z.number)).toBe<number[]>()
  })
  it('infers refined types', () => {
    expectInferredType(
      z.refine(
        z.union(z.number, z.null, z.undefined),
        (n) => n !== null,
        (n) => n !== undefined,
      ),
    ).toBe<number>()
    expectInferredType(z.refine(z.number, (n) => n > 0)).toBe<number>()
  })
})
