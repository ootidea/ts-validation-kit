import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('literalUnion schema', () => {
  expectInferredType(z.literalUnion('a', 1)).toBe<'a' | 1>()
  expectInferredInputType(z.literalUnion('a', 1)).toBe<unknown>()
  expect(z.validate(z.literalUnion('a', 1), 'a')).toStrictEqual(Result.success('a'))
  expect(z.validate(z.literalUnion('a', 1), 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.literalUnion('a', 1), 'b')).toStrictEqual(
    Result.failure({ message: 'is not one of "a", 1', path: [] }),
  )
})
