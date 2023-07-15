import { Infer as _Infer } from './inference'
import {
  _class,
  _null,
  _void,
  any,
  Array,
  bigint,
  boolean,
  intersection,
  literal,
  literalUnion,
  never,
  nullish,
  number,
  object,
  Record,
  recursion,
  recursive,
  refine,
  Schema,
  string,
  symbol,
  tuple,
  undefined,
  union,
  unknown,
} from './schema'
import { isValid } from './validation'

const z = {
  string,
  number,
  boolean,
  bigint,
  symbol,
  undefined,
  null: _null,
  nullish,
  unknown,
  any,
  never,
  void: _void,

  literal,
  Array,
  tuple,
  object,
  Record,
  union,
  literalUnion,
  intersection,
  refine,
  class: _class,
  recursive,
  recursion,

  /**
   * Determine whether the given value satisfies the schema.
   * @example
   * z.isValid(123, z.number) // true
   * z.isValid('a', z.number) // false
   */
  isValid,
}

namespace z {
  /**
   * @example
   * z.Infer<typeof z.number> is equivalent to number
   * z.Infer<typeof z.object({ age: z.number })> is equivalent to { age: number }
   */
  export type Infer<T extends Schema> = _Infer<T>
}
export { z }
