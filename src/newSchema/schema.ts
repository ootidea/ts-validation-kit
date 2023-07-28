import { MinLengthArray } from 'base-up'
import { Infer } from './inference'

export const number = {
  type: 'number',
  get integer() {
    const result = refinedNumber(this, (value: number): value is number => Number.isInteger(value))
    return withPrototype(() => result, result)
  },
  refine<T extends number>(predicate: (value: number) => value is T) {
    return refinedNumber(this, predicate)
  },
} as const

const refinedNumber = <T, U extends Infer<T>>(
  base: T,
  predicate: (value: Infer<T>) => value is U,
) =>
  ({
    type: 'refinedNumber',
    base,
    predicate,
    get integer() {
      const result = refinedNumber(this, (value: U): value is U => Number.isInteger(value))
      return withPrototype(() => result, result)
    },
    refine<V extends U>(predicate: (value: U) => value is V) {
      return refinedNumber(this, predicate)
    },
  }) as const

export const Array = <T extends object>(element: T) =>
  ({
    type: 'Array',
    element,
    refine<U extends Infer<T>[]>(predicate: (value: Infer<T>[]) => value is U) {
      return refinedArray(this, predicate)
    },
  }) as const

const refinedArray = <
  const T extends
    | { type: 'Array'; element: any }
    | {
        type: 'refinedArray'
        predicate: (value: any) => value is any
      },
  U extends Infer<T>,
>(
  base: T,
  predicate: (value: Infer<T>) => value is U,
) =>
  ({
    type: 'refinedArray',
    base,
    predicate,
    refine<V extends U>(predicate: (value: U) => value is V) {
      return refinedArray(this, predicate)
    },
    minLength<N extends number>(length: N) {
      return refinedArray(
        this,
        (
          value: U,
        ): value is MinLengthArray<N, U[number]> extends infer P ? (P extends U ? P : U) : never =>
          value.length >= length,
      )
    },
  }) as const

export function literal<const T>(value: T) {
  return { type: 'literal', value } as const
}

export function object<const T extends object>(properties: T) {
  return { type: 'object', properties } as const
}

export function union<T extends readonly any[]>(...parts: T) {
  return { type: 'union', parts } as const
}

export function withPrototype<const T, const P extends object>(
  target: T,
  prototype: P,
): T & Omit<P, keyof T> {
  Object.setPrototypeOf(target, prototype)
  return target as any
}
