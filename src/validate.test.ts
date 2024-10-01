import { Result } from 'result-type-ts'
import { expect, it } from 'vitest'
import * as z from './index'

it('validate primitive types', () => {
  expect(z.validate(z.number, 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.number, 'a')).toStrictEqual(Result.failure({ message: 'not a number', path: [] }))
})
it('validate object types', () => {
  expect(z.validate(z.object({ a: z.number }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.object({ a: z.number }), { a: 'a' })).toStrictEqual(
    Result.failure({ message: 'not a number', path: ['a'] }),
  )
})
it('validate optional properties', () => {
  expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.object({ a: z.optional(z.number) }), {})).toStrictEqual(Result.success({}))
  expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 'a' })).toStrictEqual(
    Result.failure({ message: 'not a number', path: ['a'] }),
  )
})
