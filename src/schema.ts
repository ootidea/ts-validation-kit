import { partition } from 'base-up'
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

export const literal = <const T>(value: T) =>
  ({
    type: 'literal',
    value,
    validate: (input: unknown): NonConverterResult<T> => {
      if (input === value) return Result.success(value)

      if (typeof value === 'bigint') return failure(`not equal to ${value}n`)
      if (typeof value === 'symbol') return failure(`not equal to ${String(value)}`)

      return failure(`not equal to ${JSON.stringify(value)}`)
    },
  }) as const

export const null_ = literal(null)
export const undefined_ = literal(undefined)

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

export const or = <const T extends readonly BaseSchema[]>(...schemas: T) =>
  ({
    type: 'or',
    schemas,
    validate: (input: unknown): OrOutput<T> => {
      const errorMessages: string[] = []
      for (const schema of schemas) {
        const result = schema.validate(input)
        if (result.isSuccess) return result

        errorMessages.push(result.error.message)
      }

      return failure(
        `must resolve any one of the following issues: ${errorMessages.map((message, i) => `(${i + 1}) ${message}`).join(' ')}`,
      ) as any
    },
  }) as const
type OrOutput<T extends readonly BaseSchema[]> = T[number]['validate'] extends (input: any) => ValidateResult<infer R>
  ? ValidateResult<R>
  : never

export const recursive = <const T extends () => any>(lazy: T) =>
  ({
    type: 'recursive',
    lazy,
    validate: (input: unknown): T extends () => NonConverterSchema ? NonConverterResult : ConverterResult =>
      (lazy as () => BaseSchema)().validate(input),
  }) as const

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
