'use client'

import { useState } from 'react'

import Link from '@/components/elements/navigation/AppLink'
import { RailPageNode } from '@/composites/shell/rail/RailPageNode'
import { RailPageCategory } from '@/composites/shell/rail/RailPageCategory'
import {
  LOOSE_CONTAINER,
  usePageActions,
  usePageCategories,
  usePageDrop,
  usePageTree,
} from '@/core/hooks/data/pages'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { canOwnPages } from '@/core/lib/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { PAGE_RAIL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Private section of the rail: own tree, then pages shared with the member
 * @return {JSX.Element}
 */

export const RailPrivatePages = () => {
  const { pages } = usePageTree()
  const { create, move } = usePageActions()
  const categoryGestures = usePageCategories()
  const { categories, create: createCategory } = categoryGestures
  const dnd = usePageDrop(categoryGestures, move)
  const { session } = useAuthContext()
  // Guests only see what is shared with them
  const canOwn = canOwnPages(session)
  const [isCollapsed, setCollapsed] = useState(false)
  const Chevron = ICONS.expand
  const AddIcon = ICONS.add
  const CategoryIcon = ICONS.pageCategoryAdd

  // Flat rail, no nesting
  const flat = pages.toSorted(
    (left, right) => left.position - right.position || left.title.localeCompare(right.title)
  )
  const own = flat.filter((page) => page.isOwn)
  const loose = own.filter((page) => !page.categoryId)
  const byCategory = Map.groupBy(own, (page) => page.categoryId)
  const shared = flat.filter((page) => !page.isOwn)
  const addToCategory = (categoryId: string) => void create({ categoryId })

  if (!canOwn && shared.length === 0) return null

  return (
    <div className={LEFT_SIDEBAR.navGroup}>
      <div className={PAGE_RAIL_STYLES.head}>
        <Link
          href={ROUTES.pages}
          className={cn(LEFT_SIDEBAR.navGroupLabel, PAGE_RAIL_STYLES.headLink)}
        >
          <span className={LEFT_SIDEBAR.navGroupTitle}>{PAGES_COPY.railGroup}</span>
        </Link>
        <button
          type="button"
          aria-label={PAGES_COPY.railExpand}
          aria-expanded={!isCollapsed}
          className={cn(PAGE_RAIL_STYLES.toggle, 'group')}
          onClick={() => setCollapsed(!isCollapsed)}
        >
          <Chevron
            className={cn(
              LEFT_SIDEBAR.navGroupChevron,
              isCollapsed && LEFT_SIDEBAR.navGroupChevronCollapsed
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="fold" data-open={!isCollapsed} inert={isCollapsed}>
        <div>
          {canOwn && (
            <button
              type="button"
              className={cn(LEFT_SIDEBAR.navLink, PAGE_RAIL_STYLES.create)}
              onClick={() => void create()}
            >
              <AddIcon className={LEFT_SIDEBAR.navIcon} aria-hidden="true" />
              <span className={LEFT_SIDEBAR.navLabel}>{PAGES_COPY.railNew}</span>
            </button>
          )}
          {canOwn && (
            <button
              type="button"
              className={cn(LEFT_SIDEBAR.navLink, PAGE_RAIL_STYLES.create)}
              onClick={() => void createCategory(PAGES_COPY.railCategoryName)}
            >
              <CategoryIcon className={LEFT_SIDEBAR.navIcon} aria-hidden="true" />
              <span className={LEFT_SIDEBAR.navLabel}>{PAGES_COPY.railNewCategory}</span>
            </button>
          )}
          {canOwn && flat.length > 0 && <hr className={PAGE_RAIL_STYLES.divider} />}
          <ul
            {...dnd.containerProps(LOOSE_CONTAINER)}
            className={cn(
              LEFT_SIDEBAR.navGroupItems,
              PAGE_RAIL_STYLES.category,
              dnd.over === LOOSE_CONTAINER && PAGE_RAIL_STYLES.categoryOver
            )}
          >
            {loose.map((page, index) => (
              <RailPageNode key={page.id} page={page} dnd={dnd} dropIndex={index} />
            ))}
            {loose.length === 0 && dnd.dragged && categories.length > 0 && (
              <li className={PAGE_RAIL_STYLES.dropHint}>{PAGES_COPY.railDropRoot}</li>
            )}
          </ul>
          {categories.length > 0 && (
            <ul className={PAGE_RAIL_STYLES.categories}>
              {categories.map((category) => (
                <RailPageCategory
                  key={category.id}
                  category={category}
                  pages={byCategory.get(category.id) ?? []}
                  dnd={dnd}
                  gestures={categoryGestures}
                  onAddPage={addToCategory}
                />
              ))}
            </ul>
          )}
          {shared.length > 0 && (
            <>
              <p className={PAGE_RAIL_STYLES.subhead}>{PAGES_COPY.railShared}</p>
              <ul className={LEFT_SIDEBAR.navGroupItems}>
                {shared.map((page) => (
                  <RailPageNode key={page.id} page={page} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
