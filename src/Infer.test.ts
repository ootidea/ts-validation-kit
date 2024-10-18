import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer', () => {
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
