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

export function refine<T extends SchemaBase, R1 extends Infer<T>>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
): {
  readonly type: 'refine'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1]
  readonly isValid: (value: unknown) => boolean
}
export function refine<T extends SchemaBase, R1 extends Infer<T>, R2 extends Infer<T> & R1>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
): {
  readonly type: 'refine'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1, (value: Infer<T> & R1) => value is R2]
  readonly isValid: (value: unknown) => boolean
}
export function refine<
  T extends SchemaBase,
  R1 extends Infer<T>,
  R2 extends Infer<T> & R1,
  R3 extends Infer<T> & R1 & R2,
>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
  predicate3: ((value: Infer<T> & R1 & R2) => boolean) | ((value: Infer<T> & R1 & R2) => value is R3),
): {
  readonly type: 'refine'
  readonly base: T
  readonly predicates: [
    (value: Infer<T>) => value is R1,
    (value: Infer<T> & R1) => value is R2,
    (value: Infer<T> & R1 & R2) => value is R3,
  ]
  readonly isValid: (value: unknown) => boolean
}
export function refine<T extends SchemaBase, Predicate extends (value: unknown) => boolean>(
  base: T,
  predicate1: Predicate,
  predicate2?: Predicate,
  predicate3?: Predicate,
) {
  const predicates = [predicate1, predicate2, predicate3].filter((predicate) => predicate !== undefined)
  return {
    type: 'refine',
    base,
    predicates,
    isValid: (value: unknown) => base.isValid(value) && predicates.every((p) => p(value)),
  } as any
}
