import type { BaseSchema, ConverterResult, NonConverterResult, NonConverterSchema } from '../schema'

export const recursive = <const T extends () => any>(lazy: T) =>
  ({
    type: 'recursive',
    lazy,
    validate: (input: unknown): T extends () => NonConverterSchema ? NonConverterResult : ConverterResult =>
      (lazy as () => BaseSchema)().validate(input),
  }) as const
