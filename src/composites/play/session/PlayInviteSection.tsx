'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import type { PlayInviteCandidate } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayInviteSectionProps {
  // Heading, none for a flat result list
  title?: string
  people: PlayInviteCandidate[]
  // Already invited
  sent: string[]
  onSend: (id: string) => void
}

/**
 * Titled list of members, one tap invites
 * @param {PlayInviteSectionProps} props - People and sent invitations
 * @return {JSX.Element | null}
 */

export const PlayInviteSection = ({ title, people, sent, onSend }: PlayInviteSectionProps) => {
  const TickIcon = ICONS.playTick
  const isMobile = useIsMobileShell()
  if (people.length === 0) return null

  return (
    <section className={PLAY_INVITE.section}>
      {title && <h3 className={PLAY_INVITE.sectionTitle}>{title}</h3>}
      <div className={PLAY_INVITE.faces}>
        {people.map((entry) => {
          const isSent = sent.includes(entry.id)

          return (
            <button
              key={entry.id}
              type="button"
              aria-label={`${PLAY_HUB_COPY.inviteTap} ${entry.displayName}`}
              className={cn(PLAY_INVITE.face, isSent && PLAY_INVITE.faceSent)}
              onClick={() => onSend(entry.id)}
            >
              <span className={PLAY_INVITE.faceAvatar}>
                <Avatar
                  name={entry.displayName}
                  src={entry.avatarUrl}
                  size={isMobile ? 'xs' : 'md'}
                />
                {isSent && (
                  <span className={PLAY_INVITE.faceBadge} title={PLAY_HUB_COPY.inviteSent}>
                    <TickIcon className={PLAY_INVITE.stateIcon} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className={PLAY_INVITE.faceName}>{entry.displayName}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
