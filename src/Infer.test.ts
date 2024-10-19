import { describe, it } from 'vitest'
import * as z from './index'
import { expectInferredType } from './utilities'

describe('Infer', () => {
  it('infers predicate narrowing types', () => {
    expectInferredType(z.predicate((value): value is 0 => value === 0)).toBe<0>()
    expectInferredType(z.predicate((value: string) => Boolean(value))).toBe<string>()
  })
  it('infers piped types', () => {
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
  })
})
