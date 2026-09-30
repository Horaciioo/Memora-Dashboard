import { INFO_HINT } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface InfoHintProps {
  text: string
  className?: string
  // Trigger colours override
  triggerClassName?: string
  // Bubble anchored left, for labels near an edge
  align?: 'center' | 'start'
}

/**
 * Info icon with tooltip
 * @param {string} text - Tooltip line
 * @param {string} [className] - Wrapper classes
 * @param {string} [triggerClassName] - Trigger colours
 * @param {'center' | 'start'} [align] - Bubble anchor
 * @return {JSX.Element}
 */

export const InfoHint = ({
  text,
  className,
  triggerClassName,
  align = 'center',
}: InfoHintProps) => {
  const InfoIcon = ICONS.info

  return (
    <span className={cn(INFO_HINT.wrapper, className)}>
      <button
        type="button"
        className={cn(INFO_HINT.trigger, triggerClassName ?? INFO_HINT.triggerTone)}
        aria-label={text}
      >
        <InfoIcon className={INFO_HINT.icon} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={cn(INFO_HINT.pop, align === 'start' ? INFO_HINT.popStart : INFO_HINT.popCenter)}
      >
        {text}
      </span>
    </span>
  )
}
