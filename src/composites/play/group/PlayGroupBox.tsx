'use client'

import { useRouter } from 'next/navigation'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Group card: name, faces and who is online, opens its own page
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
    <button
      type="button"
      className={PLAY_GROUP.card}
      aria-label={`${PLAY_GROUP_COPY.open} ${group.name}`}
      onClick={() => router.push(ROUTES.playGroupRoom(group.id))}
    >
      <span className={PLAY_GROUP.cardHead}>
        <span className={PLAY_GROUP.rowText}>
          <span className={PLAY_GROUP.cardName}>{group.name}</span>
          <span className={PLAY_GROUP.rowNote}>
            {fillPlayMessage(PLAY_GROUP_COPY.groupDetails, {
              members: memberCount,
              online: fillPlayMessage(PLAY_GROUP_COPY.onlineCount, { count: onlineCount }),
            })}
          </span>
        </span>
        <span className={PLAY_GROUP.cardOpen}>{PLAY_GROUP_COPY.open}</span>
      </span>
      <span className={PLAY_GROUP.cardFoot}>
        <span className={PLAY_GROUP.faces}>
          {group.members.map((member) => (
            <PlayAvatar
              accountId={member.accountId}
              key={member.accountId}
              name={member.name}
              src={member.avatarUrl}
              size="sm"
            />
          ))}
        </span>
      </span>
    </button>
  )
}
