import type { MergeIntersection, TupleToIntersection } from 'advanced-type-utilities'
import type { BaseSchema, ValidateResult } from './schema'
import type { Optional } from './schemas/object'
import type { DerivePipedType } from './schemas/pipe'

type StandardLowercaseTypeMap = {
  boolean: boolean
  number: number
  bigint: bigint
  string: string
  symbol: symbol
  object: object
  unknown: unknown
  any: any
  never: never
}

export type Infer<T extends BaseSchema> = T['type'] extends keyof StandardLowercaseTypeMap
  ? StandardLowercaseTypeMap[T['type']]
  : T extends { type: 'properties'; properties: infer Properties extends Record<keyof any, BaseSchema | Optional> }
    ? MergeIntersection<
        {
          // Infers required properties.
          [K in keyof Properties as Properties[K] extends BaseSchema ? K : never]: Properties[K] extends BaseSchema
            ? Infer<Properties[K]>
            : never // Unreachable
        } & {
          // Infers optional properties.
          [K in keyof Properties as Properties[K] extends Optional ? K : never]?: Properties[K] extends Optional
            ? Infer<Properties[K]['schema']>
            : never // Unreachable
        }
      >
    : T extends { type: 'Array'; element: infer Element extends BaseSchema }
      ? Infer<Element>[]
      : T extends { type: 'or'; schemas: infer S extends readonly BaseSchema[] }
        ? { [K in keyof S]: Infer<S[K]> }[number]
        : T extends { type: 'recursive'; lazy: infer L }
          ? L extends (() => infer S extends BaseSchema)
            ? Infer<S>
            : never
          : T extends {
                type: 'pipe'
                schemas: readonly [
                  infer B extends BaseSchema,
                  ...infer L extends readonly { validate: (input: any) => any }[],
                ]
              }
            ? DerivePipedType<InferInput<B>, { [K in keyof L]: ReturnType<L[K]['validate']> }>
            : T extends { validate: (input: any) => ValidateResult<infer R> }
              ? R
              : never

export type InferInput<T extends BaseSchema> = T extends {
  type: 'pipe'
  schemas: [infer B extends BaseSchema, ...any]
}
  ? Infer<B>
  : T extends { type: 'or'; schemas: infer S extends readonly BaseSchema[] }
    ? TupleToIntersection<{ [K in keyof S]: InferInput<S[K]> }>
    : T extends { validate: (input: infer U) => any }
      ? U
      : unknown
