import { heatOf } from '@/core/lib/academy/sanctionHeat'
import { COURSE_HEAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SanctionChipProps {
  measure: string
}

/**
 * One measure of a sanction, coloured from cold to hot by how heavy it is
 * @param {SanctionChipProps} props - Name of the measure
 * @return {JSX.Element}
 */

export const SanctionChip = ({ measure }: SanctionChipProps) => {
  const heat = heatOf(measure)

  return (
    <span
      className={cn(COURSE_HEAT.chip, heat === null ? COURSE_HEAT.none : COURSE_HEAT.steps[heat])}
    >
      {measure}
    </span>
  )
}
