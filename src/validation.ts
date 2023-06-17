import { assertNeverType, entriesOf } from 'base-up'
import { Infer } from './inference'
import { Schema } from './schema'

/** Determine whether the given value satisfies the schema */
export function isValid<const T extends Schema>(value: unknown, schema: T): value is Infer<T>
export function isValid<const T extends Schema, const Z extends Schema>(
  value: unknown,
  schema: T,
  rootSchema: Z
): value is Infer<T>
export function isValid<const T extends Schema, const Z extends Schema>(
  value: unknown,
  schema: T,
  rootSchema?: Z
): value is Infer<T> {
  switch (schema.type) {
    case 'unknown':
    case 'any':
      return true
    case 'never':
      return false
    case 'void':
      return value === void 0
    case 'null':
      return value === null
    case 'undefined':
      return value === void 0
    case 'boolean':
      return typeof value === 'boolean'
    case 'number':
      return typeof value === 'number'
    case 'bigint':
      return typeof value === 'bigint'
    case 'string':
      return typeof value === 'string'
    case 'symbol':
      return typeof value === 'symbol'
    case 'literal':
      return value === schema.value
    case 'Array':
      return Array.isArray(value) && value.every((v) => isValid(v, schema.value, rootSchema ?? schema))
    case 'NonEmptyArray':
      return (
        Array.isArray(value) && value.length > 0 && value.every((v) => isValid(v, schema.value, rootSchema ?? schema))
      )
    case 'recursive':
      return isValid(value, schema.value)
    case 'union':
      return schema.parts.some((part) => isValid(value, part, rootSchema ?? schema))
    case 'intersection':
      return schema.parts.every((part) => isValid(value, part, rootSchema ?? schema))
    case 'tuple':
      return (
        Array.isArray(value) &&
        value.length === schema.parts.length &&
        value.every((element, i) => isValid(element, schema.parts[i]!, rootSchema ?? schema))
      )
    case 'object':
      if (typeof value !== 'object' || value === null) return false

      return (
        entriesOf(schema.required).every(
          ([key, subSchema]) => key in value && isValid((value as any)[key], subSchema, rootSchema ?? schema)
        ) &&
        entriesOf(schema.optional).every(
          ([key, subSchema]) => !(key in value) || isValid((value as any)[key], subSchema, rootSchema ?? schema)
        )
      )
    case 'Record':
      if (typeof value !== 'object' || value === null) return false

      const isKeyValid = Object.keys(value).every((stringKey) => {
        const numberKey = Number(stringKey)
        if (!Number.isNaN(numberKey) && isValid(numberKey, schema.key, rootSchema ?? schema)) {
          return true
        }
        return isValid(stringKey, schema.key, rootSchema ?? schema)
      })
      return isKeyValid && Object.values(value).every((v) => isValid(v, schema.value, rootSchema ?? schema))
    case 'recursion':
      return isValid(value, rootSchema ?? schema, rootSchema ?? schema)
    default:
      assertNeverType(schema)
  }
}
