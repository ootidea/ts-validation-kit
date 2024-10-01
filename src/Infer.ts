import type { MergeIntersection } from 'advanced-type-utilities'
import type { Optional, SchemaBase } from './schema'

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

export type Infer<T extends SchemaBase> = T['type'] extends keyof StandardLowercaseTypeMap
  ? StandardLowercaseTypeMap[T['type']]
  : T extends { type: 'properties'; properties: infer Properties extends Record<keyof any, SchemaBase | Optional> }
    ? MergeIntersection<
        {
          // Infers required properties.
          [K in keyof Properties as Properties[K] extends SchemaBase ? K : never]: Properties[K] extends SchemaBase
            ? Infer<Properties[K]>
            : never // Unreachable
        } & {
          // Infers optional properties.
          [K in keyof Properties as Properties[K] extends Optional ? K : never]?: Properties[K] extends Optional
            ? Infer<Properties[K]['schema']>
            : never // Unreachable
        }
      >
    : T extends { type: 'Array'; element: infer Element extends SchemaBase }
      ? Infer<Element>[]
      : T extends { type: 'recursive'; lazy: infer L }
        ? L extends (() => infer S extends SchemaBase)
          ? Infer<S>
          : never
        : never
