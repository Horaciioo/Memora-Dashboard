'use client'

import Link from 'next/link'
import { Avatar } from '@/components/elements/display/Avatar'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorSwitch } from '@/composites/shell/CreatorSwitch'
import { ViewToggle } from '@/composites/shell/ViewToggle'
import { ROUTES } from '@/declarations/navigation'
import { RIGHT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface RightSidebarProps {
  unreadCount: number
  viewContext: ViewContext
}

/**
 * Frameless rail of glyphs, the portrait sitting on the exact middle — creators and the
 * view switch above it, notifications and search below, signing out at the foot
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element | null}
 */

export const RightSidebar = ({ unreadCount, viewContext }: RightSidebarProps) => {
  const { session } = useAuthContext()

  if (!session) return null

  const hasCreators = viewContext.creators.length > 0

  return (
    <aside aria-label={NAV_COPY.rail} className={RIGHT_SIDEBAR.rail}>
      <div className={cn(RIGHT_SIDEBAR.half, RIGHT_SIDEBAR.halfTop)}>
        {hasCreators && (
          <CreatorSwitch
            creators={viewContext.creators}
            activeYoutuberId={viewContext.activeYoutuberId}
          />
        )}
        <ViewToggle viewContext={viewContext} iconClassName={RIGHT_SIDEBAR.boltIcon} />
      </div>

      <Link
        href={ROUTES.preferences}
        aria-label={NAV_COPY.account}
        title={session.displayName}
        className={RIGHT_SIDEBAR.avatar}
      >
        <Avatar name={session.displayName} src={session.avatarUrl} size="md" />
      </Link>

      <div className={cn(RIGHT_SIDEBAR.half, RIGHT_SIDEBAR.halfBottom)}>
        <NotificationsBell initialUnread={unreadCount} iconClassName={RIGHT_SIDEBAR.glyphIcon} />
        <SearchLauncher iconClassName={RIGHT_SIDEBAR.glyphIcon} />
        <LogoutButton iconOnly className={RIGHT_SIDEBAR.glyphHost} />
      </div>
    </aside>
  )
}
