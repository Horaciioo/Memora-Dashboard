'use client'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_BOX, PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupInvitationView } from '@/types/play'

/**
 * Calls into a group waiting for the viewer
 * @param {Object} props - Invitations
 * @param {PlayGroupInvitationView[]} props.invitations - Calls
 * @return {JSX.Element | null}
 */

export const PlayGroupInvitations = ({
  invitations,
}: {
  invitations: PlayGroupInvitationView[]
}) => {
  const actions = usePlayGroup()
  if (invitations.length === 0) return null

  return (
    <section className={PLAY_BOX.root}>
      <h2 className={PLAY_GROUP.heading}>{PLAY_GROUP_COPY.invitations}</h2>
      <ul className={PLAY_GROUP.list}>
        {invitations.map((invitation) => (
          <li key={invitation.id} className={PLAY_GROUP.row}>
            <Avatar name={invitation.host.name} src={invitation.host.avatarUrl} size="md" />
            <span className={PLAY_GROUP.rowText}>
              <span className={PLAY_GROUP.rowName}>
                {fillPlayMessage(PLAY_GROUP_COPY.invitationSentence, {
                  name: invitation.host.name,
                  group: invitation.groupName,
                })}
              </span>
            </span>
            <span className={PLAY_GROUP.actions}>
              <Button
                variant="arcadeGhostSmall"
                disabled={actions.isSaving}
                onClick={() => void actions.answer(invitation.id, false)}
              >
                {PLAY_GROUP_COPY.decline}
              </Button>
              <Button
                variant="arcadeSmall"
                disabled={actions.isSaving}
                onClick={() => void actions.answer(invitation.id, true)}
              >
                {PLAY_GROUP_COPY.accept}
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
