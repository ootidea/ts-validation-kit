import { DiscriminatedUnion, Tuple } from 'base-up'

type LiteralBase = string | number | bigint | boolean | null | undefined

export type Schema = DiscriminatedUnion<{
  null: {}
  undefined: {}
  void: {}
  unknown: {}
  any: {}
  never: {}
  boolean: {}
  number: {}
  bigint: {}
  string: {}
  symbol: {}
  literal: { value: LiteralBase }
  array: { value: Schema }
  nonEmptyArray: { value: Schema }
  recursive: { value: Schema }
  object: { required: Record<keyof any, Schema>; optional: Record<keyof any, Schema> }
  union: { parts: readonly Schema[] }
  intersection: { parts: readonly Schema[] }
  tuple: { parts: readonly Schema[] }
  record: { key: Schema; value: Schema }
  recursion: {}
}>

export const _null = { type: 'null' } as const satisfies Schema
export const undefined = { type: 'undefined' } as const satisfies Schema
export const nullish = { type: 'union', parts: [_null, undefined] } as const satisfies Schema
export const _void = { type: 'void' } as const satisfies Schema
export const unknown = { type: 'unknown' } as const satisfies Schema
export const any = { type: 'any' } as const satisfies Schema
export const never = { type: 'never' } as const satisfies Schema
export const boolean = { type: 'boolean' } as const satisfies Schema
export const number = { type: 'number' } as const satisfies Schema
export const bigint = { type: 'bigint' } as const satisfies Schema
export const string = { type: 'string' } as const satisfies Schema
export const symbol = { type: 'symbol' } as const satisfies Schema
export const recursion = { type: 'recursion' } as const satisfies Schema

export function literal<const T extends LiteralBase>(value: T) {
  return { type: 'literal', value } as const
}

export function array<const T extends Schema>(value: T) {
  return { type: 'array', value } as const
}

export function nonEmptyArray<const T extends Schema>(value: T) {
  return { type: 'nonEmptyArray', value } as const
}

export function recursive<const T extends Schema>(value: T) {
  return { type: 'recursive', value } as const
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

export function union<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'union', parts } as const
}

export function intersection<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'intersection', parts } as const
}

export function tuple<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'tuple', parts } as const
}

type ConvertLiteralUnion<T extends Tuple> = T extends readonly [infer H extends LiteralBase, ...infer L]
  ? [{ type: 'literal'; value: H }, ...ConvertLiteralUnion<L>]
  : []
export function literalUnion<const T extends readonly LiteralBase[]>(
  ...literals: T
): { type: 'union'; parts: ConvertLiteralUnion<T> } {
  return { type: 'union', parts: literals.map((value) => ({ type: 'literal', value })) } as any
}

export function record<const Key extends Schema, const Value extends Schema>(key: Key, value: Value) {
  return { type: 'record', key, value } as const
}
