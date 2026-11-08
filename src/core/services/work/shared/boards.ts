import 'server-only'
import { prisma } from '@/core/lib/db'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { BoardColumn } from '@/components/structures/data/KanbanBoard'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Read the columns of one board
 * @param {WorkflowScopeName} scope - Board scope
 * @return {Promise<BoardColumn[]>} - Columns in display order
 */

export const boardColumns = async (scope: WorkflowScopeName): Promise<BoardColumn[]> => {
  const rows = await prisma.workflowState.findMany({
    where: { scope },
    orderBy: { position: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    accent: row.accent,
    phase: row.phase,
  }))
}

/**
 * Compute the position of a card dropped inside a column
 * @param {Array<{ id: string, position: number }>} cards - Cards already in the column
 * @param {number} index - Drop index
 * @return {number} - New position
 */

export const positionAt = (cards: { id: string; position: number }[], index: number): number => {
  const step = FORM_SETTINGS.positionStep

  // Dropped above the first card
  if (cards.length === 0) return step
  if (index <= 0) return cards[0].position - step

  // Dropped below the last card
  if (index >= cards.length) return cards[cards.length - 1].position + step

  return Math.floor((cards[index - 1].position + cards[index].position) / 2)
}
