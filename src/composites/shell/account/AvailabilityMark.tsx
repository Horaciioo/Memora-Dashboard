import { availabilityOf } from '@/declarations/system/availability'
import type { AvailabilityName } from '@/utils/constants/availability'
import { Availabilities } from '@/utils/constants/availability'

/**
 * Shape of an availability: full, empty or barred
 * @param {Object} props - Mark
 * @param {AvailabilityName} props.value - Availability
 * @param {string} [props.className] - Size
 * @return {JSX.Element}
 */

export const AvailabilityMark = ({
  value,
  className,
}: {
  value: AvailabilityName
  className?: string
}) => {
  const { tint } = availabilityOf(value)

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} style={{ color: tint }}>
      {value === Availabilities.Offline ? (
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      ) : (
        <circle cx="8" cy="8" r="7" fill="currentColor" />
      )}
      {value === Availabilities.Dnd && (
        <rect x="4" y="7" width="8" height="2" rx="1" fill="var(--color-surface-raised)" />
      )}
    </svg>
  )
}
