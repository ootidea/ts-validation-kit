import { Result } from 'result-type-ts'
import { expect, it } from 'vitest'
import * as z from './index'

it('validate with predicate', () => {
  expect(
    z.validate(
      z.predicate((value): value is 0 => value === 0),
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
