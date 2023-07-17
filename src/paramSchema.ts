import { Tuple } from 'base-up'

const number = {
  type: 'number',
  // get integer() {
  //   const result = refinedNumber(this, (value: number): value is number => Number.isInteger(value))
  //   return withPrototype(() => result, result)
  // },
  refine<T extends number>(predicate: (value: number) => value is T) {
    return refinedNumber(this, predicate)
  },
} as const

const refinedNumber = <T, U, V extends U>(base: T, predicate: (value: U) => value is V) =>
  ({
    type: 'refinedNumber',
    base,
    predicate,
    // get integer() {
    //   const result = refinedNumber(this, (value: V): value is V => Number.isInteger(value))
    //   return withPrototype(() => result, result)
    // },
    refine<W extends V>(predicate: (value: V) => value is W) {
      return refinedNumber(this, predicate)
    },
  }) as const

export const Array = <T extends object>(element: T) =>
  ({
    type: 'Array',
    element,
    refine<U extends readonly Infer<T>[]>(predicate: (value: readonly Infer<T>[]) => value is U) {
      return refinedArray(this, predicate)
    },
  }) as const

const refinedArray = <const T extends object, U, V extends U>(
  base: T,
  predicate: (value: U) => value is V,
) =>
  ({
    type: 'refinedArray',
    base,
    predicate,
    refine<W extends V>(predicate: (value: V) => value is W) {
      return refinedArray(base, predicate)
    },
  }) as const

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
  : T extends { type: 'union'; parts: infer P extends Tuple }
  ? InferUnionType<P>
  : never
type InferUnionType<T extends Tuple> = T extends readonly [infer H, ...infer L]
  ? Infer<H> | InferUnionType<L>
  : never

function infer<const T>(value: T): Infer<T> {
  return value as any
}
export function withPrototype<const T, const P extends object>(
  target: T,
  prototype: P,
): T & Omit<P, keyof T> {
  Object.setPrototypeOf(target, prototype)
  return target as any
}

const p = infer(
  number
    .refine((value): value is 1 | 2 | 3 => value === 1)
    .refine((value): value is 2 => value === 2),
)
const a = infer(
  Array(number)
    .refine((value): value is [] | [number] => value.length < 2)
    .refine((value): value is [] => value.length === 0),
)
