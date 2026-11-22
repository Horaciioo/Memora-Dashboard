'use client'

import { usePathname, useRouter } from 'next/navigation'

import Link from '@/components/elements/navigation/AppLink'
import { LOOSE_CONTAINER, usePageActions } from '@/core/hooks/data/pages'
import type { DragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { useMenu } from '@/managers/front-end'
import type { PageSummary } from '@/types/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_MENU_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_RAIL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RailPageNodeProps {
  page: PageSummary
  dnd?: DragAndDrop
  // Index among the siblings of the list, root rows only
  dropIndex?: number
}

/**
 * One page row of the rail
 * @param {RailPageNodeProps} props - Page and drag
 * @return {JSX.Element}
 */

export const RailPageNode = ({ page, dnd, dropIndex }: RailPageNodeProps) => {
  const pathname = usePathname()
  const href = ROUTES.page(page.id)
  const isActive = pathname === href
  const router = useRouter()
  const { trash } = usePageActions()
  const { contextMenu } = useMenu()

  // Trash, then leave if open
  const trashPage = async () => {
    await trash(page.id)
    if (isActive) router.push(ROUTES.pages)
  }
  const menu = page.isOwn
    ? [
        {
          id: 'trash',
          label: PAGE_MENU_COPY.trash,
          icon: 'remove' as const,
          danger: true,
          onSelect: () => void trashPage(),
        },
      ]
    : []
  // Only the owner moves a page
  const dragProps =
    dnd && page.isOwn
      ? dnd.itemProps({ id: page.id, from: page.categoryId ?? LOOSE_CONTAINER })
      : {}
  const isDragged = dnd?.dragged?.id === page.id
  const PageIcon = ICONS.page

  return (
    <li data-drop-index={dropIndex}>
      <div
        {...dragProps}
        className={cn(
          PAGE_RAIL_STYLES.row,
          isActive && PAGE_RAIL_STYLES.rowActive,
          isDragged && PAGE_RAIL_STYLES.dragged
        )}
        onContextMenu={menu.length > 0 ? contextMenu(menu) : undefined}
      >
        <Link
          href={href}
          draggable={false}
          aria-current={isActive ? 'page' : undefined}
          className={PAGE_RAIL_STYLES.link}
        >
          {page.icon ? (
            <span className={PAGE_RAIL_STYLES.emoji} aria-hidden="true">
              {page.icon}
            </span>
          ) : (
            <PageIcon className={PAGE_RAIL_STYLES.glyph} aria-hidden="true" />
          )}
          <span className={PAGE_RAIL_STYLES.title}>{page.title || PAGES_COPY.untitled}</span>
        </Link>
      </div>
    </li>
  )
}
