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
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number'
    case 'boolean':
      return typeof value === 'boolean'
    case 'bigint':
      return typeof value === 'bigint'
    case 'symbol':
      return typeof value === 'symbol'
    case 'null':
      return value === null
    case 'undefined':
      return value === void 0
    case 'unknown':
    case 'any':
      return true
    case 'never':
      return false
    case 'void':
      return value === void 0
    case 'literal':
      return value === schema.value
    case 'Array':
      return Array.isArray(value) && value.every((v) => isValid(v, schema.value, re))
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
    case 'union':
      return schema.parts.some((part) => isValid(value, part, re))
    case 'intersection':
      return schema.parts.every((part) => isValid(value, part, re))
    case 'refine':
      // @ts-ignore
      return isValid(value, schema.base, re) && schema.predicate(value)
    case 'class':
      return value instanceof schema.constructor
    case 'recursive':
      return isValid(value, schema.value, { ...re, [schema.key]: schema.value })
    case 'recursion':
      const recursionSchema = re[schema.key]
      assert(recursionSchema, isNotUndefined)
      return isValid(value, recursionSchema, re)
    case 'minLengthArray':
      return isValid(value, schema.base, re) && Array.isArray(value) && schema.length <= value.length
    case 'maxLengthArray':
      return isValid(value, schema.base, re) && Array.isArray(value) && value.length <= schema.length
    default:
      assertNeverType(schema)
  }
}
