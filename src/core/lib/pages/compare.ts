import type { PageDocument } from '@/types/pages'

/**
 * How a version differs from today
 * @typedef {Object} BlockComparison
 * @property {number} changed - Blocks edited since
 * @property {number} removed - Blocks gone since
 * @property {number} added - Blocks written since
 */

export interface BlockComparison {
  changed: number
  removed: number
  added: number
}

/**
 * Top blocks by id
 * @param {PageDocument} document - Document
 * @return {Map<string, string>} - Id to serialised block
 */

const blocksOf = (document: PageDocument): Map<string, string> =>
  new Map(
    (document.content ?? []).flatMap((block) => {
      const id = block.attrs?.id

      return typeof id === 'string' ? [[id, JSON.stringify(block)] as const] : []
    })
  )

/**
 * Compare a kept version with the current document, block by block
 * @param {PageDocument} version - Kept version
 * @param {PageDocument} current - Document today
 * @return {BlockComparison} - Differences
 */

export const compareBlocks = (version: PageDocument, current: PageDocument): BlockComparison => {
  const before = blocksOf(version)
  const after = blocksOf(current)
  let changed = 0
  let removed = 0

  for (const [id, block] of before) {
    const now = after.get(id)
    if (now === undefined) removed += 1
    else if (now !== block) changed += 1
  }

  return { changed, removed, added: [...after.keys()].filter((id) => !before.has(id)).length }
}
