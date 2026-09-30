import { OptionMark } from '@/components/elements/forms/OptionMark'
import { ICONS } from '@/declarations/ui/icons'
import { SELECT_MENU_STYLES } from '@/declarations/ui/variants'
import type { AvatarSize } from '@/declarations/ui/variants'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface OptionLeadProps {
  option: FieldOption
  mark?: OptionMarkKind
  isSelected: boolean
  size?: AvatarSize
}

/**
 * Start of an option row, the check standing where the mark would
 * @param {FieldOption} option - Option drawn
 * @param {OptionMarkKind} [mark] - Mark shape of the field
 * @param {boolean} isSelected - Option is chosen
 * @param {AvatarSize} [size] - Portrait size
 * @return {JSX.Element}
 */

export const OptionLead = ({ option, mark, isSelected, size = 'xs' }: OptionLeadProps) => {
  const CheckIcon = ICONS.picked

  // Only a portrait needs a wider cell than a glyph
  const cell =
    mark === 'avatar'
      ? size === 'xs'
        ? SELECT_MENU_STYLES.leadPortrait
        : SELECT_MENU_STYLES.leadPortraitLarge
      : SELECT_MENU_STYLES.leadGlyph

  return (
    <span className={cn(SELECT_MENU_STYLES.lead, cell)} aria-hidden="true">
      {isSelected ? (
        <CheckIcon className={SELECT_MENU_STYLES.check} />
      ) : (
        mark && option.value !== '' && <OptionMark mark={mark} option={option} size={size} />
      )}
    </span>
  )
}
