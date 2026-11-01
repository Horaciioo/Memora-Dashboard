import { SETTINGS_TIPS } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'

export interface TipListProps {
  items: readonly string[]
}

/**
 * Short checked list of habits or kept data
 * @param {string[]} items - Lines of the list
 * @return {JSX.Element}
 */

export const TipList = ({ items }: TipListProps) => {
  const Mark = ICONS.confirm

  return (
    <ul className={SETTINGS_TIPS.list}>
      {items.map((item) => (
        <li key={item} className={SETTINGS_TIPS.item}>
          <Mark className={SETTINGS_TIPS.mark} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}
