import { expectTypeOf } from 'vitest'
import { fct } from './index'

test('Infer', () => {
  /**
   * Helper function to infer the type of a schema.
   * It is convenient when used in combination with expectTypeOf.
   */
  function infer<const T>(value: T): fct.Infer<T> {
    return value as any
  }

  expectTypeOf(infer(fct.boolean)).toEqualTypeOf<boolean>()
  expectTypeOf(infer(fct.number)).toEqualTypeOf<number>()
  expectTypeOf(infer(fct.bigint)).toEqualTypeOf<bigint>()
  expectTypeOf(infer(fct.string)).toEqualTypeOf<string>()
  expectTypeOf(infer(fct.symbol)).toEqualTypeOf<symbol>()
  expectTypeOf(infer(fct.null)).toEqualTypeOf<null>()
  expectTypeOf(infer(fct.undefined)).toEqualTypeOf<undefined>()
  expectTypeOf(infer(fct.void)).toEqualTypeOf<void>()
  expectTypeOf(infer(fct.unknown)).toEqualTypeOf<unknown>()
  expectTypeOf(infer(fct.any)).toEqualTypeOf<any>()
  expectTypeOf(infer(fct.never)).toEqualTypeOf<never>()

  expectTypeOf(infer(fct.literal('abc'))).toMatchTypeOf<'abc'>()
  expectTypeOf(infer(fct.literal(123))).toEqualTypeOf<123>()

  expectTypeOf(infer(fct.array(fct.boolean))).toEqualTypeOf<boolean[]>()
  expectTypeOf(infer(fct.object({ name: fct.string }))).toEqualTypeOf<{ name: string }>()

  expectTypeOf(infer(fct.union(fct.number, fct.undefined))).toEqualTypeOf<number | undefined>()
  expectTypeOf(infer(fct.union(fct.literal('abc'), fct.literal(123)))).toEqualTypeOf<'abc' | 123>()
  expectTypeOf(infer(fct.union())).toEqualTypeOf<never>()

  expectTypeOf(infer(fct.tuple(fct.number, fct.string))).toEqualTypeOf<[number, string]>()
  expectTypeOf(infer(fct.tuple())).toEqualTypeOf<[]>()
})
