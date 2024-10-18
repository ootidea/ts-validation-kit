import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('null schema', () => {
  expectInferredType(z.null).toBe<null>()
  expectInferredInputType(z.null).toBe<unknown>()
  expect(z.validate(z.null, null)).toEqual(Result.success(null))
  expect(z.validate(z.null, undefined)).toEqual(Result.failure({ message: 'not equal to null', path: [] }))
})
test('undefined schema', () => {
  expectInferredType(z.undefined).toBe<undefined>()
  expectInferredInputType(z.undefined).toBe<unknown>()
  expect(z.validate(z.undefined, undefined)).toEqual(Result.success(undefined))
  expect(z.validate(z.undefined, null)).toEqual(Result.failure({ message: 'not equal to undefined', path: [] }))
})
