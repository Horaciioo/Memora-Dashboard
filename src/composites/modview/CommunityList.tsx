'use client'

import { useState } from 'react'

import { MODVIEW_COMMUNITY_GROUPS } from '@/declarations/modview/registries'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_COMMUNITY } from '@/declarations/ui/variants'
import type { Chatter, ModViewState, ModViewTarget } from '@/types/modview'
import { cn } from '@/utils/classnames'

type CommunityGroupName = keyof ModViewState['community']

export interface CommunityListProps {
  community: ModViewState['community']
  spotlight?: ModViewTarget | null
  // Groups left out
  skip?: CommunityGroupName[]
  onPick: (chatter: Chatter) => void
}

/**
 * Search and groups of the chat
 * @param {CommunityListProps} props - List props
 * @return {JSX.Element}
 */

export const CommunityList = ({ community, spotlight, skip = [], onPick }: CommunityListProps) => {
  const [search, setSearch] = useState('')
  const needle = search.trim().toLowerCase()

  return (
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
      {MODVIEW_COMMUNITY_GROUPS.keys
        .filter((key) => !skip.includes(key))
        .map((key) => {
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
}
