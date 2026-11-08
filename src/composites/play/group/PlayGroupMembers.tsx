'use client'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Members and called people, the host may remove them
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @return {JSX.Element}
 */

export const PlayGroupMembers = ({ group }: { group: PlayGroupView }) => {
  const actions = usePlayGroup()
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))

  return (
    <section className={PLAY_GROUP.section}>
      <h2 className={PLAY_GROUP.heading}>{PLAY_GROUP_COPY.members}</h2>
      <ul className={PLAY_GROUP.memberList}>
        {group.members.map((member) => (
          <li key={member.accountId} className={PLAY_GROUP.row}>
            <Avatar name={member.name} src={member.avatarUrl} size="lg" />
            <span className={PLAY_GROUP.rowText}>
              <span className={PLAY_GROUP.rowName}>
                {member.name}
                {member.isMe && ` (${PLAY_GROUP_COPY.you})`}
              </span>
            </span>
            <span className={PLAY_GROUP.presence}>
              <span
                className={
                  onlineIds.has(member.accountId) ? PLAY_GROUP.rowOnline : PLAY_GROUP.rowOffline
                }
                aria-hidden="true"
              />
              {onlineIds.has(member.accountId)
                ? PLAY_GROUP_COPY.statusOnline
                : PLAY_GROUP_COPY.statusOffline}
            </span>
            {group.isHost && !member.isHost && (
              <Button
                variant="arcadeGhostSmall"
                disabled={actions.isSaving}
                onClick={() => void actions.remove(group.id, member.accountId)}
              >
                {PLAY_GROUP_COPY.remove}
              </Button>
            )}
          </li>
        ))}
        {group.invited.map((person) => (
          <li key={person.accountId} className={PLAY_GROUP.row}>
            <Avatar name={person.name} src={person.avatarUrl} size="lg" />
            <span className={PLAY_GROUP.rowText}>
              <span className={PLAY_GROUP.rowName}>{person.name}</span>
              <span className={PLAY_GROUP.rowNote}>{PLAY_GROUP_COPY.pending}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
