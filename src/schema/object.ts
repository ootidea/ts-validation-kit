import { partition } from 'base-up'
import { Result } from 'result-type-ts'
import {
  type BaseSchema,
  type ConverterResult,
  type ConverterSchema,
  type NonConverterResult,
  type NonConverterSchema,
  type ValidateResult,
  failure,
} from '../schema'

export type Optional = { type: 'optional'; schema: BaseSchema<unknown>; validate?: never }
export type ConverterOptional = { type: 'optional'; schema: ConverterSchema<unknown>; validate?: never }
export type NonConverterOptional = { type: 'optional'; schema: NonConverterSchema<unknown>; validate?: never }
export const optional = <T extends BaseSchema<unknown>>(schema: T) => ({ type: 'optional', schema }) as const

const objectFunction = <T extends Record<keyof any, BaseSchema<unknown> | Optional>>(properties: T) =>
  ({
    type: 'properties',
    properties,
    validate: (
      input: unknown,
    ): T extends Record<keyof any, NonConverterSchema<unknown> | NonConverterOptional>
      ? NonConverterResult
      : ConverterResult => {
      // When it's not even an object.
      if (typeof input !== 'object' || input === null) return failure('not an object')

      let changedValue = input

      const [optionalPropertyKeys, requiredPropertyKeys] = partition(
        Reflect.ownKeys(properties),
        (key) => properties[key as any]!.type === 'optional',
      )
      // Validate required properties.
      for (const key of requiredPropertyKeys) {
        if (!(key in input)) return failure('missing required property', [key])

        const propertySchema = properties[key as any]! as BaseSchema
        const result: ValidateResult = propertySchema.validate((input as any)[key])
        if (result.isFailure) return failure(result.error.message, [...result.error.path, key])

        if (result.value !== (input as any)[key]) changedValue = { ...changedValue, [key]: result.value }
      }
      // Validate optional properties.
      for (const key of optionalPropertyKeys) {
        if (!(key in input)) continue

        const propertySchema = properties[key as any]! as Optional
        const result: ValidateResult = propertySchema.schema.validate((input as any)[key])
        if (result.isFailure) return result.mapError(({ message, path }) => ({ message, path: [...path, key] }))

        if (result.value !== (input as any)[key]) changedValue = { ...changedValue, [key]: result.value }
      }
      return Result.success(changedValue)
    },
  }) as const

export const object = Object.assign(objectFunction, {
  type: 'object',
  validate: (input: unknown): NonConverterResult<object> =>
    typeof input === 'object' && input !== null ? Result.success(input) : failure('not an object'),
} as const)
