'use client'

import type { ReactNode } from 'react'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { ROW_LIST } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

export interface RowListItem {
  id: string
  title: string
  // Second line
  meta?: string
  // Glyph key of the function
  icon?: string | null
  // Portrait standing in place of the glyph
  lead?: ReactNode
  // Right edge
  trail?: ReactNode
  muted?: boolean
  menu: MenuItem[]
  onOpen: () => void
}

export interface RowListGroup {
  id: string
  label: string
  accent?: string | null
  items: RowListItem[]
}

export interface RowListProps {
  groups: RowListGroup[]
}

/**
 * Rows under a heading each, no box
 * @param {RowListGroup[]} groups - Headings and their rows
 * @return {JSX.Element}
 */

export const RowList = ({ groups }: RowListProps) => {
  const { contextMenu } = useMenu()
  const Arrow = ICONS.forward

  return (
    <div className={ROW_LIST.root}>
      {groups.map((group) => (
        <section key={group.id} className={ROW_LIST.group} style={accentVars(group.accent)}>
          <h2 className={ROW_LIST.groupTitle}>{group.label}</h2>
          {group.items.map((item) => {
            const Glyph = item.icon && isIconName(item.icon) ? ICONS[item.icon] : null

            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={item.onOpen}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') item.onOpen()
                }}
                onContextMenu={contextMenu(item.menu, item.title)}
                className={cn(ROW_LIST.row, item.muted && ROW_LIST.muted)}
              >
                {item.lead ?? (Glyph && <Glyph className={ROW_LIST.glyph} aria-hidden="true" />)}
                <span className={ROW_LIST.body}>
                  <span className={ROW_LIST.title}>{item.title}</span>
                  {item.meta && <span className={ROW_LIST.meta}>{item.meta}</span>}
                </span>
                {item.trail && <span className={ROW_LIST.trail}>{item.trail}</span>}
                <Arrow className={ROW_LIST.arrow} aria-hidden="true" />
              </article>
            )
          })}
        </section>
      ))}
    </div>
  )
}
