'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { Fragment, useState } from 'react'
import { createPortal } from 'react-dom'
import { LiveStartedBubble } from '@/composites/lives/notices/LiveStartedBubble'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { RailBranches } from '@/composites/shell/rail/RailBranches'
import { RailPrivatePages } from '@/composites/shell/rail/RailPrivatePages'
import { RailSlides } from '@/composites/shell/rail/RailSlides'
import { RailSubPages } from '@/composites/shell/rail/RailSubPages'
import { FAVORITE_COPY } from '@/declarations/ui/favorites'
import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { TOUR_RAIL } from '@/declarations/ui/variants'
import type { ViewContext } from '@/types/access'
import { LiveStatuses } from '@/utils/constants/lives'
import { cn } from '@/utils/classnames'
import { withToggled } from '@/utils/format/arrays'

export type RailSection = 'private' | 'normal'

export interface RailNavProps {
  groups: ReturnType<typeof visibleNavGroups>
  isCompact: boolean
  isTouring: boolean
  live: ViewContext['live']
  mentions: ViewContext['mentions']
  // One section only, both when absent
  section?: RailSection
  onOpenPrivate?: () => void
  onBack?: () => void
}

/**
 * Destinations of the rail, grouped and foldable
 * @param {ReturnType<typeof visibleNavGroups>} groups - Groups to draw
 * @param {boolean} isCompact - Rail is folded to its glyphs
 * @param {boolean} isTouring - First visit tour is running
 * @param {ViewContext['live']} live - Open live, lights its entry
 * @param {ViewContext['mentions']} mentions - Unseen mentions, counted on their page
 * @param {RailSection} [section] - Private pages replace the destinations
 * @param {() => void} [onOpenPrivate] - Private entry chosen
 * @param {() => void} [onBack] - Leave the private pages
 * @return {JSX.Element}
 */

