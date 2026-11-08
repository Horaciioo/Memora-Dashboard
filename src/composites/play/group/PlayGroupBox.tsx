'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { PlayBoxSummary } from '@/composites/play/box/PlayBoxSummary'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
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
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))
  const onlineCount = group.members.filter((member) => onlineIds.has(member.accountId)).length
  const memberCount =
    group.members.length === 1
      ? PLAY_GROUP_COPY.oneMember
      : fillPlayMessage(PLAY_GROUP_COPY.memberCount, { count: group.members.length })

  return (
    <PlayBoxSummary
      title={group.name}
      note={fillPlayMessage(PLAY_GROUP_COPY.groupDetails, {
        members: memberCount,
        online: fillPlayMessage(PLAY_GROUP_COPY.onlineCount, { count: onlineCount }),
      })}
      label={`${PLAY_GROUP_COPY.open} ${group.name}`}
      showExpandIcon={false}
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
