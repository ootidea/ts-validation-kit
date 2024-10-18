import { Result } from 'result-type-ts'
import { expect, it } from 'vitest'
import * as z from './index'

it('validate properties', () => {
  expect(z.validate(z.object({ a: z.number }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.object({ a: z.number }), { a: null })).toStrictEqual(
    Result.failure({ message: 'not a number', path: ['a'] }),
  )
  expect(z.validate(z.object({ a: z.number }), 1)).toStrictEqual(Result.failure({ message: 'not an object', path: [] }))
})
it('validate optional properties', () => {
  expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 1 })).toStrictEqual(Result.success({ a: 1 }))
  expect(z.validate(z.object({ a: z.optional(z.number) }), {})).toStrictEqual(Result.success({}))
  expect(z.validate(z.object({ a: z.optional(z.number) }), { a: 'a' })).toStrictEqual(
    Result.failure({ message: 'not a number', path: ['a'] }),
  )
})
it('validate array types', () => {
  expect(z.validate(z.Array(z.number), [1])).toStrictEqual(Result.success([1]))
  expect(z.validate(z.Array(z.number), ['a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [0] }))
  expect(z.validate(z.Array(z.number), [0, 'a'])).toStrictEqual(Result.failure({ message: 'not a number', path: [1] }))
  expect(z.validate(z.Array(z.number), 'a')).toStrictEqual(Result.failure({ message: 'not an array', path: [] }))
})
it('validate with or schema', () => {
  expect(z.validate(z.or(z.number, z.string), 1)).toStrictEqual(Result.success(1))
  expect(z.validate(z.or(z.number, z.string), 'a')).toStrictEqual(Result.success('a'))
  expect(z.validate(z.or(z.number, z.string), true)).toStrictEqual(
    Result.failure({
      message: 'must resolve any one of the following issues: (1) not a number (2) not a string',
      path: [],
    }),
  )
  expect(z.validate(z.or(z.convert(JSON.parse), z.convert(String)), undefined)).toStrictEqual(
    Result.success('undefined'),
  )
})
it('validate recursive types', () => {
  const TreeSchema = z.object({
    value: z.unknown,
    children: z.Array(z.recursive(() => TreeSchema)),
  })
  const tree = { value: 1, children: [{ value: 2, children: [] }] }
  expect(z.validate(TreeSchema, tree)).toStrictEqual(Result.success(tree))
})
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
