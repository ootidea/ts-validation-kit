import { DiscriminatedUnion } from 'base-up'

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
  literal: { value: string | number | bigint | boolean | null | undefined }
  array: { value: Schema }
  nonEmptyArray: { value: Schema }
  recursive: { value: Schema }
  object: { required: Record<keyof any, Schema>; optional: Record<keyof any, Schema> }
  union: { parts: readonly Schema[] }
  intersection: { parts: readonly Schema[] }
  tuple: { parts: readonly Schema[] }
  recursion: {}
}>

export const _null = { type: 'null' } as const
export const undefined = { type: 'undefined' } as const
export const nullish = { type: 'union', parts: [_null, undefined] } as const
export const _void = { type: 'void' } as const
export const unknown = { type: 'unknown' } as const
export const any = { type: 'any' } as const
export const never = { type: 'never' } as const
export const boolean = { type: 'boolean' } as const
export const number = { type: 'number' } as const
export const bigint = { type: 'bigint' } as const
export const string = { type: 'string' } as const
export const symbol = { type: 'symbol' } as const
export const recursion = { type: 'recursion' } as const

export function literal<const T extends string | number | bigint | boolean | null | undefined>(value: T) {
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
