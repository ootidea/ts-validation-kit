import type { DiscriminatedUnion, Simplify } from 'base-up'
import { assertNeverType, entriesOf } from 'base-up'

export type FctSchema = DiscriminatedUnion<{
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
  literal: { value: any }
  array: { value: FctSchema }
  // TODO: このへんはreadonlyが必要だったりしないか？
  object: { required: Record<keyof any, FctSchema>; optional: Record<keyof any, FctSchema> }
  union: { parts: FctSchema[] }
  intersection: { parts: FctSchema[] }
  tuple: { parts: FctSchema[] }
  recursion: { key: keyof any }
}>

const _null = { type: 'null' } as const
const undefined = { type: 'undefined' } as const
const _void = { type: 'void' } as const
const unknown = { type: 'unknown' } as const
const any = { type: 'any' } as const
const never = { type: 'never' } as const
const boolean = { type: 'boolean' } as const
const number = { type: 'number' } as const
const bigint = { type: 'bigint' } as const
const string = { type: 'string' } as const
const symbol = { type: 'symbol' } as const

function literal<const T extends string | number | bigint | boolean | null | undefined>(value: T) {
  return { type: 'literal', value } as const
}

function array<const T extends FctSchema>(value: T) {
  return { type: 'array', value } as const
}

function object<T extends Record<keyof any, FctSchema>>(
  required: T
): { type: 'object'; required: T; optional: Record<never, FctSchema> }
function object<T extends Record<keyof any, FctSchema>, U extends Record<keyof any, FctSchema>>(
  required: T,
  optional: U
): { type: 'object'; required: T; optional: U }
function object<T extends Record<keyof any, FctSchema>, U extends Record<keyof any, FctSchema>>(
  required: T,
  optional?: U
) {
  return { type: 'object', required, optional: optional ?? {} } as const
}

function union<const T extends readonly FctSchema[]>(...parts: T) {
  return { type: 'union', parts } as const
}

function intersection<const T extends readonly FctSchema[]>(...parts: T) {
  return { type: 'intersection', parts } as const
}

function tuple<const T extends readonly FctSchema[]>(...parts: T) {
  return { type: 'tuple', parts } as const
}

function recursion<const K extends keyof any>(key: K) {
  return { type: 'recursion', key } as const
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
  : T extends ReturnType<typeof array<infer U extends FctSchema>>
  ? LocalInfer<U, Z>[]
  : T extends ReturnType<
      typeof object<infer R extends Record<keyof any, FctSchema>, infer O extends Record<keyof any, FctSchema>>
    >
  ? InferObjectType<R, O, Z>
  : T extends ReturnType<typeof union<infer A extends readonly FctSchema[]>>
  ? InferUnionType<A, Z>
  : T extends ReturnType<typeof intersection<infer A extends readonly FctSchema[]>>
  ? InferIntersectionType<A, Z>
  : T extends ReturnType<typeof tuple<infer A extends readonly FctSchema[]>>
  ? InferTupleType<A, Z>
  : T extends ReturnType<typeof recursion<infer K extends keyof any>>
  ? { [key in K]: LocalInfer<Z> }
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
function isValid<const T extends FctSchema>(value: unknown, schema: T): value is LocalInfer<T> {
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
      return Array.isArray(value) && value.every((v) => isValid(v, schema.value))
    case 'union':
      return schema.parts.some((part) => isValid(value, part))
    case 'intersection':
      return schema.parts.every((part) => isValid(value, part))
    case 'tuple':
      return (
        Array.isArray(value) &&
        value.length === schema.parts.length &&
        value.every((element, i) => isValid(element, schema.parts[i]!))
      )
    case 'object':
      if (typeof value !== 'object' || value === null) return false

      return (
        entriesOf(schema.required).every(
          ([key, subSchema]) => key in value && isValid((value as any)[key], subSchema)
        ) &&
        entriesOf(schema.optional).every(
          ([key, subSchema]) => !(key in value) || isValid((value as any)[key], subSchema)
        )
      )
    default:
      assertNeverType(schema)
  }
}

const fct = {
  unknown,
  any,
  never,
  void: _void,
  null: _null,
  undefined,
  boolean,
  number,
  bigint,
  string,
  symbol,

  literal,
  array,
  object,
  union,
  intersection,
  tuple,
  recursion,

  isValid,
}

namespace fct {
  /**
   * @example
   * fct.Infer<typeof fct.number> is equivalent to number
   * fct.Infer<typeof fct.object({ age: fct.number })> is equivalent to { age: number }
   */
  export type Infer<T> = LocalInfer<T, T>
}
export { fct }
