import { DiscriminatedUnion, Tuple } from 'base-up'
import { Infer } from './inference'

export type Schema = DiscriminatedUnion<{
  string: {}
  number: {}
  boolean: {}
  bigint: {}
  symbol: {}
  undefined: {}
  null: {}
  unknown: {}
  any: {}
  never: {}
  void: {}
  literal: { value: unknown }
  Array: { value: Schema }
  NonEmptyArray: { value: Schema }
  tuple: { parts: readonly Schema[] }
  object: { required: Record<keyof any, Schema>; optional: Record<keyof any, Schema> }
  Record: { key: Schema; value: Schema }
  union: { parts: readonly Schema[] }
  intersection: { parts: readonly Schema[] }
  refine: { base: Schema; predicate: (value: any) => value is any }
  class: { constructor: abstract new (..._: any) => any }
  recursive: { value: Schema; key: keyof any }
  recursion: { key: keyof any }
}>

/** The default value when the key is omitted in {@link z.recursion} or {@link z.recursive}. */
export const ANONYMOUS = Symbol()

export const string = { type: 'string' } as const satisfies Schema
export const number = { type: 'number' } as const satisfies Schema
export const boolean = { type: 'boolean' } as const satisfies Schema
export const bigint = { type: 'bigint' } as const satisfies Schema
export const symbol = { type: 'symbol' } as const satisfies Schema
export const undefined = { type: 'undefined' } as const satisfies Schema
export const _null = { type: 'null' } as const satisfies Schema
export const nullish = { type: 'union', parts: [_null, undefined] } as const satisfies Schema
export const unknown = { type: 'unknown' } as const satisfies Schema
export const any = { type: 'any' } as const satisfies Schema
export const never = { type: 'never' } as const satisfies Schema
export const _void = { type: 'void' } as const satisfies Schema

export function literal<const T>(value: T) {
  return { type: 'literal', value } as const
}

export function Array<const T extends Schema>(value: T) {
  return { type: 'Array', value } as const
}

export function NonEmptyArray<const T extends Schema>(value: T) {
  return { type: 'NonEmptyArray', value } as const
}

export function tuple<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'tuple', parts } as const
}

export function object<T extends Record<keyof any, Schema>>(
  required: T
): { type: 'object'; required: T; optional: Record<never, Schema> }
export function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(
  required: T,
  optional: U
): { type: 'object'; required: T; optional: U }
export function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(
  required: T,
  optional?: U
) {
  return { type: 'object', required, optional: optional ?? {} } as const
}

export function Record<const Key extends Schema, const Value extends Schema>(key: Key, value: Value) {
  return { type: 'Record', key, value } as const
}

export function union<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'union', parts } as const
}

type ConvertLiteralUnion<T extends Tuple> = T extends readonly [infer H, ...infer L]
  ? [{ type: 'literal'; value: H }, ...ConvertLiteralUnion<L>]
  : []
export function literalUnion<const T extends Tuple>(...literals: T): { type: 'union'; parts: ConvertLiteralUnion<T> } {
  return { type: 'union', parts: literals.map((value) => ({ type: 'literal', value })) } as any
}

export function intersection<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'intersection', parts } as const
}

export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: U
): { type: 'refine'; base: T; predicate: U }
export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: (value: Infer<T>) => boolean
): { type: 'refine'; base: T; predicate: (value: Infer<T>) => value is Infer<T> }
export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: U
) {
  return { type: 'refine', base, predicate } as const
}

export function _class<const T>(constructor: abstract new (..._: any) => T) {
  return { type: 'class', constructor } as const
}

export function recursion<const K extends keyof any>(key: K) {
  return { type: 'recursion', key } as const
}
recursion.type = 'recursion' as const
recursion.key = ANONYMOUS

export function recursive<const T extends Schema>(value: T): { type: 'recursive'; value: T; key: typeof ANONYMOUS }
export function recursive<const T extends Schema, const K extends keyof any>(
  key: K,
  value: T
): { type: 'recursive'; value: T; key: K }
export function recursive<const T extends Schema, const K extends keyof any>(first: T | K, second?: T) {
  if (second === void 0) {
    return { type: 'recursive', value: first, key: ANONYMOUS } as const
  }
  return { type: 'recursive', value: second, key: first } as const
}
