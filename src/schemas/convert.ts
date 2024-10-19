import { Result } from 'result-type-ts'
import { type ConverterResult, failure } from '../schema'

export const convert = <T, U>(converter: (value: T) => U) =>
  ({
    type: 'convert',
    converter,
    validate: (input: T): ConverterResult<U> => {
      try {
        return Result.success(converter(input))
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        return failure(message)
      }
    },
  }) as const
