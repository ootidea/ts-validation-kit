import { Result } from 'result-type-ts'
import { type NonConverterResult, failure } from '../schema'

export const boolean = {
  type: 'boolean',
  validate: (input: unknown): NonConverterResult<boolean> =>
    typeof input === 'boolean' ? Result.success(input) : failure('not a boolean'),
} as const

export const number = {
  type: 'number',
  validate: (input: unknown): NonConverterResult<number> =>
    typeof input === 'number' ? Result.success(input) : failure('not a number'),
} as const

export const bigint = {
  type: 'bigint',
  validate: (input: unknown): NonConverterResult<bigint> =>
    typeof input === 'bigint' ? Result.success(input) : failure('not a bigint'),
} as const

export const string = {
  type: 'string',
  validate: (input: unknown): NonConverterResult<string> =>
    typeof input === 'string' ? Result.success(input) : failure('not a string'),
} as const

export const symbol = {
  type: 'symbol',
  validate: (input: unknown): NonConverterResult<symbol> =>
    typeof input === 'symbol' ? Result.success(input) : failure('not a symbol'),
} as const

export const unknown = {
  type: 'unknown',
  validate: (input: unknown): NonConverterResult<unknown> => Result.success(input),
} as const

export const any = {
  type: 'any',
  validate: (input: unknown): NonConverterResult<any> => Result.success(input),
} as const

export const never = {
  type: 'never',
  validate: (input: unknown): NonConverterResult<never> => failure('never type does not accept any value'),
} as const
