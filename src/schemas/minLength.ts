import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'

export const minLength = <const N extends number>(length: N) => {
  return {
    type: 'minLength',
    length,
    validate(input: { length: number }): NonConverterResult {
      return input.length >= length ? Result.success(input) : failure(`${length}`)
    },
  } as const
}
