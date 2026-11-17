'use client'

import { AvailabilityMark } from '@/composites/shell/account/AvailabilityMark'
import { useAvailability } from '@/core/hooks/data/system/useAvailability'
import { AVAILABILITY_CHOICES, AVAILABILITY_COPY } from '@/declarations/system/availability'
import { AVAILABILITY_PICKER as STYLES } from '@/declarations/ui/blocks'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

/**
 * Online, offline or do not disturb, shared by the rail and Play
 * @param {Object} props - Picker
 * @param {string} [props.optionClassName] - Row style
 * @param {() => void} [props.onChosen] - Called once a pick settled
 * @return {JSX.Element | null}
 */

export const AvailabilityPicker = ({
  optionClassName,
  onChosen,
}: {
  optionClassName?: string
  onChosen?: () => void
}) => {
  const { session } = useAuthContext()
  const { isSaving, choose } = useAvailability()

  if (!session) return null

  return (
    <div role="radiogroup" aria-label={AVAILABILITY_COPY.title} className={STYLES.list}>
      {AVAILABILITY_CHOICES.map((choice) => {
        const isActive = session.availability === choice.value

        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={isSaving}
            onClick={() => (isActive ? onChosen?.() : void choose(choice.value).then(onChosen))}
            className={cn(optionClassName ?? STYLES.option, isActive && STYLES.optionActive)}
          >
            <AvailabilityMark value={choice.value} className={STYLES.mark} />
            <span className={STYLES.text}>
              {choice.label}
              <span className={STYLES.note}>{choice.note}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
