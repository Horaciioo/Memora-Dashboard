import type { ReactNode } from 'react'

import { CountUp } from '@/components/elements/display/CountUp'
import { DeltaMark } from '@/components/elements/display/DeltaMark'
import type { DeltaSense } from '@/components/elements/display/DeltaMark'
import { SUMMARY_BAR } from '@/declarations/ui/variants'
import { TONES } from '@/declarations/ui/theme'
import type { Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

/**
 * One readout
 * @typedef {Object} SummaryEntry
 * @property {string} key - Identifier
 * @property {string} label - Figure name
 * @property {ReactNode} value - Figure
 * @property {boolean} [countUp] - Animated number
 * @property {string} [hint] - Second line
 * @property {Tone} [tone] - Figure colour
 * @property {Object} [delta] - Change mark
 */

export interface SummaryEntry {
  key: string
  label: string
  value: ReactNode
  countUp?: boolean
  hint?: string
  tone?: Tone
  delta?: { gap: number | null; sense?: DeltaSense; figure?: string }
}

export interface SummaryBarProps {
  entries: SummaryEntry[]
  className?: string
}

/**
 * Figures on one rule
 * @param {SummaryEntry[]} entries - Readouts
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const SummaryBar = ({ entries, className }: SummaryBarProps) => (
  <dl className={cn(SUMMARY_BAR.bar, className)}>
    {entries.map((entry) => (
      <div key={entry.key} className={SUMMARY_BAR.item}>
        <dt className={SUMMARY_BAR.label}>{entry.label}</dt>
        <dd className={SUMMARY_BAR.value}>
          <span className={cn(SUMMARY_BAR.figure, entry.tone && TONES[entry.tone].text)}>
            {entry.countUp && typeof entry.value === 'number' ? (
              <CountUp value={entry.value} />
            ) : (
              entry.value
            )}
          </span>
          {entry.delta && <DeltaMark {...entry.delta} />}
        </dd>
        {entry.hint && <p className={SUMMARY_BAR.hint}>{entry.hint}</p>}
      </div>
    ))}
  </dl>
)
