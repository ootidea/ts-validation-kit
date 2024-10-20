import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'
import { literalToString } from '../utilities'

export const literalUnion = <const T extends unknown[]>(...values: T) =>
  ({
    type: 'literalUnion',
    values,
    validate: (input: unknown): NonConverterResult<T[number]> => {
      if (values.some((value) => value === input)) return Result.success(input)

      return failure(`is not one of ${values.map(literalToString).join(', ')}`)
    },
  }) as const
