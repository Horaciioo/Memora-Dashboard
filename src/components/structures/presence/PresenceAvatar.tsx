'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import { PRESENCE_COPY, PRESENCE_STATUS_COPY } from '@/declarations/system/presence'
import { PRESENCE_STYLES } from '@/declarations/ui/variants'
import type { PresenceMember } from '@/types/presence'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatSince } from '@/utils/format/dates'

export interface PresenceAvatarProps {
  member: PresenceMember
  isLive: boolean
  // Where they are, in words
  position: string | null
  onJump?: (place: string) => void
}

// Idle wording, elapsed after a minute
const statusOf = (member: PresenceMember): string =>
  member.status === 'idle' && Date.now() - member.seenAt >= MINUTE_MS
    ? formatSince(new Date(member.seenAt))
    : PRESENCE_STATUS_COPY[member.status]

/**
 * One collaborator: portrait, status by shade, position on hover
 * @param {PresenceAvatarProps} props - Member and gestures
 * @return {JSX.Element}
 */

export const PresenceAvatar = ({ member, isLive, position, onJump }: PresenceAvatarProps) => {
  const shade = isLive ? PRESENCE_STYLES[member.status] : PRESENCE_STYLES.uncertain
  const label = [member.name, isLive ? statusOf(member) : PRESENCE_COPY.uncertain, position]
    .filter(Boolean)
    .join(PRESENCE_COPY.separator)
  const { place } = member
  const canJump = Boolean(onJump && place && position && member.status !== 'left')
  const portrait = (
    <Avatar
      name={member.name}
      src={member.image}
      size="xs"
      title=""
      className={PRESENCE_STYLES.avatar}
    />
  )

  return (
    <Tip label={label} floating below>
      {canJump && place ? (
        <button
          type="button"
          aria-label={PRESENCE_COPY.jump.replace('{name}', member.name)}
          className={cn(PRESENCE_STYLES.seat, PRESENCE_STYLES.seatJump, shade)}
          onClick={() => onJump?.(place)}
        >
          {portrait}
        </button>
      ) : (
        <span aria-label={label} className={cn(PRESENCE_STYLES.seat, shade)}>
          {portrait}
        </span>
      )}
    </Tip>
  )
}
