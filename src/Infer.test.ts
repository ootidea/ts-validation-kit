import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer', () => {
  it('infers literal types', () => {
    expectInferredType(z.literal(true)).toBe<true>()
    expectInferredType(z.literal(0)).toBe<0>()
    expectInferredType(z.literal(1n)).toBe<1n>()
    expectInferredType(z.literal('a')).toBe<'a'>()
    const uniqueSymbol: unique symbol = Symbol('a')
    expectInferredType(z.literal(uniqueSymbol)).toBe<typeof uniqueSymbol>()
  })
  it('infers null and undefined types', () => {
    expectInferredType(z.null).toBe<null>()
    expectInferredType(z.undefined).toBe<undefined>()
  })
  it('infers object types', () => {
    expectInferredType(z.object({ a: z.number, b: z.string })).toBe<{ a: number; b: string }>()
    expectInferredType(z.object({})).toBe<{}>()
  })
  it('infers optional properties', () => {
    expectInferredType(z.object({ a: z.optional(z.number) })).toBe<{ a?: number }>()
    expectInferredType(z.object({ a: z.optional(z.number), b: z.string })).toBe<{ a?: number; b: string }>()
  })
  it('infers array types', () => {
    expectInferredType(z.Array(z.number)).toBe<number[]>()
    expectInferredType(z.Array(z.Array(z.number))).toBe<number[][]>()
  })
  it('infers or types', () => {
    expectInferredType(z.or(z.number, z.string)).toBe<number | string>()
    expectInferredType(z.or(z.boolean, z.null, z.undefined)).toBe<boolean | null | undefined>()
    expectInferredType(
      z.or(
        z.predicate((value) => value === 0),
        z.predicate((value) => value === 1),
      ),
    ).toBe<0 | 1>()
    expectInferredType(z.or(z.Array(z.never), z.object({}))).toBe<never[] | {}>()
  })
  it('infers recursive types', () => {
    const TreeSchema = z.object({
      value: z.unknown,
      children: z.Array(z.recursive(() => TreeSchema)),
    })
    type Tree = {
      value: unknown
      children: Tree[]
    }
    expectInferredType(TreeSchema).toBe<Tree>()
  })
  it('infers predicate narrowing types', () => {
    expectInferredType(z.predicate((value): value is 0 => value === 0)).toBe<0>()
    expectInferredType(z.predicate((value: string) => Boolean(value))).toBe<string>()
  })
  it('infers converter return type', () => {
    expectInferredType(z.convert(Number)).toBe<number>()
    expectInferredType(z.convert((value) => `${value}`)).toBe<string>()
    expectInferredType(z.convert((value: number) => `${value}` as const)).toBe<`${number}`>()
  })
  it('infers piped types', () => {
    expectInferredType(
      z.pipe(
        z.number,
        z.predicate((value) => value === 0 || value === 1),
        z.predicate((value: 0 | 1) => Boolean(value)),
      ),
    ).toBe<0 | 1>()
    expectInferredType(
      z.pipe(
        z.number,
        z.convert(String),
        z.predicate((value) => value.length < 5),
      ),
    ).toBe<string>()
  })
})
