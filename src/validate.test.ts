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
it('converts values', () => {
  expect(z.validate(z.convert(Number), '1')).toStrictEqual(Result.success(1))
  expect(
    z.validate(
      z.convert((value: string) => {
        throw new Error(value)
      }),
      'message',
    ),
  ).toStrictEqual(Result.failure({ message: 'message', path: [] }))
  expect(z.validate(z.Array(z.convert(Number)), [0, '1', '2'])).toStrictEqual(Result.success([0, 1, 2]))
  expect(z.validate(z.object({ a: z.convert(Number) }), { a: '1', b: 2 })).toStrictEqual(Result.success({ a: 1, b: 2 }))
  expect(z.validate(z.object({ a: z.optional(z.convert(Number)) }), { a: '1' })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.object({ a: z.optional(z.convert(Number)) }), { b: 2 })).toStrictEqual(Result.success({ b: 2 }))
})
