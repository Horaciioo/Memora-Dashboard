'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_CREW } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Settings of the group: leave it, hand it over or dissolve it for the host
 * @param {Object} props - Group and viewer
 * @param {PlayGroupView} props.group - Group
 * @param {string} props.viewerId - Viewer
 * @return {JSX.Element}
 */

export const PlayGroupSettings = ({
  group,
  viewerId,
}: {
  group: PlayGroupView
  viewerId: string
}) => {
  const actions = usePlayGroup()
  const [pending, setPending] = useState<string | null>(null)
  const heirs = group.members.filter((member) => member.accountId !== viewerId)

  return (
    <div className={cn(PLAY_CREW.panel, PLAY_CREW.panelBar)}>
      {group.isHost && heirs.length > 0 && (
        <div className={PLAY_CREW.menu}>
          <p>{PLAY_GROUP_COPY.transferHint}</p>
          {heirs.map((member) => (
            <Button
              key={member.accountId}
              variant="arcadeGhostSmall"
              disabled={actions.isSaving}
              onClick={() =>
                pending === member.accountId
                  ? void actions.transfer(group.id, member.accountId)
                  : setPending(member.accountId)
              }
            >
              {fillPlayMessage(
                pending === member.accountId
                  ? PLAY_GROUP_COPY.transferSure
                  : PLAY_GROUP_COPY.transferTo,
                { name: member.name }
              )}
            </Button>
          ))}
        </div>
      )}
      <div className={PLAY_CREW.menu}>
        <Button
          variant="arcadeGhostSmall"
          disabled={actions.isSaving}
          onClick={() => void actions.remove(group.id, viewerId)}
        >
          {PLAY_GROUP_COPY.leave}
        </Button>
        {group.isHost && (
          <Button
            variant="arcadeGhostSmall"
            disabled={actions.isSaving}
            onClick={() => void actions.dissolve(group.id)}
          >
            {PLAY_GROUP_COPY.dissolve}
          </Button>
        )}
      </div>
    </div>
  )
}
