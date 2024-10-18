import { Result } from 'result-type-ts'
import { expect, test } from 'vitest'
import * as z from '../index'
import { expectInferredType } from '../utilities'

test('recursive schema', () => {
  const treeSchema = z.object({ value: z.unknown, children: z.Array(z.recursive(() => treeSchema)) })
  type Tree = { value: unknown; children: Tree[] }
  expectInferredType(treeSchema).toBe<Tree>()

  const tree = { value: 1, children: [{ value: 2, children: [] }] }
  expect(z.validate(treeSchema, tree)).toStrictEqual(Result.success(tree))
})
