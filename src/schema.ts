import { Result } from 'result-type-ts'

export type BaseSchema<T = any> = { type: string; validate: (input: T) => any }
export type ConverterSchema<T = any> = {
  type: string
  validate: (input: T) => ValidateResult<any> & { converted?: true }
}
export type NonConverterSchema<T = any> = {
  type: string
  validate: (input: T) => ValidateResult<any> & { converted?: false }
}
export type ValidateError = { message: string; path: (keyof any)[] }
export type ValidateResult<T = unknown> = Result<T, ValidateError>
export type ConverterResult<T = unknown> = Result<T, ValidateError> & { converted?: true }
export type NonConverterResult<T = unknown> = Result<T, ValidateError> & { converted?: false }

export function failure(message: string, path: (keyof any)[] = []): Result.Failure<ValidateError> {
  return Result.failure({ message, path })
}

export const predicate = <T, U extends T = T>(f: ((value: T) => value is U) | ((value: T) => boolean)) =>
  ({
    type: 'predicate',
    predicate: f,
    validate: (input: T): NonConverterResult<U> => {
      if (f(input)) return Result.success(input as U)

      if (f.name) return failure(`predicate ${f.name} not met: ${f}`)
      return failure(`predicate not met: ${f}`)
    },
  }) as const
