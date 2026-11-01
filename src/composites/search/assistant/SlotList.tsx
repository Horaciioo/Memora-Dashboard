import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import type { AssistantSlot } from '@/types/assistant'

export interface SlotListProps {
  slots: AssistantSlot[]
  // One line under a row
  inline?: boolean
}

/**
 * Parameters Memora understood
 * @param {AssistantSlot[]} slots - Recognised parameters
 * @param {boolean} [inline] - Single line
 * @return {JSX.Element | null}
 */

export const SlotList = ({ slots, inline }: SlotListProps) => {
  if (slots.length === 0) return null

  if (inline) {
    return (
      <span className={ASSISTANT_STYLES.slotsInline}>
        {slots.map((slot) => (
          <span key={slot.key} className={ASSISTANT_STYLES.slotPair}>
            <span className={ASSISTANT_STYLES.slotLabel}>{slot.label}</span>
            <span className={ASSISTANT_STYLES.slotValue}>{slot.value}</span>
          </span>
        ))}
      </span>
    )
  }

  return (
    <dl className={ASSISTANT_STYLES.slots}>
      {slots.map((slot) => (
        <div key={slot.key} className="contents">
          <dt className={ASSISTANT_STYLES.slotLabel}>{slot.label}</dt>
          <dd className={ASSISTANT_STYLES.slotValue}>{slot.value}</dd>
        </div>
      ))}
    </dl>
  )
}
