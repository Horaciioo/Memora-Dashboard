import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MODES } from '@/declarations/ui/variants'

/**
 * One titled choice of the chat preferences
 * @param {string} title - Section title
 * @param {readonly T[]} keys - Choices
 * @param {T} value - Choice held
 * @param {(key: T) => string} label - Choice label
 * @param {(key: T) => void} onPick - Pick handler
 * @return {JSX.Element}
 */

export const PreferenceChoices = <T extends string>({
  title,
  keys,
  value,
  label,
  onPick,
}: {
  title: string
  keys: readonly T[]
  value: T
  label: (key: T) => string
  onPick: (key: T) => void
}) => {
  const CheckIcon = ICONS.check

  return (
    <>
      <p className={MODVIEW_MODES.section}>{title}</p>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          role="menuitemradio"
          aria-checked={value === key}
          className={MODVIEW_MODES.row}
          onClick={() => onPick(key)}
        >
          <span className={MODVIEW_MODES.rowLabel}>{label(key)}</span>
          {value === key && <CheckIcon className={MODVIEW_MODES.rowIcon} aria-hidden="true" />}
        </button>
      ))}
    </>
  )
}
