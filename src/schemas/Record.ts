import { Result } from 'result-type-ts'
import type * as z from '../index'
import { type BaseSchema, type NonConverterResult, failure } from '../schema'

export const Record = <K extends BaseSchema<unknown>, V extends BaseSchema<unknown>>(
  keySchema: K,
  valueSchema: V,
  ..._error: z.Infer<K> extends keyof any ? [] : ['error']
) =>
  ({
    type: 'Record',
    key: keySchema,
    value: valueSchema,
    validate: (input: unknown): NonConverterResult => {
      if (typeof input !== 'object' || input === null) return failure('not an object')

      for (const actualKey of Reflect.ownKeys(input)) {
        const keyValidationResult = keySchema.validate(actualKey)
        if (keyValidationResult.isFailure) {
          const keyValidationResult = keySchema.validate(Number(actualKey))

          if (keyValidationResult.isFailure) {
            return failure(`Record key: ${keyValidationResult.error.message}`, [
              ...keyValidationResult.error.path,
              actualKey,
            ])
          }
        }

        const actualValue = (input as any)[actualKey]
        const valueValidationResult = valueSchema.validate(actualValue)
        if (valueValidationResult.isFailure) {
          return failure(`Record value: ${valueValidationResult.error.message}`, [
            ...valueValidationResult.error.path,
            actualKey,
          ])
        }
      }

      return Result.success(input)
    },
  }) as const
