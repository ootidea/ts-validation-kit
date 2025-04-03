import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'

export const predicate = <T, U extends T = T>(f: ((value: T) => value is U) | ((value: T) => boolean)) =>
  ({
    metadata: { type: 'predicate', predicate: f },
    validate: (input: T): NonConverterResult<U> => {
      if (f(input)) return Result.success(input as U)

      if (f.name) return failure(`predicate ${f.name} not met`)
      return failure(`predicate not met: ${f}`)
    },
  }) as const
