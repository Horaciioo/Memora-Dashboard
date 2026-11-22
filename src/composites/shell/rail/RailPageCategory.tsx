'use client'

import { useState } from 'react'

import { InlineText } from '@/components/structures/inline/InlineText'
import { RailPageNode } from '@/composites/shell/rail/RailPageNode'
import { CATEGORY_ORIGIN } from '@/core/hooks/data/pages'
import type { PageCategories } from '@/core/hooks/data/pages'
import type { DragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import type { PageSummary } from '@/types/pages'
import { useMenu } from '@/managers/front-end'
import { PAGE_MENU_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { ICONS } from '@/declarations/ui/icons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { PAGE_RAIL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PageCategoryView } from '@/types/pages'

export interface RailPageCategoryProps {
  category: PageCategoryView
  pages: PageSummary[]
  dnd: DragAndDrop
  gestures: Pick<PageCategories, 'rename' | 'remove'>
  onAddPage: (categoryId: string) => void
}

/**
 * One category of the rail, a drop target holding its pages
 * @param {RailPageCategoryProps} props - Category, pages and gestures
 * @return {JSX.Element}
 */

export const RailPageCategory = ({
  category,
  pages,
  dnd,
  gestures,
  onAddPage,
}: RailPageCategoryProps) => {
  const { contextMenu } = useMenu()
  const [isOpen, setOpen] = useState(true)
  const Chevron = ICONS.expand
  const AddIcon = ICONS.add
  const menu = [
    {
      id: 'remove',
      label: PAGE_MENU_COPY.removeCategory,
      icon: 'remove' as const,
      danger: true,
      onSelect: () => void gestures.remove(category.id),
    },
  ]

  return (
    <li
      {...dnd.containerProps(category.id)}
      className={cn(
        PAGE_RAIL_STYLES.category,
        PAGE_RAIL_STYLES.categoryGroup,
        dnd.over === category.id && PAGE_RAIL_STYLES.categoryOver
      )}
    >
      <div
        {...dnd.itemProps({ id: category.id, from: CATEGORY_ORIGIN })}
        className={cn(
          PAGE_RAIL_STYLES.categoryHead,
          dnd.dragged?.id === category.id && PAGE_RAIL_STYLES.dragged
        )}
        onContextMenu={contextMenu(menu)}
      >
        <InlineText
          id={`page-category-${category.id}`}
          value={category.name}
          maxLength={PAGE_SETTINGS.categoryNameMaxLength}
          placeholder={PAGES_COPY.railCategoryRename}
          className={PAGE_RAIL_STYLES.categoryName}
          onCommit={(name) => gestures.rename(category.id, name)}
        />
        <button
          type="button"
          aria-label={PAGES_COPY.railCategoryAdd}
          title={PAGES_COPY.railCategoryAdd}
          className={PAGE_RAIL_STYLES.add}
          onClick={() => onAddPage(category.id)}
        >
          <AddIcon className={PAGE_RAIL_STYLES.glyph} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={PAGES_COPY.railExpand}
          aria-expanded={isOpen}
          className={cn(PAGE_RAIL_STYLES.toggle, 'group')}
          onClick={() => setOpen(!isOpen)}
        >
          <Chevron
            className={cn(
              LEFT_SIDEBAR.navGroupChevron,
              !isOpen && LEFT_SIDEBAR.navGroupChevronCollapsed
            )}
            aria-hidden="true"
          />
        </button>
      </div>
      {isOpen &&
        (pages.length > 0 ? (
          <ul className={LEFT_SIDEBAR.navGroupItems}>
            {pages.map((page, index) => (
              <RailPageNode key={page.id} page={page} dnd={dnd} dropIndex={index} />
            ))}
          </ul>
        ) : (
          <p className={cn(PAGE_RAIL_STYLES.empty, PAGE_RAIL_STYLES.categoryEmpty)}>
            {PAGES_COPY.railCategoryEmpty}
          </p>
        ))}
    </li>
  )
}
