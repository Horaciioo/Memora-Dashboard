'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { ROUTES } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import type { LiveBeacon } from '@/types/lives'
import { cn } from '@/utils/classnames'

export interface RailLiveBranchesProps {
  lives: LiveBeacon['lives']
}

/**
 * Mod View of each live on air, hanging under Lives
 * @param {LiveBeacon['lives']} lives - Lives on air
 * @return {JSX.Element | null}
 */

export const RailLiveBranches = ({ lives }: RailLiveBranchesProps) => {
  const pathname = usePathname()
  if (lives.length === 0) return null

  return (
    <div className={LEFT_SIDEBAR.branches}>
      {lives.map((live, index) => {
        const href = ROUTES.live(live.id)
        const isCurrent = pathname === href

        return (
          <div
            key={live.id}
            className={LEFT_SIDEBAR.branch}
            style={{ '--branch-index': index } as CSSProperties}
          >
            <Link
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(LEFT_SIDEBAR.subLink, isCurrent && LEFT_SIDEBAR.subLinkActive)}
            >
              <Avatar
                name={live.creator}
                src={live.creatorAvatar}
                size="xs"
                title=""
                className={LEFT_SIDEBAR.branchAvatar}
              />
              <span className="truncate">{NAV_COPY.railModView}</span>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
