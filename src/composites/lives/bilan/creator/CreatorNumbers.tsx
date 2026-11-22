import type { BilanFigure, BilanFigureId } from '@/core/lib/lives/bilanFigures'
import { CREATOR_BILAN } from '@/declarations/ui/variants'

export interface CreatorNumbersProps {
  figures: BilanFigure[]
}

// The six figures a creator reads
const NUMBERS: BilanFigureId[] = ['duration', 'peak', 'average', 'actions', 'per1000', 'targets']

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
      <div className={CREATOR_BILAN.numbersGrid}>
        {NUMBERS.flatMap((id) => {
          const figure = byId.get(id)

          return figure
            ? [
                <div key={id} className={CREATOR_BILAN.number}>
                  <span className={CREATOR_BILAN.numberValue}>{say(figure.value)}</span>
                  <span className={CREATOR_BILAN.numberLabel}>{figure.label}</span>
                </div>,
              ]
            : []
        })}
      </div>
    </div>
  )
}
