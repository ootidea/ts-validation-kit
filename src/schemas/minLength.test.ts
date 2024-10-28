import { test } from 'vitest'
import * as z from '../index'
import { expectInferredType } from '../utilities'

test('minLength schema', () => {
  expectInferredType(z.pipe(z.string, z.minLength(1))).toBe<string>()
  expectInferredType(z.pipe(z.Array(z.number), z.minLength(1))).toBe<number[]>()
  // @ts-expect-error length property is not available on boolean type.
  expectInferredType(z.pipe(z.boolean, z.minLength(1))).toBe<number>()
})
