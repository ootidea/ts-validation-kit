import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'
import { literalToString } from '../utilities'

export const literal = <const T>(value: T) =>
  ({
    type: 'literal',
    value,
    validate: (input: unknown): NonConverterResult<T> => {
      if (input === value) return Result.success(value)

      return failure(`not equal to ${literalToString(value)}`)
    },
  }) as const
