import { partition } from 'base-up'
import { Result } from 'result-type-ts'

export type SchemaBase<T = any> = { type: string; validate: (input: T) => any }
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

function failure(message: string, path: (keyof any)[] = []): Result.Failure<ValidateError> {
  return Result.failure({ message, path })
}

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

export type Optional = { type: 'optional'; schema: SchemaBase<unknown>; validate?: never }
export type ConverterOptional = { type: 'optional'; schema: ConverterSchema<unknown>; validate?: never }
export type NonConverterOptional = { type: 'optional'; schema: NonConverterSchema<unknown>; validate?: never }
export const optional = <T extends SchemaBase<unknown>>(schema: T) => ({ type: 'optional', schema }) as const

const objectFunction = <T extends Record<keyof any, SchemaBase<unknown> | Optional>>(properties: T) =>
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

        const propertySchema = properties[key as any]! as SchemaBase
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

export const Array_ = <T extends SchemaBase<unknown>>(element: T) =>
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

export const recursive = <const T extends () => any>(lazy: T) =>
  ({
    type: 'recursive',
    lazy,
    validate: (input: unknown): T extends () => NonConverterSchema ? NonConverterResult : ConverterResult =>
      (lazy as () => SchemaBase)().validate(input),
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
