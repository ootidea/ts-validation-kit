import { describe, expect, test } from 'vitest'
import * as z from './index'

describe('isValid function', () => {
  test('literal types', () => {
    expect(z.isValid(z.literal(1), 1)).toBe(true)
    expect(z.isValid(z.literal(1), 2)).toBe(false)
  })
  test('primitive types', () => {
    expect(z.isValid(z.boolean, false)).toBe(true)
    expect(z.isValid(z.boolean, 0)).toBe(false)
    expect(z.isValid(z.number, 1)).toBe(true)
    expect(z.isValid(z.number, 'a')).toBe(false)
    expect(z.isValid(z.string, 'a')).toBe(true)
    expect(z.isValid(z.string, [])).toBe(false)
    expect(z.isValid(z.object, {})).toBe(true)
    expect(z.isValid(z.object, 1)).toBe(false)
  })
  test('union types', () => {
    expect(z.isValid(z.union(z.number, z.string), 1)).toBe(true)
    expect(z.isValid(z.union(z.number, z.string), 'a')).toBe(true)
    expect(z.isValid(z.union(z.number, z.string), true)).toBe(false)
  })
  test('array types', () => {
    expect(z.isValid(z.Array(z.number), [1, 2, 3])).toBe(true)
    expect(z.isValid(z.Array(z.number), [1, 'a', 3])).toBe(false)
    expect(z.isValid(z.Array(z.number), [])).toBe(true)
  })
  test('object types with required properties', () => {
    expect(z.isValid(z.object({ a: z.number }), { a: 1 })).toBe(true)
    expect(z.isValid(z.object({ a: z.number }), {})).toBe(false)
    expect(z.isValid(z.object({ a: z.number }), { a: 'a' })).toBe(false)
  })
  test('object types with optional properties', () => {
    expect(z.isValid(z.object({ a: z.optional(z.number) }), { a: 1 })).toBe(true)
    expect(z.isValid(z.object({ a: z.optional(z.number) }), {})).toBe(true)
    expect(z.isValid(z.object({ a: z.optional(z.number) }), { a: 'a' })).toBe(false)
  })
  test('record types', () => {
    expect(z.isValid(z.Record(z.string, z.number), { a: 1, b: 2 })).toBe(true)
    expect(z.isValid(z.Record(z.string, z.number), { a: 1, b: 'a' })).toBe(false)
    expect(z.isValid(z.Record(z.string, z.number), {})).toBe(true)
    expect(z.isValid(z.Record(z.string, z.number), { 1: true })).toBe(false)

    expect(z.isValid(z.Record(z.literal('a'), z.number), { a: 1 })).toBe(true)
    expect(z.isValid(z.Record(z.literal('a'), z.number), { b: 2 })).toBe(false)
  })
  test('recursive types', () => {
    const TreeSchema = z.object({
      value: z.unknown,
      children: z.Array(z.recursive(() => TreeSchema)),
    })
    const validTree = { value: 1, children: [{ value: 2, children: [] }] }
    expect(z.isValid(TreeSchema, validTree)).toBe(true)
  })
})
