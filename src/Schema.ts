import type { MergeIntersection } from 'advanced-type-utilities'
import { partition } from 'base-up'

export type Schema<T = unknown> = { predicate: (value: T) => boolean }

export const boolean = { predicate: (value: unknown): value is boolean => typeof value === 'boolean' } as const
export const number = { predicate: (value: unknown): value is number => typeof value === 'number' } as const
export const bigint = { predicate: (value: unknown): value is bigint => typeof value === 'bigint' } as const
export const string = { predicate: (value: unknown): value is string => typeof value === 'string' } as const
export const symbol = { predicate: (value: unknown): value is symbol => typeof value === 'symbol' } as const

export const unknown = { predicate: (_value: unknown): _value is unknown => true } as const
export const any = { predicate: (_value: unknown): _value is any => true } as const
export const never = { predicate: (_value: unknown): _value is never => false } as const

export const literal = <const T>(value: T) =>
  ({ predicate: (dynamic: unknown): dynamic is T => dynamic === value }) as const
export const null_ = literal(null)
export const undefined_ = literal(undefined)
export const true_ = literal(true)
export const false_ = literal(false)

export const Array_ = <T extends Schema>(element: T) =>
  ({
    predicate: (value: unknown): value is Infer<T>[] => Array.isArray(value) && value.every(element.predicate),
  }) as const

export const or = <T extends readonly Schema[]>(...schemas: T) =>
  ({
    predicate: (value: unknown): value is OrNarrowedType<T> => schemas.some((schema) => schema.predicate(value)),
  }) as const
type OrNarrowedType<T extends readonly Schema[]> = T extends readonly []
  ? never
  : T[number] extends infer S extends Schema
    ? Infer<S>
    : never

const objectFunction = <T extends Record<keyof any, Schema | Optional>>(properties: T) =>
  ({
    predicate: (value: unknown): value is ObjectNarrowedType<T> => {
      if (typeof value !== 'object' || value === null) return false
      const [optionalPropertyKeys, requiredPropertyKeys] = partition(
        Reflect.ownKeys(properties),
        (key) => properties[key as any]!.predicate === undefined,
      )
      return (
        requiredPropertyKeys.every((key) => key in value && (properties as any)[key].predicate((value as any)[key])) &&
        optionalPropertyKeys.every(
          (key) => !(key in value) || (properties as any)[key].schema.predicate((value as any)[key]),
        )
      )
    },
  }) as const
export const object = Object.assign(objectFunction, {
  predicate: (value: unknown): value is object => typeof value === 'object' && value !== null,
})
type ObjectNarrowedType<T extends Record<keyof any, Schema | Optional>> = MergeIntersection<
  {
    [K in keyof T as T[K] extends Schema ? K : never]: T[K] extends Schema ? Infer<T[K]> : never
  } & {
    [K in keyof T as T[K] extends Optional ? K : never]?: T[K] extends Optional ? Infer<T[K]['schema']> : never
  }
>

export const Record = <K extends Schema, V extends Schema>(
  key: K,
  value: V,
  ..._error: Infer<K> extends keyof any ? [] : [error: 'invalid key type']
) =>
  ({
    predicate: (
      dynamic: unknown,
    ): dynamic is Infer<K> extends infer Key extends keyof any ? Record<Key, Infer<V>> : never =>
      typeof dynamic === 'object' &&
      dynamic !== null &&
      Reflect.ownKeys(dynamic).every((k) => key.predicate(k) && value.predicate((dynamic as any)[k])),
  }) as const

type Optional = { predicate?: never; schema: Schema }
export const optional = <T extends Schema>(schema: T) => ({ schema }) as const

export type Infer<T extends Schema<any>> = T['predicate'] extends (value: unknown) => value is infer R
  ? R
  : T['predicate'] extends (value: infer R) => boolean
    ? R
    : never
