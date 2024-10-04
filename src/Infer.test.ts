import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer', () => {
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
})
