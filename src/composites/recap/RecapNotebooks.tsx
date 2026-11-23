'use client'

import { RECAP_COPY } from '@/declarations/recap/copy'
import { RECAP_NOTEBOOKS } from '@/declarations/ui/variants'
import type { ScenarioId } from '@/types/scenario'
import { cn } from '@/utils/classnames'

export interface RecapNotebooksProps {
  // Memora leads a talk, the recap or the absences
  tell: (id: ScenarioId, entry: string, data?: Record<string, string>) => void
}

/**
 * Recap and Absence notebooks, a click makes Memora lead their talk in the chat
 * @param {(id: ScenarioId, entry: string, data?: Record<string, string>) => void} tell - Memora leads a talk
 * @return {JSX.Element}
 */

export const RecapNotebooks = ({ tell }: RecapNotebooksProps) => {
  const books = [
    {
      label: RECAP_COPY.notebookRecap,
      cover: RECAP_NOTEBOOKS.coverRecap,
      open: () => tell('recap', 'recap'),
    },
    {
      label: RECAP_COPY.notebookAbsence,
      cover: RECAP_NOTEBOOKS.coverAbsence,
      open: () => tell('absence', 'offer'),
    },
  ]

  return (
    <div className={RECAP_NOTEBOOKS.row}>
      {books.map((book) => (
        <div key={book.label} className={RECAP_NOTEBOOKS.book}>
          <span
            className={`${RECAP_NOTEBOOKS.sheet} ${RECAP_NOTEBOOKS.sheetFar}`}
            aria-hidden="true"
          />
          <span
            className={`${RECAP_NOTEBOOKS.sheet} ${RECAP_NOTEBOOKS.sheetNear}`}
            aria-hidden="true"
          />
          <button
            type="button"
            className={cn(RECAP_NOTEBOOKS.cover, book.cover)}
            onClick={book.open}
          >
            {book.label}
          </button>
        </div>
      ))}
    </div>
  )
}
