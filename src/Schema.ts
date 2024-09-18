import type { Infer } from './Infer'

export type SchemaPartBase = { type: string }

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

export const Array_ = <T extends SchemaPartBase>(element: T) => ({ type: 'Array', element }) as const
export const union = <T extends readonly SchemaPartBase[]>(...parts: T) => ({ type: 'union', parts }) as const

const objectFunction = <T extends Record<keyof any, SchemaPartBase>>(properties: T) =>
  ({ type: 'properties', properties }) as const
export const object: {
  type: 'object'
  <T extends Record<keyof any, SchemaPartBase>>(properties: T): { type: 'properties'; properties: T }
} = Object.assign(objectFunction, { type: 'object' } as const)

export const optional = <T extends SchemaPartBase>(schema: T) => ({ type: 'optional', schema }) as const

