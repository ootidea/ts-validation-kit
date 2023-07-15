import { DiscriminatedUnion, Tuple } from 'base-up'
import { Infer } from './inference'

const commonPrototype = {
  or: function <const T extends Schema, const U extends Schema>(this: T, schema: U) {
    return { ...commonPrototype, type: 'union', parts: [this, schema] } as const
  },
  refine: refineMethod,
  get prototype() {
    return commonPrototype
  },
} as const
/**
 * I'm not entirely sure why, but defining it as shown below results in an error.
 * type CommonPrototype = typeof commonPrototype
 */
type CommonPrototype = {
  or: <const T extends Schema, const U extends Schema>(
    this: T,
    schema: U
  ) => CommonPrototype & { type: 'union'; parts: readonly [T, U] }
  refine: typeof refineMethod
  readonly prototype: CommonPrototype
}

const stringPrototype = {
  ...commonPrototype,
  min: function <const T extends Schema, const N extends number>(this: T, bound: N) {
    return {
      ...stringPrototype,
      type: 'refine',
      base: this,
      predicate: (value: string): value is string => value.length >= bound,
    } as const
  },
  get prototype(): StringPrototype {
    return stringPrototype
  },
} as const
type StringPrototype = CommonPrototype & {
  min: <const T extends Schema, const N extends number>(
    this: T,
    bound: N
  ) => StringPrototype & { type: 'refine'; base: T; predicate: (value: string) => value is string }
  readonly prototype: StringPrototype
}

const arrayPrototype = {
  ...commonPrototype,
  minLength: function <const T extends Schema, const N extends number>(this: T, length: N) {
    return { ...arrayPrototype, type: 'minLengthArray', base: this, length } as const
  },
  get prototype(): ArrayPrototype {
    return arrayPrototype
  },
} as const
type ArrayPrototype = CommonPrototype & {
  minLength: <const T extends Schema, const N extends number>(
    this: T,
    length: N
  ) => ArrayPrototype & { type: 'minLengthArray'; base: T; length: N }
  readonly prototype: ArrayPrototype
}

export type Schema = DiscriminatedUnion<{
  string: StringPrototype
  number: CommonPrototype
  boolean: CommonPrototype
  bigint: CommonPrototype
  symbol: CommonPrototype
  undefined: CommonPrototype
  null: CommonPrototype
  unknown: CommonPrototype
  any: CommonPrototype
  never: CommonPrototype
  void: CommonPrototype
  literal: CommonPrototype & { value: unknown }
  Array: ArrayPrototype & { value: Schema }
  NonEmptyArray: CommonPrototype & { value: Schema }
  tuple: CommonPrototype & { parts: readonly Schema[] }
  object: CommonPrototype & { required: Record<keyof any, Schema>; optional: Record<keyof any, Schema> }
  Record: CommonPrototype & { key: Schema; value: Schema }
  union: CommonPrototype & { parts: readonly Schema[] }
  intersection: CommonPrototype & { parts: readonly Schema[] }
  refine: CommonPrototype & { base: Schema; predicate: (value: any) => value is any }
  class: CommonPrototype & { constructor: abstract new (..._: any) => any }
  recursive: CommonPrototype & { value: Schema; key: keyof any }
  recursion: CommonPrototype & { key: keyof any }
  minLengthArray: ArrayPrototype & { base: Schema; length: number }
}>

/** The default value when the key is omitted in {@link z.recursion} or {@link z.recursive}. */
export const ANONYMOUS = Symbol()

export const string = { ...stringPrototype, type: 'string' } as const satisfies Schema
export const number = { ...commonPrototype, type: 'number' } as const satisfies Schema
export const boolean = { ...commonPrototype, type: 'boolean' } as const satisfies Schema
export const bigint = { ...commonPrototype, type: 'bigint' } as const satisfies Schema
export const symbol = { ...commonPrototype, type: 'symbol' } as const satisfies Schema
export const undefined = { ...commonPrototype, type: 'undefined' } as const satisfies Schema
export const _null = { ...commonPrototype, type: 'null' } as const satisfies Schema
export const nullish = { ...commonPrototype, type: 'union', parts: [_null, undefined] } as const satisfies Schema
export const unknown = { ...commonPrototype, type: 'unknown' } as const satisfies Schema
export const any = { ...commonPrototype, type: 'any' } as const satisfies Schema
export const never = { ...commonPrototype, type: 'never' } as const satisfies Schema
export const _void = { ...commonPrototype, type: 'void' } as const satisfies Schema

