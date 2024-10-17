import type { Result } from 'result-type-ts'
import type * as z from './index'
import type { BaseSchema, ValidateError } from './schema'

export const validate = <T extends BaseSchema>(schema: T, value: unknown): Result<z.Infer<T>, ValidateError> =>
  schema.validate(value) as any
