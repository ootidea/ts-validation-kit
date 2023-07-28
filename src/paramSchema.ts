import { MinLengthArray, Simplify, Tuple } from 'base-up'

const number = {
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

type Infer<T> = T extends { type: 'number' }
  ? number
  : T extends {
      type: 'refinedNumber'
      predicate: (value: any) => value is infer P
    }
  ? P
  : T extends { type: 'Array'; element: infer E }
  ? Infer<E>[]
  : T extends {
      type: 'refinedArray'
      predicate: (value: any) => value is infer P
    }
  ? P
  : T extends { type: 'literal'; value: infer V }
  ? V
  : T extends { type: 'object'; properties: infer P }
  ? InferObjectType<P>
  : T extends { type: 'union'; parts: infer P extends Tuple }
  ? InferUnionType<P>
  : never
type InferObjectType<T> = Simplify<{
  -readonly [K in keyof T]: Infer<T[K]>
}>
type InferUnionType<T extends Tuple> = T extends readonly [infer H, ...infer L]
  ? Infer<H> | InferUnionType<L>
  : never

export function withPrototype<const T, const P extends object>(
  target: T,
  prototype: P,
): T & Omit<P, keyof T> {
  Object.setPrototypeOf(target, prototype)
  return target as any
}

function infer<const T>(value: T): Infer<T> {
  return value as any
}
const p = infer(
  number
    .refine((value): value is 1 | 2 | 3 => value === 1)
    .refine((value): value is 2 => value === 2),
)
const a = infer(
  Array(number)
    .refine((value): value is number[] => value.length < 2)
    .minLength(1),
)
