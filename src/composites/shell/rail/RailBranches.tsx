'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import type { NavigationChild } from '@/declarations/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export interface RailBranchesProps {
  isOpen: boolean
  pages: NavigationChild[]
}

/**
 * Pages hanging under a folding entry
 * @param {boolean} isOpen - Branches are drawn
 * @param {NavigationChild[]} pages - Pages hanging from it
 * @return {JSX.Element}
 */

export const RailBranches = ({ isOpen, pages }: RailBranchesProps) => {
  const pathname = usePathname()

  return (
    <div className="fold" data-open={isOpen} inert={!isOpen}>
      <div>
        <div className={LEFT_SIDEBAR.branches}>
          {pages.map((page, index) => {
            const isCurrent = pathname === page.href || pathname.startsWith(`${page.href}/`)

            return (
              <div
                key={page.href}
                className={LEFT_SIDEBAR.branch}
                style={{ '--branch-index': index } as CSSProperties}
              >
                <Link
                  href={page.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(LEFT_SIDEBAR.subLink, isCurrent && LEFT_SIDEBAR.subLinkActive)}
                >
                  <span className="truncate">{page.label}</span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
