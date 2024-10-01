import { partition } from 'base-up'
import { Result } from 'result-type-ts'

export type SchemaBase = { type: string; validate: (value: any) => any }
export type ValidateError = { message: string; path: string[] }
export type ValidateResult<T = unknown> = Result<T, ValidateError>

function failure(message: string, path: string[] = []): Result.Failure<ValidateError> {
  return Result.failure({ message, path })
}

export const number = {
  type: 'number',
  validate: (value: unknown) => (typeof value === 'number' ? Result.success(value) : failure('not a number')),
} as const

export type Optional = { type: 'optional'; schema: SchemaBase; validate?: never }
export const optional = <T extends SchemaBase>(schema: T) => ({ type: 'optional', schema }) as const

const objectFunction = <T extends Record<keyof any, SchemaBase | Optional>>(properties: T) =>
  ({
    type: 'properties',
    properties,
    validate: (value: unknown) => {
      // When it's not even an object.
      if (typeof value !== 'object' || value === null) return failure('not an object')

      const [optionalPropertyKeys, requiredPropertyKeys] = partition(
        Reflect.ownKeys(properties),
        (key) => properties[key as any]!.type === 'optional',
      )
      // Validate required properties.
      for (const key of requiredPropertyKeys) {
        if (!(key in value)) return failure('missing required property', [String(key)])

        const propertySchema = properties[key as any]! as SchemaBase
        const result: ValidateResult = propertySchema.validate((value as any)[key])
        if (result.isFailure) return failure(result.error.message, [...result.error.path, String(key)])
      }
      // Validate optional properties.
      for (const key of optionalPropertyKeys) {
        if (!(key in value)) continue

        const propertySchema = properties[key as any]! as Optional
        const result: ValidateResult = propertySchema.schema.validate((value as any)[key])
        if (result.isFailure) return result.mapError(({ message, path }) => ({ message, path: [...path, String(key)] }))
      }
      return Result.success(value)
    },
  }) as const
export const object = Object.assign(objectFunction, {
  type: 'object',
  validate: (value: unknown) =>
    typeof value === 'object' && value !== null ? Result.success(value) : failure('not an object'),
} as const)
