import type { Schema } from './Schema'

export const isValid = <T extends Schema>(schema: T, value: unknown): value is T => schema.predicate(value)