export function literal<const T>(value: T) {
  return { ...commonPrototype, type: 'literal', value } as const
}

export function Array<const T extends Schema>(value: T) {
  return { ...arrayPrototype, type: 'Array', value } as const
}

export function NonEmptyArray<const T extends Schema>(value: T) {
  return { ...commonPrototype, type: 'NonEmptyArray', value } as const
}

export function tuple<const T extends readonly Schema[]>(...parts: T) {
  return { ...commonPrototype, type: 'tuple', parts } as const
}

export function object<T extends Record<keyof any, Schema>>(
  required: T
): CommonPrototype & { type: 'object'; required: T; optional: Record<never, Schema> }
export function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(
  required: T,
  optional: U
): CommonPrototype & { type: 'object'; required: T; optional: U }
export function object<T extends Record<keyof any, Schema>, U extends Record<keyof any, Schema>>(
  required: T,
  optional?: U
) {
  return { ...commonPrototype, type: 'object', required, optional: optional ?? {} } as const
}

export function Record<const Key extends Schema, const Value extends Schema>(key: Key, value: Value) {
  return { ...commonPrototype, type: 'Record', key, value } as const
}

export function union<const T extends readonly Schema[]>(...parts: T) {
  return { ...commonPrototype, type: 'union', parts } as const
}

type ConvertLiteralUnion<T extends Tuple> = T extends readonly [infer H, ...infer L]
  ? readonly [CommonPrototype & { type: 'literal'; value: H }, ...ConvertLiteralUnion<L>]
  : []
export function literalUnion<const T extends Tuple>(
  ...literals: T
): CommonPrototype & { type: 'union'; parts: ConvertLiteralUnion<T> } {
  return {
    ...commonPrototype,
    type: 'union',
    parts: literals.map((value) => ({ ...commonPrototype, type: 'literal', value })),
  } as any
}

export function intersection<const T extends readonly Schema[]>(...parts: T) {
  return { ...commonPrototype, type: 'intersection', parts } as const
}

export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: U
): T['prototype'] & { type: 'refine'; base: T; predicate: U }
export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: (value: Infer<T>) => boolean
): T['prototype'] & { type: 'refine'; base: T; predicate: (value: Infer<T>) => value is Infer<T> }
export function refine<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  base: T,
  predicate: U
) {
  return { ...base.prototype, type: 'refine', base, predicate } as const
}

export function refineMethod<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  this: T,
  predicate: U
): T['prototype'] & { type: 'refine'; base: T; predicate: U }
export function refineMethod<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  this: T,
  predicate: (value: Infer<T>) => boolean
): T['prototype'] & { type: 'refine'; base: T; predicate: (value: Infer<T>) => value is Infer<T> }
export function refineMethod<const T extends Schema, const U extends (value: Infer<T>) => value is any>(
  this: T,
  predicate: U
) {
  return { ...this.prototype, type: 'refine', base: this, predicate } as const
}

export function _class<const T>(constructor: abstract new (..._: any) => T) {
  return { ...commonPrototype, type: 'class', constructor } as const
}

export const recursion = withPrototype(
  <const K extends keyof any>(key: K) => ({ ...commonPrototype, type: 'recursion', key } as const),
  { ...commonPrototype, type: 'recursion', key: ANONYMOUS }
) satisfies Schema

export function recursive<const T extends Schema>(
  value: T
): CommonPrototype & { type: 'recursive'; value: T; key: typeof ANONYMOUS }
export function recursive<const T extends Schema, const K extends keyof any>(
  key: K,
  value: T
): CommonPrototype & { type: 'recursive'; value: T; key: K }
export function recursive<const T extends Schema, const K extends keyof any>(first: T | K, second?: T) {
  if (second === void 0) {
    return { ...commonPrototype, type: 'recursive', value: first, key: ANONYMOUS } as const
  }
  return { ...commonPrototype, type: 'recursive', value: second, key: first } as const
}

function withPrototype<const T, const P extends object>(target: T, prototype: P): T & P {
  Object.setPrototypeOf(target, prototype)
  return target as T & P
}
