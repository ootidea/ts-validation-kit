import type { MergeIntersection } from 'advanced-type-utilities'
import type { Optional, SchemaBase } from './schema'

export type Infer<T extends SchemaBase> = T extends { type: 'number' }
  ? number
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
    : never
