import type { IconName } from '@/declarations/ui/icons'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_EMPTY } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayEmptyProps {
  children: string
  icon?: IconName
  // Inside a card that already is a box
  isCompact?: boolean
}

/**
 * Empty state of a Play box: glyph over one sentence
 * @param {PlayEmptyProps} props - Sentence, glyph, density
 * @return {JSX.Element}
 */

export const PlayEmpty = ({ children, icon = 'playStar', isCompact }: PlayEmptyProps) => {
  const Icon = ICONS[icon]

  return (
    <div className={cn(PLAY_EMPTY.root, isCompact && PLAY_EMPTY.compact)} role="status">
      <span className={PLAY_EMPTY.icon}>
        <Icon className={PLAY_EMPTY.glyph} aria-hidden="true" />
      </span>
      <p className={PLAY_EMPTY.text}>{children}</p>
    </div>
  )
}
