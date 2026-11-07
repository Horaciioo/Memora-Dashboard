'use client'

import { Button } from '@/components/elements/actions/Button'
import { PlayGroupBox } from '@/composites/play/group/PlayGroupBox'
import { PlayGroupInvitations } from '@/composites/play/group/PlayGroupInvitations'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_BOX } from '@/declarations/ui/variants'
import type { PlayGroupState } from '@/types/play'

export interface PlayGroupPanelProps {
  state: PlayGroupState
}

/**
 * Group page: one folded box per group, a dashed box below opens another
 * @param {PlayGroupPanelProps} props - State
 * @return {JSX.Element}
 */

export const PlayGroupPanel = ({ state }: PlayGroupPanelProps) => {
  const actions = usePlayGroup()
  const AddIcon = ICONS.add

  return (
    <div className={PLAY_BOX.stack}>
      <PlayGroupInvitations invitations={state.invitations} />
      {state.groups.map((group) => (
        <PlayGroupBox key={group.id} group={group} />
      ))}
      <Button
        variant="arcadeGhost"
        className={PLAY_BOX.add}
        disabled={actions.isSaving}
        onClick={() => void actions.create()}
      >
        <AddIcon className={PLAY_BOX.addIcon} aria-hidden="true" />
        {PLAY_GROUP_COPY.add}
      </Button>
    </div>
  )
}
