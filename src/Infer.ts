import type { MergeIntersection } from 'advanced-type-utilities'
import type { SchemaPartBase } from './Schema'

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

export type Infer<T extends SchemaPartBase> = T['type'] extends keyof StandardLowercaseTypeMap
  ? StandardLowercaseTypeMap[T['type']]
  : T extends { type: 'literal'; value: infer V }
    ? V
    : T extends { type: 'union'; parts: infer Parts extends readonly SchemaPartBase[] }
      ? Parts[number] extends infer PartsUnion extends SchemaPartBase
        ? PartsUnion extends PartsUnion
          ? Infer<PartsUnion>
          : never
        : never
      : T extends { type: 'properties'; properties: infer Properties extends Record<keyof any, SchemaPartBase> }
        ? MergeIntersection<
            {
              [K in keyof Properties as Properties[K] extends { type: 'optional' } ? never : K]: Infer<Properties[K]>
            } & {
              [K in keyof Properties as Properties[K] extends { type: 'optional' } ? K : never]?: Infer<Properties[K]>
            }
          >
        : T extends { type: 'Array'; element: infer E extends SchemaPartBase }
          ? Infer<E>[]
          : T extends { type: 'optional'; schema: infer S extends SchemaPartBase }
            ? Infer<S>
            : T extends {
                  type: 'refine'
                  base: infer B extends SchemaPartBase
                  predicates: infer Predicates
                }
              ? Infer<B> & ExtractTypePredicates<Predicates>
              : never

type ExtractTypePredicates<P> = P extends [(value: any) => value is infer R, ...infer T]
  ? R & ExtractTypePredicates<T>
  : unknown
