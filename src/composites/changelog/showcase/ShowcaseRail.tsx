import { Avatar } from '@/components/elements/display/Avatar'
import { SHOWCASE_COPY, SHOWCASE_SETTINGS, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
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

// Shortcuts under the search
const SHORTCUTS = NAVIGATION.flatMap((group) => group.items.filter((item) => item.quick)).slice(
  0,
  3
)

// Entries a moderator opens
const ENTRIES = NAVIGATION.filter(
  (group) => group.from === NavigationViews.Junior || group.from === NavigationViews.Moderation
).map((group) => ({
  ...group,
  items: group.items.filter(
    (item) => item.href !== ROUTES.play && (!item.from || item.from === NavigationViews.Moderation)
  ),
}))

/**
 * The rail as members know it: Privées and Normales, search, then the pages
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseRail = ({ step }: ShowcaseRailProps) => {
  const AddIcon = ICONS.add
  const BellIcon = ICONS.bell
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
      <div className={LEFT_SIDEBAR.viewDivider} />

      <div className={LEFT_SIDEBAR.shortcuts}>
        {SHORTCUTS.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <span
              key={item.href}
              title={item.label}
              className={cn(
                LEFT_SIDEBAR.shortcut,
                item.href === ROUTES.dashboard && LEFT_SIDEBAR.shortcutActive
              )}
            >
              <Icon className={LEFT_SIDEBAR.shortcutIcon} />
            </span>
          )
        })}
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
            {isCreated && (
              <>
                <hr className={PAGE_RAIL_STYLES.divider} />
                <span className={cn(SHOWCASE.treeRow, SHOWCASE.treeRowOn)}>
                  <PageIcon className={SHOWCASE.glyph} />
                  {step >= SHOWCASE_STEPS.fill ? SHOWCASE_COPY.pageName : PAGES_COPY.untitled}
                </span>
              </>
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
      <div className={LEFT_SIDEBAR.footer}>
        <div className={LEFT_SIDEBAR.footerBox}>
          <div className={LEFT_SIDEBAR.footerRow}>
            <Avatar name={SHOWCASE_COPY.owner} src={null} size="sm" />
            <span className={LEFT_SIDEBAR.footerName}>{SHOWCASE_COPY.owner}</span>
            <div className={LEFT_SIDEBAR.footerActions}>
              <BellIcon className={LEFT_SIDEBAR.footerIcon} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
