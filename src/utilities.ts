import type { Equals } from 'advanced-type-utilities'
import type { Infer } from './Infer'
import type { SchemaPartBase } from './Schema'

/**
 * @example
 * expectInferredType(z.number).toBe<string>() // Fails with type error
 * expectInferredType(z.number).toBe<number>() // Succeeds due to no type errors
 */
export const expectInferredType = <T extends SchemaPartBase>(schema: T) => {
  return {
    toBe: <U>(..._: Equals<Infer<T>, U> extends true ? [] : [error: 'Type does not match']) => {
      return schema as any
    },
  }
}
