'use client'

import { useState } from 'react'

import { ModWindow } from '@/composites/modview/ModWindow'
import { MODVIEW_COMMUNITY_GROUPS } from '@/declarations/modview/registries'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_COMMUNITY } from '@/declarations/ui/variants'
import type { Chatter, ModViewState, ModViewTarget } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface CommunityWindowProps {
  community: ModViewState['community']
  spotlight: ModViewTarget | null
  onPick: (chatter: Chatter) => void
  // Drawn inside another window, no frame of its own
  bare?: boolean
}

/**
 * Who is in the chat, grouped by badge
 * @param {ModViewState['community']} community - Groups
 * @param {ModViewTarget | null} spotlight - Part lit by a scene
 * @param {(chatter: Chatter) => void} onPick - Open a viewer card
 * @param {boolean} [bare] - Drawn inside another window
 * @return {JSX.Element}
 */

export const CommunityWindow = ({ community, spotlight, onPick, bare }: CommunityWindowProps) => {
  const [search, setSearch] = useState('')
  const needle = search.trim().toLowerCase()

  const content = (
    <>
      <div className={MODVIEW_COMMUNITY.search}>
        <input
          className={MODVIEW_COMMUNITY.input}
          placeholder={MODVIEW_COPY.searchCommunity}
          aria-label={MODVIEW_COPY.searchCommunity}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {MODVIEW_COMMUNITY_GROUPS.keys.map((key) => {
        const group = MODVIEW_COMMUNITY_GROUPS.get(key)
        const Icon = ICONS[group.icon]
        const members = community[key].filter((chatter) => chatter.login.includes(needle))

        return (
          <div
            key={key}
            className={cn(
              MODVIEW_COMMUNITY.group,
              group.target !== null && spotlight === group.target && MODVIEW_COMMUNITY.groupLit
            )}
          >
            <p className={MODVIEW_COMMUNITY.groupHead}>
              <Icon className={MODVIEW_COMMUNITY.groupIcon} aria-hidden="true" />
              {group.label}
            </p>
            {members.length === 0 ? (
              <p className={MODVIEW_COMMUNITY.empty}>{group.empty}</p>
            ) : (
              members.map((chatter) => (
                <button
                  key={chatter.id}
                  type="button"
                  className={MODVIEW_COMMUNITY.member}
                  onClick={() => onPick(chatter)}
                >
                  {chatter.login}
                </button>
              ))
            )}
          </div>
        )
      })}
    </>
  )

  if (bare) return content

  return (
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
      {content}
    </ModWindow>
  )
}
