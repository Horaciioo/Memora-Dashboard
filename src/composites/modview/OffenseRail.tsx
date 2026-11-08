'use client'

import { Button } from '@/components/elements/actions/Button'
import { nextRung, thirdRung } from '@/core/lib/modview/commands'
import { MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import { measureTag } from '@/declarations/modview/suggestions'
import { MODVIEW_RAIL, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionRungView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

export interface OffenseRailProps {
  offense: SanctionOffenseCard
  target: Chatter | null
  // Rungs already applied to the picked viewer
  applied: number[]
  onPrefill: (offense: SanctionOffenseCard, rung: number) => void
  onClose: () => void
}

interface RungTagsProps {
  rung: SanctionRungView
  className?: string
}

// Measures of one rung
const RungTags = ({ rung, className }: RungTagsProps) => (
  <p className={className ?? MODVIEW_RAIL.tags}>
    {rung.measures.map((measure) => (
      <span key={measure.id} className={MODVIEW_VERDICT[measure.kind]?.text}>
        {measureTag(measure)}
      </span>
    ))}
  </p>
)

interface RungListProps {
  rungs: SanctionRungView[]
  applied: number[]
  next: number | null
}

// Numbered ladder
const LadderRungs = ({ rungs, applied, next }: RungListProps) => (
  <ol className={MODVIEW_RAIL.ladder}>
    {rungs.map((rung, index) => (
      <li key={rung.id} className={MODVIEW_RAIL.step}>
        {index < rungs.length - 1 && <span className={MODVIEW_RAIL.line} aria-hidden="true" />}
        <span className={cn(MODVIEW_RAIL.number, index === next && MODVIEW_RAIL.numberNext)}>
          {index + 1}
        </span>
        <div
          className={cn(MODVIEW_RAIL.stepBody, applied.includes(index) && MODVIEW_RAIL.stepDone)}
        >
          <RungTags rung={rung} />
          {rung.condition && <p className={MODVIEW_RAIL.condition}>{rung.condition}</p>}
        </div>
      </li>
    ))}
  </ol>
)

/**
 * Rail showing one offence ladder
 * @param {OffenseRailProps} props - Rail props
 * @return {JSX.Element}
 */

export const OffenseRail = ({ offense, target, applied, onPrefill, onClose }: OffenseRailProps) => {
  const next = nextRung(applied, offense.rungs.length)
  const third = thirdRung(offense.rungs.length)

  return (
    <aside className={MODVIEW_RAIL.root} aria-label={offense.name}>
      <header className={MODVIEW_RAIL.head}>
        <h4 className={MODVIEW_RAIL.title}>{offense.name}</h4>
        <Button
          variant="icon"
          icon="close"
          aria-label={MODVIEW_PANEL_COPY.closeRail}
          onClick={onClose}
        />
      </header>

      <div className={MODVIEW_RAIL.body}>
        <LadderRungs rungs={offense.rungs} applied={applied} next={target ? next : null} />
        {!target && <p className={MODVIEW_RAIL.hint}>{MODVIEW_PANEL_COPY.pickTarget}</p>}
      </div>

      {target && next !== null && (
        <footer className={MODVIEW_RAIL.foot}>
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
        </footer>
      )}
    </aside>
  )
}
