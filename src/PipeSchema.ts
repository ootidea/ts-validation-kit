import type { Infer } from './Infer'
import type { SchemaBase } from './Schema'

export function pipe<T extends SchemaBase, R1 extends Infer<T>>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
): {
  readonly type: 'pipe'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1]
  readonly isValid: (value: unknown) => boolean
}
export function pipe<T extends SchemaBase, R1 extends Infer<T>, R2 extends Infer<T> & R1>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
): {
  readonly type: 'pipe'
  readonly base: T
  readonly predicates: [(value: Infer<T>) => value is R1, (value: Infer<T> & R1) => value is R2]
  readonly isValid: (value: unknown) => boolean
}
export function pipe<
  T extends SchemaBase,
  R1 extends Infer<T>,
  R2 extends Infer<T> & R1,
  R3 extends Infer<T> & R1 & R2,
>(
  base: T,
  predicate1: ((value: Infer<T>) => boolean) | ((value: Infer<T>) => value is R1),
  predicate2: ((value: Infer<T> & R1) => boolean) | ((value: Infer<T> & R1) => value is R2),
  predicate3: ((value: Infer<T> & R1 & R2) => boolean) | ((value: Infer<T> & R1 & R2) => value is R3),
): {
  readonly type: 'pipe'
  readonly base: T
  readonly predicates: [
    (value: Infer<T>) => value is R1,
    (value: Infer<T> & R1) => value is R2,
    (value: Infer<T> & R1 & R2) => value is R3,
  ]
  readonly isValid: (value: unknown) => boolean
}
export function pipe<T extends SchemaBase, Predicate extends (value: unknown) => boolean>(
  base: T,
  predicate1: Predicate,
  predicate2?: Predicate,
  predicate3?: Predicate,
) {
  const predicates = [predicate1, predicate2, predicate3].filter((predicate) => predicate !== undefined)
  return {
    type: 'pipe',
    base,
    predicates,
    isValid: (value: unknown) => base.isValid(value) && predicates.every((p) => p(value)),
  } as any
}
