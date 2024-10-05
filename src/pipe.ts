import { Result } from 'result-type-ts'
import type { InferArgument, InferResult } from './Infer'
import type { SchemaBase, ValidateResult } from './schema'

export function pipe<B extends SchemaBase, R1 extends ValidateResult>(
  s1: B,
  s2: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>]>) => R1 },
): { type: 'pipe'; schemas: [B, typeof s2]; validate: (value: any) => any }
export function pipe<B extends SchemaBase, R1 extends ValidateResult, R2 extends ValidateResult>(
  s1: B,
  s2: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1]>) => R2 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3]; validate: (value: any) => any }
export function pipe<
  B extends SchemaBase,
  R1 extends ValidateResult,
  R2 extends ValidateResult,
  R3 extends ValidateResult,
>(
  s1: B,
  s2: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1]>) => R2 },
  s4: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1, R2]>) => R3 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3, typeof s4]; validate: (value: any) => any }
export function pipe<
  B extends SchemaBase,
  R1 extends ValidateResult,
  R2 extends ValidateResult,
  R3 extends ValidateResult,
  R4 extends ValidateResult,
>(
  s1: B,
  s2: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1]>) => R2 },
  s4: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1, R2]>) => R3 },
  s5: { validate: (value: DerivePipedType<InferArgument<B>, [InferResult<B>, R1, R2, R3]>) => R4 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3, typeof s4]; validate: (value: any) => any }
export function pipe(
  s1: { validate: (value: any) => any },
  s2: { validate: (value: any) => any },
  s3?: { validate: (value: any) => any },
  s4?: { validate: (value: any) => any },
  s5?: { validate: (value: any) => any },
) {
  const schemas = [s1, s2, s3, s4, s5].filter((s) => s !== undefined)
  return {
    type: 'pipe',
    schemas,
    validate: (value: unknown) => {
      let current = value
      for (const schema of schemas) {
        const subresult = schema.validate(current)
        if (subresult.isFailure()) return subresult
        current = subresult.value
      }
      return Result.success(current)
    },
  } as any
}

/**
 * Perform return type narrowing for predicate schema.
 * Perform return type replacement for converter schemas.
 */
export type DerivePipedType<Acc, T extends readonly ValidateResult[]> = T extends readonly [
  infer H extends ValidateResult,
  ...infer L extends readonly ValidateResult[],
]
  ? H extends { value?: infer R }
    ? 'converted' extends keyof H
      ? DerivePipedType<R, L> // Replace the return type with the converted type.
      : DerivePipedType<Acc & R, L> // Narrow the return type.
    : never // Unreachable
  : Acc
