import type { Simplify, Tuple } from 'base-up'

export type Infer<T> = T extends { type: 'number' }
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
type InferUnionType<T extends Tuple> = T extends readonly [infer H, ...infer L] ? Infer<H> | InferUnionType<L> : never
