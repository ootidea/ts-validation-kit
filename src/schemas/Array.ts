import { Result } from 'result-type-ts'
import {
  type BaseSchema,
  type ConverterResult,
  type NonConverterResult,
  type NonConverterSchema,
  type ValidateResult,
  failure,
} from '../schema'

export const Array_ = <T extends BaseSchema<unknown>>(element: T) =>
  ({
    type: 'Array',
    element,
    validate: (input: unknown): T extends NonConverterSchema<unknown> ? NonConverterResult : ConverterResult => {
      // When it's not even an object.
      if (!Array.isArray(input)) return failure('not an array')

      let changedValue = input

      // Validate each element.
      for (let i = 0; i < input.length; i++) {
        const result: ValidateResult = element.validate(input[i])
        if (result.isFailure) return failure(result.error.message, [i, ...result.error.path])

        if (result.value !== input[i]) changedValue = changedValue.toSpliced(i, 1, result.value)
      }
      return Result.success(changedValue)
    },
  }) as const
