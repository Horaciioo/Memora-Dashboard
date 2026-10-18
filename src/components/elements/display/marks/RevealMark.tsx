import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import type { Tone } from '@/declarations/ui/theme'
import { REVEAL_MARK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RevealMarkProps {
  icon: IconName
  tone: Tone
  label: string
}

/**
 * Glyph whose words unfold on hover
 * @param {IconName} icon - Glyph key
 * @param {Tone} tone - Colour of glyph and words
 * @param {string} label - Words revealed
 * @return {JSX.Element}
 */

export const RevealMark = ({ icon, tone, label }: RevealMarkProps) => {
  const Icon = ICONS[icon]

  return (
    <span tabIndex={0} className={cn(REVEAL_MARK.root, TONES[tone].text)}>
      <Icon className={REVEAL_MARK.glyph} aria-hidden="true" />
      <span className={REVEAL_MARK.track}>
        <span className={REVEAL_MARK.text}>{label}</span>
      </span>
    </span>
  )
}
