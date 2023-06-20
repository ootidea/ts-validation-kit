import { assert, assertNeverType, entriesOf, isNotUndefined } from 'base-up'
import { Infer } from './inference'
import { ANONYMOUS, Schema } from './schema'

/** @see z.isValid */
export function isValid<const T extends Schema>(
  value: unknown,
  schema: T,
  re: Record<keyof any, Schema> = { [ANONYMOUS]: schema }
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
    case 'class':
      return value instanceof schema.constructor
    case 'Array':
      return Array.isArray(value) && value.every((v) => isValid(v, schema.value, re))
    case 'NonEmptyArray':
      return Array.isArray(value) && value.length > 0 && value.every((v) => isValid(v, schema.value, re))
    case 'recursive':
      return isValid(value, schema.value, { ...re, [schema.key]: schema.value })
    case 'union':
      return schema.parts.some((part) => isValid(value, part, re))
    case 'intersection':
      return schema.parts.every((part) => isValid(value, part, re))
    case 'tuple':
      return (
        Array.isArray(value) &&
        value.length === schema.parts.length &&
        value.every((element, i) => isValid(element, schema.parts[i]!, re))
      )
    case 'object':
      if (typeof value !== 'object' || value === null) return false

      return (
        entriesOf(schema.required).every(
          ([key, subSchema]) => key in value && isValid((value as any)[key], subSchema, re)
        ) &&
        entriesOf(schema.optional).every(
          ([key, subSchema]) => !(key in value) || isValid((value as any)[key], subSchema, re)
        )
      )
    case 'Record':
      if (typeof value !== 'object' || value === null) return false

      const isKeyValid = Object.keys(value).every((stringKey) => {
        const numberKey = Number(stringKey)
        if (!Number.isNaN(numberKey) && isValid(numberKey, schema.key, re)) {
          return true
        }
        return isValid(stringKey, schema.key, re)
      })
      return isKeyValid && Object.values(value).every((v) => isValid(v, schema.value, re))
    case 'recursion':
      const recursionSchema = re[schema.key]
      assert(recursionSchema, isNotUndefined)
      return isValid(value, recursionSchema, re)
    default:
      assertNeverType(schema)
  }
}
