import type { MergeIntersection } from 'advanced-type-utilities'
import type { SchemaBase } from './schema'

export type Infer<T extends SchemaBase> = T extends { type: 'number' }
  ? number
  : T extends { type: 'properties'; properties: infer Properties extends Record<keyof any, SchemaBase> }
    ? MergeIntersection<
        {
          [K in keyof Properties as Properties[K] extends { type: 'optional' } ? never : K]: Infer<Properties[K]>
        } & {
          [K in keyof Properties as Properties[K] extends { type: 'optional' } ? K : never]?: Infer<Properties[K]>
        }
      >
    : never
