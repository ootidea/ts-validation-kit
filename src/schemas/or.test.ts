import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredType } from '../utilities'

test('or schema', () => {
  expectInferredType(z.or(z.number, z.string)).toBe<number | string>()
  expectInferredType(z.or(z.boolean, z.null, z.undefined)).toBe<boolean | null | undefined>()
  expectInferredType(
    z.or(
      z.predicate((value) => value === 0),
      z.predicate((value) => value === 1),
    ),
  ).toBe<0 | 1>()
  expectInferredType(z.or(z.Array(z.never), z.object({}))).toBe<never[] | {}>()
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
test('recursive or schema', () => {
  const jsonValue = z.or(
    z.string,
    z.number,
    z.boolean,
    z.null,
    z.Record(
      z.string,
      z.recursive(() => jsonValue),
    ),
    z.Array(z.recursive(() => jsonValue)),
  )
  type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]
  expectInferredType(jsonValue).toBe<JsonValue>()
  expect(z.validate(jsonValue, { a: 1, b: '2', c: { _: null }, d: [false] })).toStrictEqual(
    Result.success({ a: 1, b: '2', c: { _: null }, d: [false] }),
  )
})
