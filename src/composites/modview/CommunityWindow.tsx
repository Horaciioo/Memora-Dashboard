'use client'

import { CommunityList } from '@/composites/modview/CommunityList'
import { ModWindow } from '@/composites/modview/ModWindow'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import type { Chatter, ModViewState, ModViewTarget } from '@/types/modview'

export interface CommunityWindowProps {
  community: ModViewState['community']
  spotlight: ModViewTarget | null
  onPick: (chatter: Chatter) => void
}

/**
 * Who is in the chat
 * @param {ModViewState['community']} community - Groups
 * @param {ModViewTarget | null} spotlight - Part lit by a scene
 * @param {(chatter: Chatter) => void} onPick - Open a viewer card
 * @return {JSX.Element}
 */

export const CommunityWindow = ({ community, spotlight, onPick }: CommunityWindowProps) => (
  <ModWindow
    title={MODVIEW_COPY.community}
    isLit={
      spotlight === 'community' ||
      spotlight === 'broadcaster' ||
      spotlight === 'moderators' ||
      spotlight === 'vips'
    }
    grow
  >
    <CommunityList community={community} spotlight={spotlight} onPick={onPick} />
  </ModWindow>
)
