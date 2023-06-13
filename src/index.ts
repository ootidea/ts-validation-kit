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

function literal<const T>(value: T) {
  return { type: 'literal', value } as const
}

function array<const T>(value: T) {
  return { type: 'array', value } as const
}

function object<T extends object>(required: T): { type: 'object'; required: T; optional: {} }
function object<T extends object, U extends object>(
  required: T,
  optional: U
): { type: 'object'; required: T; optional: U }
function object<T extends object, U extends object>(required: T, optional?: U) {
  return { type: 'object', required, optional: optional ?? {} } as const
}

function union<const T extends readonly any[]>(...parts: T) {
  return { type: 'union', parts } as const
}

function intersection<const T extends readonly any[]>(...parts: T) {
  return { type: 'intersection', parts } as const
}

function tuple<const T extends readonly any[]>(...parts: T) {
  return { type: 'tuple', parts } as const
}

function recursion<const K extends keyof any>(key: K) {
  return { type: 'recursion', key } as const
}

type LocalSchema =
  | typeof _null
  | typeof undefined
  | typeof _void
  | typeof unknown
  | typeof any
  | typeof never
  | typeof boolean
  | typeof number
  | typeof bigint
  | typeof string
  | typeof symbol
  | ReturnType<typeof literal>
  | ReturnType<typeof array>
  | ReturnType<typeof object>
  | ReturnType<typeof union>
  | ReturnType<typeof intersection>
  | ReturnType<typeof tuple>
  | ReturnType<typeof recursion>

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
  : T extends ReturnType<typeof literal<infer L>>
  ? L
  : T extends ReturnType<typeof array<infer U>>
  ? LocalInfer<U, Z>[]
  : T extends ReturnType<typeof object<infer R extends object, infer O extends object>>
  ? InferObjectType<R, O, Z>
  : T extends ReturnType<typeof union<infer A extends readonly any[]>>
  ? InferUnionType<A, Z>
  : T extends ReturnType<typeof intersection<infer A extends readonly any[]>>
  ? InferIntersectionType<A, Z>
  : T extends ReturnType<typeof tuple<infer A extends readonly any[]>>
  ? InferTupleType<A, Z>
  : T extends ReturnType<typeof recursion<infer K extends keyof any>>
  ? { [key in K]: LocalInfer<Z> }
  : never

type InferObjectType<T, U, Z> = {
  [K in keyof T]: LocalInfer<T[K], Z>
} & {
  [K in keyof U]?: LocalInfer<U[K], Z>
}
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
function isValid<T extends LocalSchema>(value: unknown, schema: T): value is LocalInfer<T> {
  switch (schema.type) {
    case 'unknown':
    case 'any':
      return true
    case 'never':
      return false
    case 'void':
      return value === undefined
    case 'null':
      return value === null
    case 'undefined':
      return value === undefined
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
    default:
      return false
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
