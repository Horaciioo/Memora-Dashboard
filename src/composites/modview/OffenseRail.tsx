'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ViewerPicker } from '@/composites/modview/ViewerPicker'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { nextRung, thirdRung, writeRungCommand } from '@/core/lib/modview/commands'
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
  // Viewers the field offers
  chatters: Chatter[]
  onPrefill: (offense: SanctionOffenseCard, rung: number, chatter: Chatter) => void
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
  // Writes the command of a rung, none until a viewer is chosen
  onUse: ((rung: number) => void) | null
}

// Numbered ladder
const LadderRungs = ({ rungs, applied, next, onUse }: RungListProps) => (
  <ol className={MODVIEW_RAIL.ladder}>
    {rungs.map((rung, index) => (
      <li key={rung.id} className={MODVIEW_RAIL.step}>
        {index < rungs.length - 1 && <span className={MODVIEW_RAIL.line} aria-hidden="true" />}
        <span className={cn(MODVIEW_RAIL.number, index === next && MODVIEW_RAIL.numberNext)}>
          {index + 1}
        </span>
        <div
          className={cn(
            MODVIEW_RAIL.stepBody,
            onUse && MODVIEW_RAIL.stepButton,
            applied.includes(index) && MODVIEW_RAIL.stepDone
          )}
          role={onUse ? 'button' : undefined}
          tabIndex={onUse ? 0 : undefined}
          onClick={onUse ? () => onUse(index) : undefined}
          onKeyDown={
            onUse
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') onUse(index)
                }
              : undefined
          }
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

export const OffenseRail = ({
  offense,
  target,
  applied,
  chatters,
  onPrefill,
  onClose,
}: OffenseRailProps) => {
  const [chosen, setChosen] = useState<Chatter | null>(null)
  const copy = useCopy(MODVIEW_PANEL_COPY.copied)
  const aimed = chosen ?? target

  // Writes the line in the box and keeps it on the clipboard
  const use = (rung: number) => {
    const step = offense.rungs[rung]
    if (!aimed || !step) return
    onPrefill(offense, rung, aimed)
    const line = writeRungCommand(step, aimed.login, offense.name)
    if (line) void copy(line).catch(() => undefined)
  }

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
        <ViewerPicker chatters={chatters} value={aimed} onPick={setChosen} />
        <LadderRungs
          rungs={offense.rungs}
          applied={applied}
          next={aimed ? next : null}
          onUse={aimed ? use : null}
        />
      </div>

      {aimed && next !== null && (
        <footer className={MODVIEW_RAIL.foot}>
          <Button variant="primary" onClick={() => use(next)}>
            {applied.length === 0
              ? MODVIEW_PANEL_COPY.prefill.replace('{name}', aimed.name)
              : MODVIEW_PANEL_COPY.next}
          </Button>
          {third !== null && third !== next && (
            <Button variant="secondary" onClick={() => use(third)}>
              {MODVIEW_PANEL_COPY.third}
            </Button>
          )}
        </footer>
      )}
    </aside>
  )
}
