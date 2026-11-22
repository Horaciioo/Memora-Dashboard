'use client'

import { useState } from 'react'

import { PlayGroupAdd } from '@/composites/play/group/PlayGroupAdd'
import { PlayGroupBox } from '@/composites/play/group/PlayGroupBox'
import { PlayGroupCreate } from '@/composites/play/group/PlayGroupCreate'
import { PlayGroupInvitations } from '@/composites/play/group/PlayGroupInvitations'
import { PLAY_BOX, PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupState } from '@/types/play'

export interface PlayGroupPanelProps {
  state: PlayGroupState
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
}

/**
 * Group page: one card per group, a dashed box of the same size opens the creation steps
 * @param {PlayGroupPanelProps} props - State and people who can be called
 * @return {JSX.Element}
 */

export const PlayGroupPanel = ({ state, candidates }: PlayGroupPanelProps) => {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className={PLAY_BOX.flat}>
      <PlayGroupInvitations invitations={state.invitations} />
      <div className={PLAY_GROUP.cardGrid}>
        {state.groups.map((group) => (
          <PlayGroupBox key={group.id} group={group} />
        ))}
        {isCreating ? (
          <PlayGroupCreate candidates={candidates} onClose={() => setIsCreating(false)} />
        ) : (
          <PlayGroupAdd onOpen={() => setIsCreating(true)} />
        )}
      </div>
    </div>
  )
}
