import { Result } from 'result-type-ts'
import { failure, type NonConverterResult } from '../schema'

export const boolean = {
  metadata: { type: 'boolean' },
  validate: (input: unknown): NonConverterResult<boolean> =>
    typeof input === 'boolean' ? Result.success(input) : failure('not a boolean'),
} as const

export const number = {
  metadata: { type: 'number' },
  validate: (input: unknown): NonConverterResult<number> =>
    typeof input === 'number' ? Result.success(input) : failure('not a number'),
} as const

export const bigint = {
  metadata: { type: 'bigint' },
  validate: (input: unknown): NonConverterResult<bigint> =>
    typeof input === 'bigint' ? Result.success(input) : failure('not a bigint'),
} as const

export const string = {
  metadata: { type: 'string' },
  validate: (input: unknown): NonConverterResult<string> =>
    typeof input === 'string' ? Result.success(input) : failure('not a string'),
} as const

export const symbol = {
  metadata: { type: 'symbol' },
  validate: (input: unknown): NonConverterResult<symbol> =>
    typeof input === 'symbol' ? Result.success(input) : failure('not a symbol'),
} as const

export const unknown = {
  metadata: { type: 'unknown' },
  validate: (input: unknown): NonConverterResult<unknown> => Result.success(input),
} as const

export const any = {
  metadata: { type: 'any' },
  validate: (input: unknown): NonConverterResult<any> => Result.success(input),
} as const

export const never = {
  metadata: { type: 'never' },
  validate: (input: unknown): NonConverterResult<never> => failure('never type does not accept any value'),
} as const
