'use client'

import { Button } from '@/components/elements/actions/Button'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_BOX, PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Settings of the group: leave it, or dissolve it for the host
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

  return (
    <div className={PLAY_BOX.body}>
      <div className={PLAY_GROUP.footer}>
        <Button
          variant="arcadeGhost"
          disabled={actions.isSaving}
          onClick={() => void actions.remove(group.id, viewerId)}
        >
          {PLAY_GROUP_COPY.leave}
        </Button>
        {group.isHost && (
          <Button
            variant="arcadeGhost"
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
