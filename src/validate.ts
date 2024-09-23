import type { Infer } from './Infer'
import type { SchemaBase } from './Schema'

export function isValid<T extends SchemaBase>(schema: T, value: unknown): value is Infer<T> {
  return schema.isValid(value)
}