export const RailNav = ({
  groups,
  isCompact,
  isTouring,
  live,
  mentions,
  section,
  onOpenPrivate,
  onBack,
}: RailNavProps) => {
  const pathname = usePathname()
  // Bubbles beside the pages never open on a phone
  const isMobile = useIsMobileShell()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand
  const BackIcon = ICONS.back
  // Live entry, light runs until opened
  const [openedLive, setOpenedLive] = useState(false)
  const [liveAnchor, setLiveAnchor] = useState<HTMLElement | null>(null)

  // Branches the visitor opened or shut by hand, the rest follow the page
  const [branchOverrides, setBranchOverrides] = useState<Record<string, boolean>>({})
  const setBranchOpen = (href: string, isOpen: boolean) =>
    setBranchOverrides((current) => ({ ...current, [href]: isOpen }))

  const toggleGroup = (label: string) =>
    setCollapsedGroups((current) => withToggled(current, label))

  // One lit entry at a time: deepest destination, favorites only when nothing else matches
  const reaches = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const current = groups
    .filter((group) => group.label !== FAVORITE_COPY.group)
    .flatMap((group) => group.items.map((item) => item.href))
    .filter(reaches)
    .sort((a, b) => b.length - a.length)[0]

  const destinations = (
    <nav key="destinations" className={LEFT_SIDEBAR.nav}>
      {groups.map((group) => {
        const isFavorite = group.label === FAVORITE_COPY.group
        const isGroupCollapsed = collapsedGroups.has(group.label) && !isCompact

        return (
          <div key={group.label} className={LEFT_SIDEBAR.navGroup}>
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!isGroupCollapsed}
              className={LEFT_SIDEBAR.navGroupLabel}
            >
              <span className={LEFT_SIDEBAR.navGroupTitle}>{group.label}</span>
              <ChevronIcon
                className={cn(
                  LEFT_SIDEBAR.navGroupChevron,
                  isGroupCollapsed && LEFT_SIDEBAR.navGroupChevronCollapsed
                )}
                aria-hidden="true"
              />
            </button>

            <div className="fold" data-open={!isGroupCollapsed} inert={isGroupCollapsed}>
              <div className={LEFT_SIDEBAR.navGroupItems}>
                {group.items.map((item) => {
                  // A creator is on air: the glyph turns into the live dot
                  const isOnAir = Boolean(item.onLive) && live?.status === LiveStatuses.Live
                  const Icon = railIcon(isOnAir ? 'liveDot' : item.icon)
                  // A destination hands the light to its open sub page
                  const isActive = isFavorite
                    ? !current && reaches(item.href)
                    : item.href === current && (pathname === item.href || isCompact)
                  const isLit = Boolean(item.onLive && live) && !openedLive && !isActive
                  // Unfolds its pages, never a destination of its own
                  const isBranching = Boolean(item.children) && !isCompact
                  const isBranchOpen = branchOverrides[item.href] ?? reaches(item.href)
                  const target = item.children?.[0]?.href ?? item.href

                  return (
                    <Fragment key={item.href}>
                      {isBranching ? (
                        <button
                          type="button"
                          onClick={() => setBranchOpen(item.href, !isBranchOpen)}
                          aria-expanded={isBranchOpen}
                          {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
                          className={cn(LEFT_SIDEBAR.navLink, isTouring && TOUR_RAIL.unlock)}
                        >
                          <Icon
                            className={cn(
                              LEFT_SIDEBAR.navIcon,
                              isActive && LEFT_SIDEBAR.navIconActive,
                              isOnAir && 'live-pulse'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              LEFT_SIDEBAR.navLabel,
                              isOnAir && LEFT_SIDEBAR.navLabelLive
                            )}
                          >
                            {item.label}
                          </span>
                          {mentions.some((mention) => mention.href === item.href) && (
                            <span className={LEFT_SIDEBAR.navBadge} aria-hidden="true">
                              {mentions.find((mention) => mention.href === item.href)?.count}
                            </span>
                          )}
                          {isLit && !isOnAir && (
                            <span className={LEFT_SIDEBAR.livePulse} aria-hidden="true">
                              <span className={LEFT_SIDEBAR.livePulseRing} />
                              <span className={LEFT_SIDEBAR.livePulseDot} />
                            </span>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={target}
                          ref={item.onLive ? setLiveAnchor : undefined}
                          onClick={
                            item.onLive
                              ? () => setOpenedLive(true)
                              : item.href === ROUTES.pages
                                ? onOpenPrivate
                                : undefined
                          }
                          title={isCompact ? item.label : undefined}
                          aria-label={isCompact ? item.label : undefined}
                          aria-current={isActive ? 'page' : undefined}
                          {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
                          className={cn(
                            LEFT_SIDEBAR.navLink,
                            isActive && LEFT_SIDEBAR.navLinkActive,
                            isTouring && TOUR_RAIL.unlock
                          )}
                        >
                          <Icon
                            className={cn(
                              LEFT_SIDEBAR.navIcon,
                              isActive && LEFT_SIDEBAR.navIconActive,
                              isOnAir && 'live-pulse'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              LEFT_SIDEBAR.navLabel,
                              isOnAir && LEFT_SIDEBAR.navLabelLive
                            )}
                          >
                            {item.label}
                          </span>
                          {mentions.some((mention) => mention.href === item.href) && (
                            <span className={LEFT_SIDEBAR.navBadge} aria-hidden="true">
                              {mentions.find((mention) => mention.href === item.href)?.count}
                            </span>
                          )}
                          {isLit && !isOnAir && (
                            <span className={LEFT_SIDEBAR.livePulse} aria-hidden="true">
                              <span className={LEFT_SIDEBAR.livePulseRing} />
                              <span className={LEFT_SIDEBAR.livePulseDot} />
                            </span>
                          )}
                        </Link>
                      )}
                      {/* Starred pages repeat destinations, one trail is enough */}
                      {isBranching && !isFavorite && item.children && (
                        <RailBranches isOpen={isBranchOpen} pages={item.children} />
                      )}
                      {!isCompact && !isFavorite && !item.children && (
                        <RailSubPages base={item.href} />
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )

  const privatePane = (
    <nav key="private" className={LEFT_SIDEBAR.nav}>
      <button type="button" className={LEFT_SIDEBAR.navLink} onClick={onBack}>
        <BackIcon className={LEFT_SIDEBAR.navIcon} aria-hidden="true" />
        <span className={LEFT_SIDEBAR.navLabel}>{NAV_COPY.railBack}</span>
      </button>
      <RailPrivatePages />
    </nav>
  )

  return (
    <>
      {isCompact ? (
        destinations
      ) : (
        <RailSlides index={section === 'private' ? 1 : 0} panes={[destinations, privatePane]} />
      )}

      {/* Out of the folds, which clip */}
      {!isMobile &&
        live?.unseenStart &&
        liveAnchor &&
        createPortal(
          <div
            className={LEFT_SIDEBAR.liveBubbleAnchor}
            style={{
              left: liveAnchor.getBoundingClientRect().right,
              top:
                liveAnchor.getBoundingClientRect().top +
                liveAnchor.getBoundingClientRect().height / 2,
            }}
          >
            <LiveStartedBubble liveId={live.unseenStart.id} />
          </div>,
          document.body
        )}
    </>
  )
}
