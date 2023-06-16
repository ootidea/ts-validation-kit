import type { DiscriminatedUnion, NonEmptyArray, Simplify } from 'base-up'
import { assertNeverType, entriesOf } from 'base-up'

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

const _null = { type: 'null' } as const
const undefined = { type: 'undefined' } as const
const nullish = { type: 'union', parts: [_null, undefined] } as const
const _void = { type: 'void' } as const
const unknown = { type: 'unknown' } as const
const any = { type: 'any' } as const
const never = { type: 'never' } as const
const boolean = { type: 'boolean' } as const
const number = { type: 'number' } as const
const bigint = { type: 'bigint' } as const
const string = { type: 'string' } as const
const symbol = { type: 'symbol' } as const
const recursion = { type: 'recursion' } as const

function literal<const T extends string | number | bigint | boolean | null | undefined>(value: T) {
  return { type: 'literal', value } as const
}

function array<const T extends Schema>(value: T) {
  return { type: 'array', value } as const
}

function nonEmptyArray<const T extends Schema>(value: T) {
  return { type: 'nonEmptyArray', value } as const
}

function recursive<const T extends Schema>(value: T) {
  return { type: 'recursive', value } as const
}

function object<T extends Record<keyof any, Schema>>(
  required: T
): { type: 'object'; required: T; optional: Record<never, Schema> }
function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(
  required: T,
  optional: U
): { type: 'object'; required: T; optional: U }
function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(required: T, optional?: U) {
  return { type: 'object', required, optional: optional ?? {} } as const
}

function union<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'union', parts } as const
}

function intersection<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'intersection', parts } as const
}

function tuple<const T extends readonly Schema[]>(...parts: T) {
  return { type: 'tuple', parts } as const
}

type LocalInfer<T, Z = T> = T extends typeof unknown
  ? unknown
  : T extends typeof any
  ? any
  : T extends typeof never
  ? never
  : T extends typeof _null
  ? null
  : T extends typeof _void
  ? void
  : T extends typeof undefined
  ? undefined
  : T extends typeof boolean
  ? boolean
  : T extends typeof number
  ? number
  : T extends typeof bigint
  ? bigint
  : T extends typeof string
  ? string
  : T extends typeof symbol
  ? symbol
  : T extends ReturnType<typeof literal<infer L extends string | number | bigint | boolean | null | undefined>>
  ? L
  : T extends ReturnType<typeof array<infer U extends Schema>>
  ? LocalInfer<U, Z>[]
  : T extends ReturnType<typeof nonEmptyArray<infer U extends Schema>>
  ? NonEmptyArray<LocalInfer<U, Z>>
  : T extends ReturnType<typeof recursive<infer U extends Schema>>
  ? LocalInfer<U>
  : T extends ReturnType<
      typeof object<infer R extends Record<keyof any, Schema>, infer O extends Record<keyof any, Schema>>
    >
  ? InferObjectType<R, O, Z>
  : T extends ReturnType<typeof union<infer A extends readonly Schema[]>>
  ? InferUnionType<A, Z>
  : T extends ReturnType<typeof intersection<infer A extends readonly Schema[]>>
  ? InferIntersectionType<A, Z>
  : T extends ReturnType<typeof tuple<infer A extends readonly Schema[]>>
  ? InferTupleType<A, Z>
  : T extends typeof recursion
  ? LocalInfer<Z, Z>
  : never

type InferObjectType<T, U, Z> = Simplify<
  {
    [K in keyof T]: LocalInfer<T[K], Z>
  } & {
    [K in keyof U]?: LocalInfer<U[K], Z>
  }
>
type InferUnionType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
  ? LocalInfer<H, Z> | InferUnionType<L, Z>
  : never
type InferIntersectionType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
  ? LocalInfer<H, Z> & InferUnionType<L, Z>
  : unknown
type InferTupleType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
  ? [LocalInfer<H, Z>, ...InferTupleType<L, Z>]
  : []

/** Determine whether the given value satisfies the schema */
function isValid<const T extends Schema>(value: unknown, schema: T): value is LocalInfer<T>
function isValid<const T extends Schema, const Z extends Schema>(
  value: unknown,
  schema: T,
  rootSchema: Z
): value is LocalInfer<T>
function isValid<const T extends Schema, const Z extends Schema>(
  value: unknown,
  schema: T,
  rootSchema?: Z
): value is LocalInfer<T> {
  switch (schema.type) {
    case 'unknown':
    case 'any':
      return true
    case 'never':
      return false
    case 'void':
      return value === void 0
    case 'null':
      return value === null
    case 'undefined':
      return value === void 0
    case 'boolean':
      return typeof value === 'boolean'
    case 'number':
      return typeof value === 'number'
    case 'bigint':
      return typeof value === 'bigint'
    case 'string':
      return typeof value === 'string'
    case 'symbol':
      return typeof value === 'symbol'
    case 'literal':
      return value === schema.value
    case 'array':
      return Array.isArray(value) && value.every((v) => isValid(v, schema.value, rootSchema ?? schema))
    case 'nonEmptyArray':
      return (
        Array.isArray(value) && value.length > 0 && value.every((v) => isValid(v, schema.value, rootSchema ?? schema))
      )
    case 'recursive':
      return isValid(value, schema.value)
    case 'union':
      return schema.parts.some((part) => isValid(value, part, rootSchema ?? schema))
    case 'intersection':
      return schema.parts.every((part) => isValid(value, part, rootSchema ?? schema))
    case 'tuple':
      return (
        Array.isArray(value) &&
        value.length === schema.parts.length &&
        value.every((element, i) => isValid(element, schema.parts[i]!, rootSchema ?? schema))
      )
    case 'object':
      if (typeof value !== 'object' || value === null) return false

      return (
        entriesOf(schema.required).every(
          ([key, subSchema]) => key in value && isValid((value as any)[key], subSchema, rootSchema ?? schema)
        ) &&
        entriesOf(schema.optional).every(
          ([key, subSchema]) => !(key in value) || isValid((value as any)[key], subSchema, rootSchema ?? schema)
        )
      )
    case 'recursion':
      return isValid(value, rootSchema ?? schema, rootSchema ?? schema)
    default:
      assertNeverType(schema)
  }
}

const z = {
  unknown,
  any,
  never,
  void: _void,
  null: _null,
  undefined,
  nullish,
  boolean,
  number,
  bigint,
  string,
  symbol,

  literal,
  array,
  nonEmptyArray,
  recursive,
  object,
  union,
  intersection,
  tuple,
  recursion,

  isValid,
}

namespace z {
  /**
   * @example
   * z.Infer<typeof z.number> is equivalent to number
   * z.Infer<typeof z.object({ age: z.number })> is equivalent to { age: number }
   */
  export type Infer<T> = LocalInfer<T, T>
}
export { z }
