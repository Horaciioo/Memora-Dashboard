import type { CSSProperties } from 'react'

import { STAT_TONES } from '@/composites/lives/bilan/StatCard'
import type { StatTone } from '@/composites/lives/bilan/StatCard'
import type { BilanFigure, BilanFigureId } from '@/core/lib/lives/bilanFigures'
import { CREATOR_BILAN } from '@/declarations/ui/variants'

export interface CreatorNumbersProps {
  figures: BilanFigure[]
}

// The six figures a creator reads, each in its colour
const NUMBERS: { id: BilanFigureId; tone: StatTone }[] = [
  { id: 'duration', tone: 'brand' },
  { id: 'peak', tone: 'mauve' },
  { id: 'average', tone: 'info' },
  { id: 'actions', tone: 'danger' },
  { id: 'per1000', tone: 'success' },
  { id: 'targets', tone: 'caution' },
]

// Thousands read with a space
const say = (value: string): string =>
  /^\d{4,}$/.test(value) ? Number(value).toLocaleString('fr-FR') : value

/**
 * By the numbers: six giant figures, labels kept short
 * @param {BilanFigure[]} figures - Figures of the bilan
 * @return {JSX.Element}
 */

export const CreatorNumbers = ({ figures }: CreatorNumbersProps) => {
  const byId = new Map(figures.map((figure) => [figure.id, figure]))

  return (
    <div className={CREATOR_BILAN.numbers}>
      {NUMBERS.flatMap(({ id, tone }) => {
        const figure = byId.get(id)

        return figure
          ? [
              <div
                key={id}
                className={CREATOR_BILAN.number}
                style={{ '--tone': STAT_TONES[tone] } as CSSProperties}
              >
                <span className={CREATOR_BILAN.numberValue}>{say(figure.value)}</span>
                <span className={CREATOR_BILAN.numberLabel}>{figure.label}</span>
              </div>,
            ]
          : []
      })}
    </div>
  )
}
