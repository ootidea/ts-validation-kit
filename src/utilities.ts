import type { Equals } from 'advanced-type-utilities'
import type { Infer, InferInput } from './Infer'
import type { BaseSchema } from './schema'

export function literalToString(value: unknown): string {
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return String(value)
  return JSON.stringify(value)
}

/**
 * @example
 * expectInferredType(z.number).toBe<string>() // Fails with type error
 * expectInferredType(z.number).toBe<number>() // Succeeds due to no type errors
 */
export const expectInferredType = <T extends BaseSchema>(schema: T) => {
  return {
    toBe: <U>(..._: Equals<Infer<T>, U> extends true ? [] : [error: 'Type does not match', Infer<T>]) => {
      return schema as any
    },
  }
}

export const expectInferredInputType = <T extends BaseSchema>(schema: T) => {
  return {
    toBe: <U>(..._: Equals<InferInput<T>, U> extends true ? [] : [error: 'Type does not match', InferInput<T>]) => {
      return schema as any
    },
  }
}
