import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('Array schema', () => {
  expectInferredType(z.Array(z.number)).toBe<number[]>()
  expectInferredType(z.Array(z.Array(z.number))).toBe<number[][]>()
  expectInferredInputType(z.Array(z.number)).toBe<unknown>()
  expect(z.validate(z.Array(z.number), [1])).toStrictEqual(Result.success([1]))
  expect(z.validate(z.Array(z.number), ['a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [0] }))
  expect(z.validate(z.Array(z.number), [0, 'a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [1] }))
  expect(z.validate(z.Array(z.number), null)).toStrictEqual(Result.failure({ message: 'not an array', path: [] }))
})
test('Array schema containing converter schema', () => {
  expectInferredType(z.Array(z.convert(Number))).toBe<number[]>()
  expectInferredInputType(z.Array(z.convert(Number))).toBe<unknown>()
  expect(z.validate(z.Array(z.convert(Number)), [0, '1', '2'])).toStrictEqual(Result.success([0, 1, 2]))
  expect(
    z.validate(
      z.Array(
        z.convert((value) => {
          throw value
        }),
      ),
      [123, 'a'],
    ),
  ).toStrictEqual(Result.failure({ message: '123', path: [0] }))
})
