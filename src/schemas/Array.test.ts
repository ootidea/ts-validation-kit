import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredType } from '../utilities'

test('Array schema', () => {
  expectInferredType(z.Array(z.number)).toBe<number[]>()
  expectInferredType(z.Array(z.Array(z.number))).toBe<number[][]>()
  expect(z.validate(z.Array(z.number), [1])).toStrictEqual(Result.success([1]))
  expect(z.validate(z.Array(z.number), ['a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [0] }))
  expect(z.validate(z.Array(z.number), [0, 'a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [1] }))
  expect(z.validate(z.Array(z.number), null)).toStrictEqual(Result.failure({ message: 'not an array', path: [] }))
})
