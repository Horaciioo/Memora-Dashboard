'use client'

import { Tip } from '@/components/elements/feedback/Tip'
import { PresenceAvatar } from '@/components/structures/presence/PresenceAvatar'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import { ICONS } from '@/declarations/ui/icons'
import { AVATAR_STYLES, PRESENCE_STYLES } from '@/declarations/ui/variants'
import type { PresenceMember } from '@/types/presence'
import { cn } from '@/utils/classnames'

export interface PresenceStackProps {
  members: PresenceMember[]
  isLive: boolean
  isDown: boolean
  // Place in words, null when unknown
  describe?: (place: string) => string | null
  onJump?: (place: string) => void
}

/**
 * Stacked portraits of who else is here, quiet when alone
 * @param {PresenceStackProps} props - Members, socket state, gestures
 * @return {JSX.Element | null}
 */

export const PresenceStack = ({
  members,
  isLive,
  isDown,
  describe,
  onJump,
}: PresenceStackProps) => {
  const DownIcon = ICONS.unsynced

  // Alone: nothing, or the lost link
  if (!members.length) {
    return isDown ? (
      <Tip label={PRESENCE_COPY.down} floating below>
        <span role="status" aria-label={PRESENCE_COPY.down} className={PRESENCE_STYLES.down}>
          <DownIcon className={PRESENCE_STYLES.downGlyph} aria-hidden="true" />
        </span>
      </Tip>
    ) : null
  }

  const shown = members.slice(0, REALTIME_SETTINGS.presenceShown)
  const hidden = members.slice(shown.length)

  return (
    <div role="group" aria-label={PRESENCE_COPY.label} className={PRESENCE_STYLES.stack}>
      {shown.map((member) => (
        <PresenceAvatar
          key={member.accountId}
          member={member}
          isLive={isLive}
          position={member.place && describe ? describe(member.place) : null}
          onJump={onJump}
        />
      ))}
      {hidden.length > 0 && (
        <Tip
          label={hidden.map((member) => member.name).join(PRESENCE_COPY.listSeparator)}
          floating
          below
        >
          <span
            className={cn(
              AVATAR_STYLES.base,
              AVATAR_STYLES.xs,
              PRESENCE_STYLES.avatar,
              PRESENCE_STYLES.more
            )}
          >
            {`+${hidden.length}`}
          </span>
        </Tip>
      )}
    </div>
  )
}
