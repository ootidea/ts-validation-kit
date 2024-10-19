import { test } from 'vitest'
import * as z from '../index'
import { expectInferredInputType, expectInferredType } from '../utilities'

test('pipe schema', () => {
  expectInferredType(
    z.pipe(
      z.number,
      z.predicate((value) => value === 0 || value === 1),
      z.predicate((value: 0 | 1) => Boolean(value)),
    ),
  ).toBe<0 | 1>()
  expectInferredType(
    z.pipe(
      z.number,
      z.convert(String),
      z.predicate((value) => value.length < 5),
    ),
  ).toBe<string>()
  expectInferredInputType(z.pipe(z.number, z.predicate(Boolean))).toBe<unknown>()
  expectInferredInputType(
    z.pipe(
      z.predicate((value: number) => value > 0),
      z.convert(String),
    ),
  ).toBe<number>()
})
