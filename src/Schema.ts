import { partition } from 'base-up'
import type { Infer } from './Infer'

export type SchemaBase = { type: string; isValid: (value: unknown) => boolean }

export const boolean = { type: 'boolean', isValid: (value: unknown) => typeof value === 'boolean' } as const
export const number = { type: 'number', isValid: (value: unknown) => typeof value === 'number' } as const
export const bigint = { type: 'bigint', isValid: (value: unknown) => typeof value === 'bigint' } as const
export const string = { type: 'string', isValid: (value: unknown) => typeof value === 'string' } as const
export const symbol = { type: 'symbol', isValid: (value: unknown) => typeof value === 'symbol' } as const
export const unknown = { type: 'unknown', isValid: () => true } as const
export const any = { type: 'any', isValid: () => true } as const
export const never = { type: 'never', isValid: () => false } as const

export const literal = <const T>(value: T) =>
  ({ type: 'literal', value, isValid: (v: unknown) => v === value }) as const
export const true_ = literal(true)
export const false_ = literal(false)
export const null_ = literal(null)
export const undefined_ = literal(undefined)

export const Array_ = <T extends SchemaBase>(element: T) =>
  ({
    type: 'Array',
    element,
    isValid: (value: unknown) => Array.isArray(value) && value.every(element.isValid),
  }) as const
export const union = <T extends readonly SchemaBase[]>(...parts: T) =>
  ({ type: 'union', parts, isValid: (value: unknown) => parts.some((part) => part.isValid(value)) }) as const

const objectFunction = <T extends Record<keyof any, SchemaBase>>(properties: T) =>
  ({
    type: 'properties',
    properties,
    isValid: (value: unknown) => {
      if (typeof value !== 'object' || value === null) return false
      const [optionalPropertyKeys, requiredPropertyKeys] = partition(
        Reflect.ownKeys(properties),
        (key) => properties[key as any]!.type === 'optional',
      )
      return (
        requiredPropertyKeys.every((key) => key in value && properties[key]!.isValid((value as any)[key])) &&
        optionalPropertyKeys.every((key) => !(key in value) || properties[key]!.isValid((value as any)[key]))
      )
    },
  }) as const
export const object: {
  readonly type: 'object'
  readonly isValid: (value: unknown) => boolean
  <T extends Record<keyof any, SchemaBase>>(
    properties: T,
  ): { readonly type: 'properties'; readonly properties: T; readonly isValid: (value: unknown) => boolean }
} = Object.assign(objectFunction, {
  type: 'object',
  isValid: (value: unknown) => (typeof value === 'object' || typeof value === 'function') && value !== null,
} as const)

export const optional = <T extends SchemaBase>(schema: T) =>
  ({ type: 'optional', schema, isValid: schema.isValid }) as const

export const Record = <K extends SchemaBase, V extends SchemaBase>(
  key: K,
  value: V,
  ..._error: Infer<K> extends keyof any ? [] : ['error']
) =>
  ({
    type: 'Record',
    key,
    value,
    isValid: (dynamic: unknown) =>
      typeof dynamic === 'object' &&
      dynamic !== null &&
      Reflect.ownKeys(dynamic).every((k) => key.isValid(k) && value.isValid((dynamic as any)[k])),
  }) as const
