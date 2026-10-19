'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { nextRung } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { MODVIEW_HISTORY_COPY } from '@/declarations/modview/copy'
import { MODVIEW_DOSSIER_COPY as COPY } from '@/declarations/modview/watch'
import { Button } from '@/components/elements/actions/Button'
import { MODVIEW_DOSSIER, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import type { ViewerSanction } from '@/types/lives'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'
import { formatDuration } from '@/utils/format/modview'

export interface ViewerDossierProps {
  chatter: Chatter
  // Null while loading
  history: ViewerSanction[] | null
  panel: SanctionPanelView | null
  memory: PanelMemory
  onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
}

/**
 * Record of a viewer on the creator's channel: where they stand on each ladder, what they got
 * @param {ViewerDossierProps} props - Dossier props
 * @return {JSX.Element}
 */

export const ViewerDossier = ({
  chatter,
  history,
  panel,
  memory,
  onPrefill,
}: ViewerDossierProps) => {
  // Ladders the viewer has climbed
  const ladders = Object.entries(memory[chatter.id] ?? {})
    .flatMap(([offenseId, applied]) => {
      const offense = panel?.offenses.find((entry) => entry.id === offenseId)

      return offense && applied.length > 0 ? [{ offense, applied }] : []
    })
    .sort((left, right) => Math.max(...right.applied) - Math.max(...left.applied))

  return (
    <section className={MODVIEW_DOSSIER.root} aria-label={COPY.title}>
      <div className={MODVIEW_DOSSIER.head}>
        <h4 className={MODVIEW_DOSSIER.label}>{COPY.ladderTitle}</h4>
        <span className={MODVIEW_DOSSIER.note}>
          {COPY.window.replace('{days}', String(LIVE_SETTINGS.dossierWindowDays))}
        </span>
      </div>

      {ladders.length === 0 ? (
        <p className={MODVIEW_DOSSIER.empty}>{COPY.ladderEmpty}</p>
      ) : (
        <div className={MODVIEW_DOSSIER.box}>
          {ladders.map(({ offense, applied }) => {
            const reached = Math.max(...applied)
            const next = nextRung(applied, offense.rungs.length)
            const isLast = next === null || next === reached
            const measure =
              next === null ? null : offense.rungs[next]?.measures.map((m) => m.name).join(' + ')

            return (
              <article key={offense.id} className={MODVIEW_DOSSIER.row}>
                <div className={MODVIEW_DOSSIER.rowHead}>
                  <p className={MODVIEW_DOSSIER.rowTitle}>{offense.name}</p>
                  <span className={MODVIEW_DOSSIER.ladderStep}>
                    {COPY.step
                      .replace('{n}', String(reached + 1))
                      .replace('{total}', String(offense.rungs.length))}
                  </span>
                </div>
                <div className={MODVIEW_DOSSIER.dots} aria-hidden="true">
                  {offense.rungs.map((rung, index) => (
                    <span
                      key={rung.id}
                      className={cn(
                        MODVIEW_DOSSIER.dot,
                        index <= reached && MODVIEW_DOSSIER.dotOn,
                        !isLast && index === next && MODVIEW_DOSSIER.dotNext
                      )}
                    />
                  ))}
                </div>
                <div className={MODVIEW_DOSSIER.rowFoot}>
                  <p className={MODVIEW_DOSSIER.next}>
                    {isLast || next === null
                      ? COPY.last
                      : COPY.next.replace('{measure}', measure ?? '')}
                  </p>
                  {!isLast && next !== null && (
                    <Button
                      variant="ghost"
                      icon="chat"
                      aria-label={COPY.prepare.replace('{n}', String(next + 1))}
                      title={COPY.prepare.replace('{n}', String(next + 1))}
                      onClick={() => onPrefill(offense, next, chatter)}
                    />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <h4 className={MODVIEW_DOSSIER.label}>{COPY.historyTitle}</h4>
      {history === null ? (
        <p className={MODVIEW_DOSSIER.empty}>{COPY.loading}</p>
      ) : history.length === 0 ? (
        <p className={MODVIEW_DOSSIER.empty}>{COPY.historyEmpty}</p>
      ) : (
        <div className={MODVIEW_DOSSIER.history}>
          {history.map((row) => (
            <article key={row.id} className={MODVIEW_DOSSIER.row}>
              <div className={MODVIEW_DOSSIER.rowHead}>
                <p className={cn(MODVIEW_DOSSIER.rowKind, MODVIEW_VERDICT[row.kind]?.text)}>
                  <Dotted
                    items={[
                      MODERATION_KINDS[row.kind].label,
                      row.durationSeconds ? formatDuration(row.durationSeconds) : null,
                    ]}
                  />
                </p>
                <time className={MODVIEW_DOSSIER.rowDate} dateTime={row.occurredAt}>
                  {formatDayTime(row.occurredAt)}
                </time>
              </div>
              {row.reason && <p className={MODVIEW_DOSSIER.rowReason}>{row.reason}</p>}
              {row.actorName && (
                <p className={MODVIEW_DOSSIER.rowBy}>
                  {MODVIEW_HISTORY_COPY.by.replace('{name}', row.actorName)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
