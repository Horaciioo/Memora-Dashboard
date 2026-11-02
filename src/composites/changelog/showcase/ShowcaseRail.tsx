import { Skeleton } from '@/components/elements/feedback/Skeleton'
import {
  SHOWCASE_COPY,
  SHOWCASE_SETTINGS,
  SHOWCASE_SKELETONS,
  SHOWCASE_STEPS,
} from '@/declarations/changelog/showcase'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { NAVIGATION, NavigationViews, ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { PAGE_RAIL_STYLES, SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseRailProps {
  step: number
}

// Entries a moderator opens
const ENTRIES = NAVIGATION.filter(
  (group) => group.from === NavigationViews.Junior || group.from === NavigationViews.Moderation
).map((group) => ({
  ...group,
  items: group.items.filter((item) => !item.from || item.from === NavigationViews.Moderation),
}))

/**
 * The rail as members know it: Privées and Normales, search, then the pages
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseRail = ({ step }: ShowcaseRailProps) => {
  const SearchIcon = ICONS.search
  const AddIcon = ICONS.add
  const PageIcon = ICONS.page
  const isPrivate = step >= SHOWCASE_STEPS.private
  const isCreated = step >= SHOWCASE_STEPS.create
  let rows = SHOWCASE_SETTINGS.railRows

  return (
    <aside className={SHOWCASE.rail} aria-hidden="true">
      <div className={LEFT_SIDEBAR.viewButtons}>
        <span
          data-showcase="section-private"
          className={cn(LEFT_SIDEBAR.viewButton, isPrivate && LEFT_SIDEBAR.viewButtonActive)}
        >
          {NAV_COPY.railSectionPrivate}
        </span>
        <span className={cn(LEFT_SIDEBAR.viewButton, !isPrivate && LEFT_SIDEBAR.viewButtonActive)}>
          {NAV_COPY.railSectionNormal}
        </span>
      </div>

      <div className={LEFT_SIDEBAR.searchRow}>
        <span className={SHOWCASE.searchBox}>
          <SearchIcon className={SHOWCASE.searchGlyph} />
          {ASSISTANT_COPY.launcher}
        </span>
      </div>

      <div className={SHOWCASE.railScroll}>
        {isPrivate ? (
          <div className={LEFT_SIDEBAR.navGroup}>
            <p className={SHOWCASE.railLabel}>{PAGES_COPY.railGroup}</p>
            <span
              data-showcase="new-page"
              className={cn(LEFT_SIDEBAR.navLink, PAGE_RAIL_STYLES.create)}
            >
              <AddIcon className={LEFT_SIDEBAR.navIcon} />
              {PAGES_COPY.railNew}
            </span>
            <hr className={PAGE_RAIL_STYLES.divider} />
            {Array.from({ length: SHOWCASE_SKELETONS.tree }, (_, index) => (
              <Skeleton key={index} shape="row" className={SHOWCASE.treeBone} />
            ))}
            {isCreated && (
              <span className={cn(SHOWCASE.treeRow, SHOWCASE.treeRowOn)}>
                <PageIcon className={SHOWCASE.glyph} />
                {step >= SHOWCASE_STEPS.fill ? SHOWCASE_COPY.pageName : PAGES_COPY.untitled}
              </span>
            )}
          </div>
        ) : (
          ENTRIES.map((group) => {
            if (rows <= 0) return null
            const items = group.items.slice(0, rows)
            rows -= items.length

            return (
              <div key={group.label} className={LEFT_SIDEBAR.navGroup}>
                <p className={SHOWCASE.railLabel}>{group.label}</p>
                <div className={LEFT_SIDEBAR.navGroupItems}>
                  {items.map((item) => {
                    const Icon = ICONS[item.icon]
                    const isActive = item.href === ROUTES.absences

                    return (
                      <span
                        key={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(LEFT_SIDEBAR.navLink, isActive && LEFT_SIDEBAR.navLinkActive)}
                      >
                        <Icon className={LEFT_SIDEBAR.navIcon} />
                        {item.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
