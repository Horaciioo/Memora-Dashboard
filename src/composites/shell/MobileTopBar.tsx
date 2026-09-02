'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { AccountSheet } from '@/composites/shell/AccountSheet'
import { ViewToggle } from '@/composites/shell/ViewToggle'
import { APP_NAME } from '@/declarations/app'
import { ROUTES } from '@/declarations/navigation'
import { TOP_BAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import type { ViewContext } from '@/types/access'
import type { SessionUser } from '@/types/auth'

export interface MobileTopBarProps {
  session: SessionUser
  unreadCount: number
  viewContext: ViewContext
}

/**
 * Fixed top bar of the mobile shell — active creator, view switch, account
 * @param {SessionUser} session - Signed-in member
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element}
 */

export const MobileTopBar = ({ session, unreadCount, viewContext }: MobileTopBarProps) => {
  const [isAccountOpen, setAccountOpen] = useState(false)

  const { creators, activeYoutuberId } = viewContext
  const creator = creators.find((entry) => entry.id === activeYoutuberId) ?? null

  return (
    <header className={TOP_BAR.bar}>
      <Link href={ROUTES.dashboard} className={TOP_BAR.creator}>
        {creator ? (
          <>
            <Avatar name={creator.name} src={creator.avatarUrl} size="xs" />
            <span className={TOP_BAR.creatorName}>{creator.name}</span>
          </>
        ) : (
          <span className={TOP_BAR.creatorName}>{APP_NAME}</span>
        )}
      </Link>

      <div className={TOP_BAR.actions}>
        <ViewToggle viewContext={viewContext} />
        <button
          type="button"
          aria-label={NAV_COPY.account}
          onClick={() => setAccountOpen(true)}
          className={TOP_BAR.avatarButton}
        >
          <Avatar name={session.displayName} src={session.avatarUrl} size="sm" />
        </button>
      </div>

      <AccountSheet
        open={isAccountOpen}
        unreadCount={unreadCount}
        onClose={() => setAccountOpen(false)}
      />
    </header>
  )
}
