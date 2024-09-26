import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer type', () => {
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
  it('infers or types', () => {
    expectInferredType(z.or(z.number, z.string)).toBe<number | string>()
    expectInferredType(z.or(z.number, z.undefined, z.null)).toBe<number | undefined | null>()
    expectInferredType(z.or()).toBe<never>()
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
  // it('infers piped types', () => {
  //   expectInferredType(
  //     z.pipe(
  //       z.or(z.number, z.null, z.undefined),
  //       (n) => n !== null,
  //       (n) => n !== undefined,
  //     ),
  //   ).toBe<number>()
  //   expectInferredType(z.pipe(z.number, (n) => n > 0)).toBe<number>()
  // })
  it('infers record types', () => {
    expectInferredType(z.Record(z.string, z.boolean)).toBe<Record<string, boolean>>()
    expectInferredType(z.Record(z.number, z.boolean)).toBe<Record<number, boolean>>()
    expectInferredType(z.Record(z.symbol, z.boolean)).toBe<Record<symbol, boolean>>()
    expectInferredType(z.Record(z.or(z.string, z.number, z.symbol), z.boolean)).toBe<Record<keyof any, boolean>>()

    expectInferredType(z.Record(z.literal('a'), z.null)).toBe<{ a: null }>()
    expectInferredType(z.Record(z.or(z.literal('a'), z.literal(1)), z.null)).toBe<{ a: null; 1: null }>()

    // @ts-expect-error The key type must extends string | number | symbol
    z.Record(z.boolean, z.number)
  })
})
