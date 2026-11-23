'use client'

import { useWritten } from '@/core/hooks/interaction/scenes/useWritten'
import { sliceWritten } from '@/core/lib/assistant/scenarios/written'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface WrittenListProps {
  items: string[]
}

/**
 * Points Memora lists, written one after the other, letter by letter
 * @param {string[]} items - Points listed
 * @return {JSX.Element}
 */

export const WrittenList = ({ items }: WrittenListProps) => {
  const written = useWritten(items.reduce((total, item) => total + item.length, 0))
  const shown = sliceWritten(items, written)

  return (
    <ul className={ASSISTANT_STYLES.items}>
      {items.map((item, index) =>
        shown[index] ? (
          <li key={item}>
            <span className={ASSISTANT_STYLES.item}>{shown[index]}</span>
          </li>
        ) : null
      )}
    </ul>
  )
}
