'use client'

import { useState } from 'react'
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
  // Meta read as an empty value
  metaEmpty?: boolean
  // Tag standing in place of the meta
  metaTag?: ReactNode
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
  // Portrait beside the heading
  lead?: ReactNode
  items: RowListItem[]
}

export interface RowListProps {
  groups: RowListGroup[]
  // Headings fold their rows
  isFoldable?: boolean
}

/**
 * Rows under a heading each, no box
 * @param {RowListGroup[]} groups - Headings and their rows
 * @param {boolean} [isFoldable] - Headings fold their rows
 * @return {JSX.Element}
 */

export const RowList = ({ groups, isFoldable }: RowListProps) => {
  const { contextMenu } = useMenu()
  const Arrow = ICONS.forward
  const Fold = ICONS.expand
  const [folded, setFolded] = useState<string[]>([])

  const toggle = (id: string) =>
    setFolded((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    )

  return (
    <div className={ROW_LIST.root}>
      {groups.map((group) => (
        <section key={group.id} className={ROW_LIST.group} style={accentVars(group.accent)}>
          {group.label &&
            (isFoldable ? (
              <h2 className={ROW_LIST.groupTitle}>
                <button
                  type="button"
                  aria-expanded={!folded.includes(group.id)}
                  onClick={() => toggle(group.id)}
                  className={ROW_LIST.fold}
                >
                  {group.lead}
                  {group.label}
                  <Fold
                    className={cn(ROW_LIST.foldGlyph, !folded.includes(group.id) && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
              </h2>
            ) : (
              <h2 className={ROW_LIST.groupTitle}>
                {group.lead}
                {group.label}
              </h2>
            ))}
          {(isFoldable && folded.includes(group.id) ? [] : group.items).map((item) => {
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
                  {item.metaTag}
                  {!item.metaTag && item.meta && (
                    <span className={cn(ROW_LIST.meta, item.metaEmpty && 'italic')}>
                      {item.meta}
                    </span>
                  )}
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
