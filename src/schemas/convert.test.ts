import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('convert schema', () => {
  expectInferredType(z.convert((value) => String(value))).toBe<string>()
  expectInferredType(z.convert((value: number | undefined) => value ?? 0)).toBe<number>()
  expectInferredInputType(z.convert((value) => String(value))).toBe<unknown>()
  expectInferredInputType(z.convert((value: number | undefined) => value ?? 0)).toBe<number | undefined>()
  expect(
    z.validate(
      z.convert((value) => String(value)),
      1,
    ),
  ).toStrictEqual(Result.success('1'))
  expect(
    z.validate(
      z.convert((value: string) => {
        throw new Error(value)
      }),
      'message',
    ),
  ).toStrictEqual(Result.failure({ message: 'message', path: [] }))
})
