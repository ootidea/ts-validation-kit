import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'

export const literal = <const T>(value: T) =>
  ({
    type: 'literal',
    value,
    validate: (input: unknown): NonConverterResult<T> => {
      if (input === value) return Result.success(value)

      if (typeof value === 'bigint') return failure(`not equal to ${value}n`)
      if (typeof value === 'symbol') return failure(`not equal to ${String(value)}`)

      return failure(`not equal to ${JSON.stringify(value)}`)
    },
  }) as const
