'use client'

import Link from '@/components/elements/navigation/AppLink'

import { RecapWho } from '@/composites/recap/RecapWho'
import { useWritten } from '@/core/hooks/interaction/scenes/useWritten'
import { sliceWritten } from '@/core/lib/assistant/scenarios/written'
import { lineLength, linePieces } from '@/core/lib/recap/lines'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import { RECAP_FIGURES } from '@/declarations/recap/beats'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { TONES } from '@/declarations/ui/theme'
import { RECAP_STYLES } from '@/declarations/ui/variants'
import type { RecapThread } from '@/types/recap'
import { cn } from '@/utils/classnames'
import { formatRelativeDay } from '@/utils/format/time/dates'

export interface RecapLineProps {
  showDay: boolean
  // Letters written before this line starts, none for a line shown whole
  after?: number
  thread: RecapThread
  onNavigate: () => void
}

/**
 * One sentence of the recap, the whole line leads to what it speaks about
 * @param {RecapThread} thread - What moved around one record
 * @param {boolean} showDay - Day written when no title carries it
 * @param {number} [after] - Letters written before this one, the line is written when given
 * @param {() => void} onNavigate - Called when the line is followed
 * @return {JSX.Element}
 */

export const RecapLine = ({ thread, showDay, after, onNavigate }: RecapLineProps) => {
  const beat = thread.beats[0]
  const target = thread.target ? NOTIFICATION_TARGETS.get(thread.target) : null
  const href = target?.route(thread.targetId) ?? null
  const pieces = linePieces(thread)
  // Written letter by letter when told in the chat, whole in the recap itself
  const written = useWritten(lineLength(thread), after ?? 0)
  const visible = sliceWritten(
    pieces.map((piece) => piece.text),
    after === undefined ? Infinity : written
  )

  // A notification names one person, the verb being said for one
  const people = beat.alert ? beat.people.slice(0, 1) : beat.people

  return (
    <p className={RECAP_STYLES.line}>
      {pieces.map((piece, index) => {
        if (piece.kind === 'who') return <RecapWho key={index} people={people} />

        // Letters of this piece already written, the rest waits its turn
        const shown = visible[index]
        if (!shown) return null

        if (piece.kind === 'subject') {
          // The record's name is the link, said in the sentence
          return href ? (
            <Link
              key={index}
              href={href}
              onClick={onNavigate}
              aria-label={RECAP_COPY.openRecord.replace('{subject}', thread.subject ?? '')}
              className={RECAP_STYLES.lineLink}
            >
              {shown}
            </Link>
          ) : (
            <span key={index} className={RECAP_STYLES.lineSubject}>
              {shown}
            </span>
          )
        }

        if (piece.kind === 'figure') {
          const copy = RECAP_FIGURES[piece.key ?? '']

          return (
            <span key={index} className={cn(RECAP_STYLES.lineFigure, TONES[copy.tone].text)}>
              {shown}
            </span>
          )
        }

        return piece.strong ? (
          <strong key={index} className={RECAP_STYLES.lineStrong}>
            {shown}
          </strong>
        ) : (
          shown
        )
      })}{' '}
      <span className={RECAP_STYLES.lineDay} suppressHydrationWarning>
        {beat.alert &&
          beat.count > 1 &&
          `${RECAP_COPY.times.replace('{count}', String(beat.count))} `}
        {showDay && formatRelativeDay(beat.at)}
      </span>
    </p>
  )
}
