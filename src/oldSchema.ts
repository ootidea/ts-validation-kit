// import { isOneOf } from 'base-up'
//
// export type Predicate<T = any, U extends T = any> =
//   | ((value: T) => value is U)
//   | ((value: T) => boolean)
// export type PredicateResult<T> = T extends (value: any) => value is infer R
//   ? R
//   : T extends (value: infer V) => boolean
//   ? V
//   : never
// export function toTypePredicate<
//   T,
//   P extends ((value: T) => value is any) | ((value: T) => boolean),
// >(predicate: P) {
//   return predicate as any
// }
//
// const number = {
//   type: 'number',
//   get integer() {
//     return withPrototype(() => this, this)
//   },
//   refine<P extends Predicate<number>>(predicate: P) {
//     return refinedNumber(this, predicate)
//   },
// } as const
//
// const Array = <T extends object>(element: T) =>
//   ({
//     type: 'Array',
//     element,
//     refine<P extends Predicate<Infer<T>[]>>(predicate: P) {
//       return refinedArray(this, predicate)
//     },
//   }) as const
//
// const refinedNumber = <const T extends object, P extends Predicate<Infer<T>>>(
//   base: T,
//   predicate: P,
// ) =>
//   ({
//     type: 'refinedNumber',
//     base,
//     predicate,
//     get integer() {
//       return withPrototype(() => this, this)
//     },
//     refine<P2 extends Predicate<PredicateResult<P>>>(predicate: P2) {
//       return refinedNumber(this, predicate)
//     },
//   }) as const
//
// const refinedArray = <const T extends object, P extends Predicate<Infer<T>>>(
//   base: T,
//   predicate: P,
// ) =>
//   ({
//     type: 'refinedArray',
//     base,
//     predicate,
//     // refine<P2 extends Predicate<PredicateResult<P>>>(predicate: P2) {
//     refine<P2 extends Predicate<PredicateResult<P>>>(predicate: P2) {
//       return refinedArray(this, predicate)
//     },
//   }) as const
//
// // type RefinedArray<T extends object, P extends Predicate<Infer<T>>> = {
// //   type: 'refinedArray'
// //   base: T
// //   predicate: P
// //   refine<P extends Predicate<Infer<T>>>(predicate: P): RefinedArray<T, P>
// // }
//
// type Infer<T> = T extends { type: 'number' }
//   ? number
//   : T extends { type: 'Array'; element: infer U }
//   ? Infer<U>[]
//   : T extends { type: 'refine'; base: infer U; predicate: infer P extends Predicate }
//   ? Infer<U> & PredicateResult<P>
//   : T extends { type: 'refinedNumber'; base: infer U; predicate: infer P extends Predicate<number> }
//   ? Infer<U> & PredicateResult<P>
//   : T extends { type: 'refinedArray'; base: infer U; predicate: any }
//   ? Infer<U> & PredicateResult<T['predicate']>
//   : never
//
// export function withPrototype<const T, const P extends object>(
//   target: T,
//   prototype: P,
// ): T & Omit<P, keyof T> {
//   Object.setPrototypeOf(target, prototype)
//   return target as any
// }
//
// // function refine<T extends object, U extends Infer<T>>(
// //   base: T,
// //   predicate: (value: Infer<T>) => value is U,
// // ) {
// //   return withPrototype({ type: 'refine', base, predicate }, base)
// // }
//
// const isTwoLength = <T>(value: T[]): value is [T, T] => value.length === 2
// const isTwo = (value: number): value is 2 => value === 2
// const a = infer(
//   Array(number)
//     // .refine((x) => !x)
//     .refine(isTwoLength),
// )
// // const dde = toTypePredicate<number[]>(isTwoLength)
// // toTypePredicate<number[]>(isTwoLength)
//
// const tw = infer(number.refine(isOneOf.defer(1, 2, 3)).refine(isOneOf.defer(1, 10)))
// const po: (value: number) => value is any = isTwo
//
// // TODO: delete
// function infer<const T>(value: T): Infer<T> {
//   return value as any
// }
