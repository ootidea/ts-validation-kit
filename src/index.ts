const fct = {
  unknown: { type: 'unknown' } as const,
  any: { type: 'any' } as const,
  never: { type: 'never' } as const,
  void: { type: 'void' } as const,
  null: { type: 'null' } as const,
  undefined: { type: 'undefined' } as const,
  boolean: { type: 'boolean' } as const,
  number: { type: 'number' } as const,
  bigint: { type: 'bigint' } as const,
  string: { type: 'string' } as const,
  symbol: { type: 'symbol' } as const,

  literal<const T>(value: T) {
    return { type: 'literal', value } as const
  },
  array<const T>(value: T) {
    return { type: 'array', value } as const
  },
  object<const T extends object>(value: T) {
    return { type: 'object', value } as const
  },
  union<const T extends readonly any[]>(...parts: T) {
    return { type: 'union', parts } as const
  },
  intersection<const T extends readonly any[]>(...parts: T) {
    return { type: 'intersection', parts } as const
  },
  tuple<const T extends readonly any[]>(...parts: T) {
    return { type: 'tuple', parts } as const
  },
  recursion<const K extends keyof any>(key: K) {
    return { type: 'recursion', key } as const
  },
}
namespace fct {
  /**
   * @example
   * fct.Infer<typeof fct.number> is equivalent to number
   * fct.Infer<typeof fct.object({ age: fct.number })> is equivalent to { age: number }
   */
  export type Infer<T, Z = T> = T extends typeof fct.unknown
    ? unknown
    : T extends typeof fct.any
    ? any
    : T extends typeof fct.never
    ? never
    : T extends typeof fct.void
    ? void
    : T extends typeof fct.null
    ? null
    : T extends typeof fct.undefined
    ? undefined
    : T extends typeof fct.boolean
    ? boolean
    : T extends typeof fct.number
    ? number
    : T extends typeof fct.bigint
    ? bigint
    : T extends typeof fct.string
    ? string
    : T extends typeof fct.symbol
    ? symbol
    : T extends ReturnType<typeof fct.literal<infer L>>
    ? L
    : T extends ReturnType<typeof fct.array<infer U>>
    ? Infer<U, Z>[]
    : T extends ReturnType<typeof fct.object<infer O extends object>>
    ? InferObjectType<O, Z>
    : T extends ReturnType<typeof fct.union<infer A extends readonly any[]>>
    ? InferUnionType<A, Z>
    : T extends ReturnType<typeof fct.intersection<infer A extends readonly any[]>>
    ? InferIntersectionType<A, Z>
    : T extends ReturnType<typeof fct.tuple<infer A extends readonly any[]>>
    ? InferTupleType<A, Z>
    : T extends ReturnType<typeof fct.recursion<infer K extends keyof any>>
    ? { [key in K]: Infer<Z> }
    : never

  type InferObjectType<T, Z> = {
    [K in keyof T]: Infer<T[K], Z>
  }
  type InferUnionType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
    ? Infer<H, Z> | InferUnionType<L, Z>
    : never
  type InferIntersectionType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
    ? Infer<H, Z> & InferUnionType<L, Z>
    : unknown
  type InferTupleType<T extends readonly any[], Z> = T extends readonly [infer H, ...infer L]
    ? [Infer<H, Z>, ...InferTupleType<L, Z>]
    : []
}
export { fct }
