'use client'

import { Button } from '@/components/elements/actions/Button'
import { nextRung, thirdRung } from '@/core/lib/modview/commands'
import { MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import { MODVIEW_SANCTIONS } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionRungView } from '@/types/sanctions'

export interface OffenseRailProps {
  offense: SanctionOffenseCard
  target: Chatter | null
  // Rungs already applied to the picked viewer
  applied: number[]
  onPrefill: (offense: SanctionOffenseCard, rung: number) => void
  onClose: () => void
}

/**
 * One rung read as text
 * @param {SanctionRungView} rung - Rung
 * @return {string} - Measures then condition
 */

const rungText = (rung: SanctionRungView): string =>
  [rung.measures.map((measure) => measure.name).join(' + '), rung.condition]
    .filter(Boolean)
    .join(', ')

/**
 * Rail on the right showing the rungs of one offence
 * @param {OffenseRailProps} props - Rail props
 * @return {JSX.Element}
 */

export const OffenseRail = ({ offense, target, applied, onPrefill, onClose }: OffenseRailProps) => {
  const next = nextRung(applied, offense.rungs.length)
  const third = thirdRung(offense.rungs.length)

  return (
    <aside className={MODVIEW_SANCTIONS.rail} aria-label={offense.name}>
      <header className={MODVIEW_SANCTIONS.railHead}>
        <h4 className={MODVIEW_SANCTIONS.offenseName}>{offense.name}</h4>
        <Button
          variant="icon"
          icon="close"
          aria-label={MODVIEW_PANEL_COPY.closeRail}
          onClick={onClose}
        />
      </header>

      {offense.rungs.map((rung, index) => (
        <p
          key={rung.id}
          className={
            applied.includes(index)
              ? MODVIEW_SANCTIONS.rungDone
              : target && index === next
                ? MODVIEW_SANCTIONS.rungNext
                : MODVIEW_SANCTIONS.rung
          }
        >
          {`${MODVIEW_PANEL_COPY.rung.replace('{n}', String(index + 1))} : ${rungText(rung)}`}
        </p>
      ))}

      {!target && <p className={MODVIEW_SANCTIONS.hint}>{MODVIEW_PANEL_COPY.pickTarget}</p>}

      {target && next !== null && (
        <div className={MODVIEW_SANCTIONS.actions}>
          <Button variant="primary" onClick={() => onPrefill(offense, next)}>
            {applied.length === 0
              ? MODVIEW_PANEL_COPY.prefill.replace('{name}', target.name)
              : MODVIEW_PANEL_COPY.next}
          </Button>
          {third !== null && third !== next && (
            <Button variant="secondary" onClick={() => onPrefill(offense, third)}>
              {MODVIEW_PANEL_COPY.third}
            </Button>
          )}
        </div>
      )}
    </aside>
  )
}
