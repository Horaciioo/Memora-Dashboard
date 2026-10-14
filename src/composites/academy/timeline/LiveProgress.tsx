import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { PARKOUR_STEP } from '@/declarations/ui/variants'

/**
 * Lives a junior was present on out of those the period asks
 * @param {Object} props - Component props
 * @param {number} props.count - Lives counted
 * @param {number} props.needed - Lives before the check-in
 * @return {JSX.Element}
 */

export const LiveProgress = ({ count, needed }: { count: number; needed: number }) => (
  <div className={PARKOUR_STEP.lives}>
    <span className={PARKOUR_STEP.livesValue}>
      {PARKOUR_COPY.livesOf.replace('{count}', String(count)).replace('{needed}', String(needed))}
      <span className={PARKOUR_STEP.hint}>{` ${PARKOUR_COPY.lives}`}</span>
    </span>
  </div>
)
