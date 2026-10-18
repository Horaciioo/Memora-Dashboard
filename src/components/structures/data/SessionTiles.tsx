'use client'

import type { ReactNode } from 'react'

import { AvatarStack } from '@/components/elements/display/Avatar'
import { accentVars } from '@/declarations/ui/theme'
import { SESSION_TILE } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

export interface SessionTileItem {
  id: string
  // Glyph or portrait leading the tile
  lead: ReactNode
  title: string
  // Days under the title
  meta?: string
  people?: { id: string; name: string; src?: string | null }[]
  muted?: boolean
  menu: MenuItem[]
  onOpen: () => void
}

export interface SessionTileGroup {
  id: string
  label: string
  accent?: string | null
  items: SessionTileItem[]
}

export interface SessionTilesProps {
  groups: SessionTileGroup[]
}

/**
 * Sessions as long cards under a heading each
 * @param {SessionTileGroup[]} groups - Headings and their tiles
 * @return {JSX.Element}
 */

export const SessionTiles = ({ groups }: SessionTilesProps) => {
  const { contextMenu } = useMenu()

  return (
    <div className={SESSION_TILE.root}>
      {groups.map((group) => (
        <section key={group.id} className={SESSION_TILE.group} style={accentVars(group.accent)}>
          <h2 className={SESSION_TILE.groupTitle}>{group.label}</h2>
          <div className={SESSION_TILE.grid}>
            {group.items.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={item.onOpen}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') item.onOpen()
                }}
                onContextMenu={contextMenu(item.menu, item.title)}
                className={cn(SESSION_TILE.tile, item.muted && SESSION_TILE.muted)}
              >
                {item.lead}
                <div className={SESSION_TILE.body}>
                  <span className={SESSION_TILE.title}>{item.title}</span>
                  {item.meta && <span className={SESSION_TILE.meta}>{item.meta}</span>}
                </div>
                {item.people && item.people.length > 0 && (
                  <AvatarStack people={item.people} size="sm" />
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
