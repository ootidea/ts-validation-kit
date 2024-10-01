import { it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

it('infers object types', () => {
  expectInferredType(z.object({ a: z.number, b: z.number })).toBe<{ a: number; b: number }>()
  expectInferredType(z.object({})).toBe<{}>()
})
