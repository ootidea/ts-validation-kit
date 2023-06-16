import { LocalInfer } from './inference'
import {
  _null,
  _void,
  any,
  array,
  bigint,
  boolean,
  intersection,
  literal,
  never,
  nonEmptyArray,
  nullish,
  number,
  object,
  recursion,
  recursive,
  string,
  symbol,
  tuple,
  undefined,
  union,
  unknown,
} from './schema'
import { isValid } from './validation'

const z = {
  unknown,
  any,
  never,
  void: _void,
  null: _null,
  undefined,
  nullish,
  boolean,
  number,
  bigint,
  string,
  symbol,

  literal,
  array,
  nonEmptyArray,
  recursive,
  object,
  union,
  intersection,
  tuple,
  recursion,

  isValid,
}

namespace z {
  /**
   * @example
   * z.Infer<typeof z.number> is equivalent to number
   * z.Infer<typeof z.object({ age: z.number })> is equivalent to { age: number }
   */
  export type Infer<T> = LocalInfer<T, T>
}
export { z }
