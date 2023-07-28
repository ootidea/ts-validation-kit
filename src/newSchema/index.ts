import { Infer as _Infer } from './inference'
import { Array, literal, number, object, union } from './schema'

const z = {
  number,

  literal,
  Array,
  object,
  union,
}

namespace z {
  /**
   * @example
   * z.Infer<typeof z.number> is equivalent to number
   * z.Infer<typeof z.object({ age: z.number })> is equivalent to { age: number }
   */
  export type Infer<T> = _Infer<T>
}
export { z }
