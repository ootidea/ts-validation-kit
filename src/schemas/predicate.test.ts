import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('predicate schema', () => {
  expectInferredType(z.predicate((value) => value === 0)).toBe<0>()
  expectInferredType(z.predicate((value: string) => Boolean(value))).toBe<string>()
  expectInferredInputType(z.predicate((value) => value === 0)).toBe<unknown>()
  expectInferredInputType(z.predicate((value: string) => Boolean(value))).toBe<string>()
  expect(
    z.validate(
      z.predicate((value) => value === 0),
      0,
    ),
  ).toStrictEqual(Result.success(0))
  expect(
    z.validate(
      z.predicate((value) => value === 0),
      1,
    ),
  ).toStrictEqual(Result.failure({ message: 'predicate not met: (value) => value === 0', path: [] }))
})
