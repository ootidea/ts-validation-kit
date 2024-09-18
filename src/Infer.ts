import type { MergeIntersection } from 'advanced-type-utilities'
import type { SchemaBase } from './Schema'

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
  : T extends { type: 'literal'; value: infer V }
    ? V
    : T extends { type: 'union'; parts: infer Parts extends readonly SchemaBase[] }
      ? Parts[number] extends infer PartsUnion extends SchemaBase
        ? PartsUnion extends PartsUnion
          ? Infer<PartsUnion>
          : never
        : never
      : T extends { type: 'properties'; properties: infer Properties extends Record<keyof any, SchemaBase> }
        ? MergeIntersection<
            {
              [K in keyof Properties as Properties[K] extends { type: 'optional' } ? never : K]: Infer<Properties[K]>
            } & {
              [K in keyof Properties as Properties[K] extends { type: 'optional' } ? K : never]?: Infer<Properties[K]>
            }
          >
        : T extends { type: 'Array'; element: infer E extends SchemaBase }
          ? Infer<E>[]
          : T extends { type: 'optional'; schema: infer S extends SchemaBase }
            ? Infer<S>
            : T extends {
                  type: 'refine'
                  base: infer B extends SchemaBase
                  predicates: infer Predicates
                }
              ? Infer<B> & ExtractTypePredicates<Predicates>
              : never

type ExtractTypePredicates<P> = P extends [(value: any) => value is infer R, ...infer T]
  ? R & ExtractTypePredicates<T>
  : unknown
