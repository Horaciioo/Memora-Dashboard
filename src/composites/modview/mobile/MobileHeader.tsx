'use client'

import AppLink from '@/components/elements/navigation/AppLink'
import { LeaveModViewButton } from '@/composites/modview/LeaveModViewButton'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { MODVIEW_TEAM_COPY as TEAM_COPY } from '@/declarations/modview/watch'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MobileHeaderProps {
  title: string
  icon: IconName
  onTeam?: () => void
  // Colour class of the team glyph, the viewer's role
  teamTone?: string
  // Corner where the page in view puts its controls
  slotRef: (element: HTMLElement | null) => void
  leaveLiveId?: string
}

/**
 * Page title
 * @param {MobileHeaderProps} props - Header props
 * @return {JSX.Element}
 */

export const MobileHeader = ({
  title,
  icon,
  onTeam,
  teamTone,
  slotRef,
  leaveLiveId,
}: MobileHeaderProps) => {
  const ExitIcon = ICONS.signOut
  const PageIcon = ICONS[icon]
  const TeamIcon = ICONS.sword

  return (
    <header className={MODVIEW_MOBILE.header}>
      <span className={MODVIEW_MOBILE.headerTile} aria-hidden="true">
        <PageIcon className={MODVIEW_MOBILE.headerIcon} />
      </span>
      <h1 className={MODVIEW_MOBILE.headerTitle}>{title}</h1>
      <div ref={slotRef} className={MODVIEW_MOBILE.slot} />
      {onTeam && (
        <button
          type="button"
          className={MODVIEW_MOBILE.teamTab}
          aria-label={TEAM_COPY.title}
          title={TEAM_COPY.title}
          onClick={onTeam}
        >
          <TeamIcon className={cn(MODVIEW_MOBILE.exitIcon, teamTone)} aria-hidden="true" />
        </button>
      )}
      {leaveLiveId ? (
        <LeaveModViewButton liveId={leaveLiveId} />
      ) : (
        <AppLink
          href={ROUTES.dashboard}
          className={MODVIEW_MOBILE.exit}
          aria-label={COPY.leave}
          title={COPY.leave}
        >
          <ExitIcon className={MODVIEW_MOBILE.exitIcon} aria-hidden="true" />
        </AppLink>
      )}
    </header>
  )
}
