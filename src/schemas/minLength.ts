import { Result } from 'result-type-ts'
import { failure, type NonConverterResult } from '../schema'

export const minLength = <const N extends number>(length: N) => {
  return {
    metadata: { type: 'minLength', length },
    validate(input: { length: number }): NonConverterResult {
      return input.length >= length ? Result.success(input) : failure(`${length}`)
    },
  } as const
}
