import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { nextRung } from '@/core/lib/modview/commands'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODVIEW_DOSSIER } from '@/declarations/ui/variants'
import { MODVIEW_DOSSIER_COPY as COPY } from '@/declarations/modview/watch'
import type { SanctionOffenseCard } from '@/types/sanctions'
import type { Chatter } from '@/types/modview'
import { cn } from '@/utils/classnames'
import type { DossierLadder } from './DossierLadders'

export interface DossierPositionProps {
  ladders: DossierLadder[]
  chatter: Chatter
  onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
}

/**
 * Viewer position on each ladder
 * @param {DossierPositionProps} props - Climbed ladders
 * @return {JSX.Element}
 */

export const DossierPosition = ({ ladders, chatter, onPrefill }: DossierPositionProps) => (
  <div className={MODVIEW_DOSSIER.section}>
    <div className={MODVIEW_DOSSIER.head}>
      <h4 className={MODVIEW_DOSSIER.label}>{COPY.positionTitle}</h4>
      <span className={MODVIEW_DOSSIER.note}>
        {COPY.window.replace('{days}', String(LIVE_SETTINGS.dossierWindowDays))}
      </span>
    </div>
    {ladders.length === 0 ? (
      <EmptyState compact figure="moderation" title={COPY.ladderEmpty} />
    ) : (
      <div className={MODVIEW_DOSSIER.box}>
        {ladders.map(({ offense, applied }) => {
          const reached = Math.max(...applied)
          const next = nextRung(applied, offense.rungs.length)
          const isLast = next === null || next === reached
          const measure =
            next === null ? null : offense.rungs[next]?.measures.map((m) => m.name).join(' + ')
          const label = next === null ? '' : COPY.prepare.replace('{n}', String(next + 1))

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
                    aria-label={label}
                    title={label}
                    onClick={() => onPrefill(offense, next, chatter)}
                  />
                )}
              </div>
            </article>
          )
        })}
      </div>
    )}
  </div>
)
