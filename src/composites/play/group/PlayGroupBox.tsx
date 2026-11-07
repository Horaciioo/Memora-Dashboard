'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { PlayBoxSummary } from '@/composites/play/box/PlayBoxSummary'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Folded group, opens its own page
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @return {JSX.Element}
 */

export const PlayGroupBox = ({ group }: { group: PlayGroupView }) => {
  const router = useRouter()

  return (
    <PlayBoxSummary
      title={group.name}
      note={group.isHost ? PLAY_GROUP_COPY.host : undefined}
      label={`${PLAY_GROUP_COPY.open} ${group.name}`}
      onOpen={() => router.push(ROUTES.playGroupRoom(group.id))}
      aside={
        <span className={PLAY_GROUP.faces}>
          {group.members.map((member) => (
            <Avatar key={member.accountId} name={member.name} src={member.avatarUrl} size="sm" />
          ))}
        </span>
      }
    />
  )
}
