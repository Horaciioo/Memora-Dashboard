import type { BranchNode, ExerciseBlock } from '@/declarations/academy/curriculum/types'

type BranchingBlock = Extract<ExerciseBlock, { kind: 'branching' }>

/**
 * Where a choice game stands
 * @typedef {Object} BranchWalk
 * @property {BranchNode[]} path - Nodes reached
 * @property {BranchNode | null} ending - Leaf reached
 */

export interface BranchWalk {
  path: BranchNode[]
  ending: BranchNode | null
}

/**
 * Follow the picks of a choice game from its root
 * @param {BranchingBlock} block - Choice game
 * @param {Record<string, unknown>} picks - Option picked per node
 * @return {BranchWalk} - Path and ending
 */

export const walkBranches = (block: BranchingBlock, picks: Record<string, unknown>): BranchWalk => {
  const nodes = new Map(block.nodes.map((node) => [node.key, node]))
  const path: BranchNode[] = []
  let node = nodes.get(block.root)

  // Guarded against a loop in the declaration
  while (node && !path.includes(node)) {
    path.push(node)
    if (node.ending) return { path, ending: node }

    const picked = node.options?.find((option) => option.key === picks[node!.key])
    node = picked ? nodes.get(picked.next) : undefined
  }

  return { path, ending: null }
}
