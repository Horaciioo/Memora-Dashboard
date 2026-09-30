import { Avatar } from '@/components/elements/display/Avatar'
import { RECORD_LABEL } from '@/declarations/ui/variants'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'

export interface CreatorLabelProps {
  name: string
  image?: string | null
  size?: AvatarSize
}

/**
 * Creator shown by portrait and name, never a tag
 * @param {string} name - Creator name
 * @param {string | null} [image] - Portrait URL
 * @param {AvatarSize} [size] - Portrait size
 * @return {JSX.Element}
 */

export const CreatorLabel = ({ name, image, size = 'xs' }: CreatorLabelProps) => (
  <span className={RECORD_LABEL.row}>
    <Avatar name={name} src={image} size={size} />
    <span className={RECORD_LABEL.name}>{name}</span>
  </span>
)

export interface ProjectLabelProps {
  title: string
  emoji?: string | null
}

/**
 * Project shown by glyph and title, never a tag
 * @param {string} title - Project title
 * @param {string | null} [emoji] - Project glyph
 * @return {JSX.Element}
 */

export const ProjectLabel = ({ title, emoji }: ProjectLabelProps) => (
  <span className={RECORD_LABEL.row}>
    {emoji && (
      <span className={RECORD_LABEL.emoji} aria-hidden="true">
        {emoji}
      </span>
    )}
    <span className={RECORD_LABEL.name}>{title}</span>
  </span>
)
