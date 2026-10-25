'use client'

import { PlayCurrentGame } from '@/composites/play/brand/PlayCurrentGame'
import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { Button } from '@/components/elements/actions/Button'
import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { BUTTON_STYLES, PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayInviteView, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayInviteRoles } from '@/utils/constants/play'

/**
 * Line of an invitation
 * @param {PlayInviteView} invite - Invitation
 * @return {string} - Sentence
 */

const lineOf = (invite: PlayInviteView): string => {
  if (invite.isEveryone)
    return fillPlayMessage(PLAY_HUB_COPY.inviteEveryone, { name: invite.inviter.name })
  const template =
    invite.role === PlayInviteRoles.Player ? PLAY_HUB_COPY.inviteFrom : PLAY_HUB_COPY.inviteWatch

  return fillPlayMessage(template, { name: invite.inviter.name })
}

/**
 * Feed: the game being played, then invitations joined or declined in place
 * @param {Object} props - Feed
 * @param {PlayPresence | null} props.presence - Game the player sits in
 * @param {PlayInviteView[]} props.invites - Waiting invitations
 * @return {JSX.Element}
 */

export const PlayDockFeed = ({
  presence,
  invites,
}: {
  presence: PlayPresence | null
  invites: PlayInviteView[]
}) => {
  const { isSaving, answer } = usePlayInvites()
  if (!presence && invites.length === 0) {
    const VoidIcon = ICONS.playFeed

    return (
      <p className={PLAY_DOCK.void}>
        <VoidIcon className={PLAY_DOCK.voidIcon} aria-hidden="true" />
        {PLAY_HUB_COPY.feedEmpty}
      </p>
    )
  }

  return (
    <div className={PLAY_DOCK.rows}>
      {presence && (
        <div className={PLAY_DOCK.row}>
          <span className={PLAY_DOCK.rowName}>
            <PlayCurrentGame game={presence.game} />
          </span>
          <span className={PLAY_DOCK.rowActions}>
            <AppLink
              href={ROUTES.playSession(presence.sessionId)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeSmall)}
            >
              {PLAY_HUB_COPY.resume}
            </AppLink>
          </span>
        </div>
      )}
      {invites.map((invite) => (
        <div key={invite.id} className={PLAY_DOCK.row}>
          <span className={PLAY_DOCK.rowName}>
            <Avatar name={invite.inviter.name} src={invite.inviter.avatarUrl} size="xs" />
            {lineOf(invite)}
          </span>
          <span className={PLAY_DOCK.rowNote}>{PLAY_GAMES.label(invite.game)}</span>
          <span className={PLAY_DOCK.rowActions}>
            <Button
              variant="arcadeSmall"
              isLoading={isSaving}
              onClick={() => void answer(invite.id, true)}
            >
              {PLAY_HUB_COPY.accept}
            </Button>
            {!invite.isEveryone && (
              <Button
                variant="arcadeGhostSmall"
                isLoading={isSaving}
                onClick={() => void answer(invite.id, false)}
              >
                {PLAY_HUB_COPY.decline}
              </Button>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
