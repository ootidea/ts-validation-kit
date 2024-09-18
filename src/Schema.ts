import type { Infer } from './Infer'

export type SchemaBase = { type: string }

export const boolean = { type: 'boolean' } as const
export const number = { type: 'number' } as const
export const bigint = { type: 'bigint' } as const
export const string = { type: 'string' } as const
export const symbol = { type: 'symbol' } as const
export const unknown = { type: 'unknown' } as const
export const any = { type: 'any' } as const
export const never = { type: 'never' } as const

export const literal = <const T>(value: T) => ({ type: 'literal', value }) as const
export const true_ = literal(true)
export const false_ = literal(false)
export const null_ = literal(null)
export const undefined_ = literal(undefined)

export const Array_ = <T extends SchemaBase>(element: T) => ({ type: 'Array', element }) as const
export const union = <T extends readonly SchemaBase[]>(...parts: T) => ({ type: 'union', parts }) as const

const objectFunction = <T extends Record<keyof any, SchemaBase>>(properties: T) =>
  ({ type: 'properties', properties }) as const
export const object: {
  type: 'object'
  <T extends Record<keyof any, SchemaBase>>(properties: T): { type: 'properties'; properties: T }
} = Object.assign(objectFunction, { type: 'object' } as const)

export const optional = <T extends SchemaBase>(schema: T) => ({ type: 'optional', schema }) as const

export function refine<T extends SchemaBase, R1 extends Infer<T>>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
): {
  readonly type: 'refine'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1]
}
export function refine<T extends SchemaBase, R1 extends Infer<T>, R2 extends Infer<T> & R1>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
): {
  readonly type: 'refine'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1, (value: Infer<T> & R1) => value is R2]
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
}
export function refine<
  T extends SchemaBase,
  R1 extends Infer<T>,
  R2 extends Infer<T> & R1,
  R3 extends Infer<T> & R1 & R2,
>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2?: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
  predicate3?: ((value: Infer<T> & R1 & R2) => boolean) | ((value: Infer<T> & R1 & R2) => value is R3),
) {
  const predicates = [predicate1, predicate2, predicate3].filter((predicate) => predicate !== undefined)
  return { type: 'refine', base, predicates } as const
}
