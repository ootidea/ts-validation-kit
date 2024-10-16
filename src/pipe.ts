import { Result } from 'result-type-ts'
import type { InferInput, InferResult } from './Infer'
import type { ConverterResult, NonConverterResult, SchemaBase, ValidateResult } from './schema'

export function pipe<B extends SchemaBase, R1 extends ValidateResult>(
  s1: B,
  s2: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>]>) => R1 },
): { type: 'pipe'; schemas: [B, typeof s2]; validate: PipeValidate<B, [R1]> }
export function pipe<B extends SchemaBase, R1 extends ValidateResult, R2 extends ValidateResult>(
  s1: B,
  s2: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1]>) => R2 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3]; validate: PipeValidate<B, [R1, R2]> }
export function pipe<
  B extends SchemaBase,
  R1 extends ValidateResult,
  R2 extends ValidateResult,
  R3 extends ValidateResult,
>(
  s1: B,
  s2: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1]>) => R2 },
  s4: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1, R2]>) => R3 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3, typeof s4]; validate: PipeValidate<B, [R1, R2, R3]> }
export function pipe<
  B extends SchemaBase,
  R1 extends ValidateResult,
  R2 extends ValidateResult,
  R3 extends ValidateResult,
  R4 extends ValidateResult,
>(
  s1: B,
  s2: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>]>) => R1 },
  s3: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1]>) => R2 },
  s4: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1, R2]>) => R3 },
  s5: { validate: (input: DerivePipedType<InferInput<B>, [InferResult<B>, R1, R2, R3]>) => R4 },
): { type: 'pipe'; schemas: [B, typeof s2, typeof s3, typeof s4]; validate: PipeValidate<B, [R1, R2, R3, R4]> }
export function pipe(
  s1: { validate: (input: any) => any },
  s2: { validate: (input: any) => any },
  s3?: { validate: (input: any) => any },
  s4?: { validate: (input: any) => any },
  s5?: { validate: (input: any) => any },
) {
  const schemas = [s1, s2, s3, s4, s5].filter((s) => s !== undefined)
  return {
    type: 'pipe',
    schemas,
    validate: (input: unknown) => {
      let current = input
      for (const schema of schemas) {
        const subresult = schema.validate(current)
        if (subresult.isFailure) return subresult
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
    ? H extends { converted?: never }
      ? DerivePipedType<Acc & R, L> // Narrow the return type.
      : DerivePipedType<R, L> // Replace the return type with the converted type.
    : never // Unreachable
  : Acc

/** If the argument includes a converter schema, this also becomes a converter. */
type PipeValidate<B extends SchemaBase, S extends readonly ValidateResult[]> = [
  ReturnType<B['validate']>,
  ...S,
] extends readonly NonConverterResult[]
  ? (input: any) => NonConverterResult
  : (input: any) => ConverterResult
