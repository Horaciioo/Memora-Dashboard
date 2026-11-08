'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { useAvatar } from '@/core/hooks/data/lives/useAvatars'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'

/**
 * Round portrait of a chatter
 * @param {Chatter} chatter - Chatter
 * @param {string} [className] - Size classes
 * @return {JSX.Element}
 */

export const ChatterAvatar = ({
  chatter,
  className = MODVIEW_CHAT.avatar,
}: {
  chatter: Chatter
  className?: string
}) => (
  <Avatar
    name={chatter.name}
    src={useAvatar(chatter.id)}
    size="xs"
    title=""
    className={className}
  />
)
