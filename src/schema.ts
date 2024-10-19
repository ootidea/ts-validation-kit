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
