import { type BaseSchema, type ValidateResult, failure } from '../schema'

export const or = <const T extends readonly BaseSchema[]>(...schemas: T) =>
  ({
    type: 'or',
    schemas,
    validate: (input: unknown): OrOutput<T> => {
      const errorMessages: string[] = []
      for (const schema of schemas) {
        const result = schema.validate(input)
        if (result.isSuccess) return result

        errorMessages.push(result.error.message)
      }

      return failure(
        `must resolve any one of the following issues: ${errorMessages.map((message, i) => `(${i + 1}) ${message}`).join(' ')}`,
      ) as any
    },
  }) as const

type OrOutput<T extends readonly BaseSchema[]> = T[number]['validate'] extends (input: any) => ValidateResult<infer R>
  ? ValidateResult<R>
  : never
