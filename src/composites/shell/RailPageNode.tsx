'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Link from '@/components/elements/navigation/AppLink'
import { usePageActions } from '@/core/hooks/data/pages'
import { useMenu } from '@/managers/front-end'
import type { PageTreeNode } from '@/core/lib/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_MENU_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { PAGE_RAIL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RailPageNodeProps {
  node: PageTreeNode
  depth: number
  onAddChild: (parentId: string) => void
}

/**
 * One page of the rail tree, unfolding to its sub pages
 * @param {RailPageNodeProps} props - Node, depth and add handler
 * @return {JSX.Element}
 */

export const RailPageNode = ({ node, depth, onAddChild }: RailPageNodeProps) => {
  const pathname = usePathname()
  const href = ROUTES.page(node.page.id)
  const isActive = pathname === href
  const router = useRouter()
  const { trash } = usePageActions()
  const { contextMenu } = useMenu()
  const [isOpen, setOpen] = useState(false)

  // Trash, then leave if open
  const trashPage = async () => {
    await trash(node.page.id)
    if (isActive) router.push(ROUTES.pages)
  }
  const menu = node.page.isOwn
    ? [{ id: 'trash', label: PAGE_MENU_COPY.trash, icon: 'remove' as const, danger: true, onSelect: () => void trashPage() }]
    : []
  const Chevron = ICONS.expand
  const AddIcon = ICONS.add
  const PageIcon = ICONS.page

  return (
    <li>
      <div
        className={cn(PAGE_RAIL_STYLES.row, isActive && PAGE_RAIL_STYLES.rowActive)}
        onContextMenu={menu.length > 0 ? contextMenu(menu) : undefined}
        style={{ paddingLeft: `${depth * 0.75}rem` }}>
        <button
          type="button"
          aria-label={PAGES_COPY.railExpand}
          aria-expanded={isOpen}
          className={PAGE_RAIL_STYLES.toggle}
          onClick={() => setOpen(!isOpen)}
        >
          <Chevron className={cn(PAGE_RAIL_STYLES.chevron, !isOpen && LEFT_SIDEBAR.navGroupChevronCollapsed)} aria-hidden="true" />
        </button>
        <Link href={href} aria-current={isActive ? 'page' : undefined} className={PAGE_RAIL_STYLES.link}>
          {node.page.icon ? (
            <span className={PAGE_RAIL_STYLES.emoji} aria-hidden="true">
              {node.page.icon}
            </span>
          ) : (
            <PageIcon className={PAGE_RAIL_STYLES.glyph} aria-hidden="true" />
          )}
          <span className={PAGE_RAIL_STYLES.title}>{node.page.title || PAGES_COPY.untitled}</span>
        </Link>
        <button
          type="button"
          aria-label={PAGES_COPY.railAddChild}
          title={PAGES_COPY.railAddChild}
          className={PAGE_RAIL_STYLES.add}
          onClick={() => {
            setOpen(true)
            onAddChild(node.page.id)
          }}
        >
          <AddIcon className={PAGE_RAIL_STYLES.glyph} aria-hidden="true" />
        </button>
      </div>
      {isOpen &&
        (node.children.length > 0 ? (
          <ul className={PAGE_RAIL_STYLES.children}>
            {node.children.map((child) => (
              <RailPageNode key={child.page.id} node={child} depth={depth + 1} onAddChild={onAddChild} />
            ))}
          </ul>
        ) : (
          <p className={PAGE_RAIL_STYLES.empty} style={{ paddingLeft: `${(depth + 1) * 0.75 + 1.75}rem` }}>
            {PAGES_COPY.railEmpty}
          </p>
        ))}
    </li>
  )
}
