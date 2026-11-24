'use client'

import { useRecapAgenda } from '@/core/store/recapAgenda'
import { RECAP_CHAPTERS } from '@/declarations/recap/chapters'
import type { RecapChapterName } from '@/declarations/recap/chapters'
import { INTELLIGENCE_COPY } from '@/declarations/intelligence/copy'
import { ICONS } from '@/declarations/ui/icons'
import { INTELLIGENCE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RecapAgendaProps {
  // Memora talks about the subject picked, and only that one
  onPick: (chapter: RecapChapterName) => void
}

/**
 * Subjects of the recap beside the chat
 * @param {(chapter: RecapChapterName) => void} onPick - Opens the sub-talk of a subject
 * @return {JSX.Element | null}
 */

export const RecapAgenda = ({ onPick }: RecapAgendaProps) => {
  const { chapters, done, current, isPoint } = useRecapAgenda()
  const CheckGlyph = ICONS.check
  if (chapters.length === 0) return null

  return (
    <aside className={INTELLIGENCE_STYLES.agenda} aria-label={INTELLIGENCE_COPY.agendaTitle}>
      <h2 className={INTELLIGENCE_STYLES.agendaTitle}>{INTELLIGENCE_COPY.agendaTitle}</h2>
      <ul className={INTELLIGENCE_STYLES.agendaList}>
        {chapters.map((chapter) => {
          const isDone = done.includes(chapter)

          return (
            <li key={chapter}>
              <button
                type="button"
                aria-current={current === chapter || undefined}
                disabled={isPoint}
                onClick={() => onPick(chapter)}
                className={cn(
                  INTELLIGENCE_STYLES.agendaItem,
                  current === chapter && INTELLIGENCE_STYLES.agendaItemCurrent,
                  isDone && INTELLIGENCE_STYLES.agendaItemDone
                )}
              >
                <span className="min-w-0 truncate">{RECAP_CHAPTERS[chapter]}</span>
                {isDone && (
                  <CheckGlyph className={INTELLIGENCE_STYLES.agendaCheck} aria-hidden="true" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
