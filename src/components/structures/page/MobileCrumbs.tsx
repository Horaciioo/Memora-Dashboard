'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { APP_SHELL, TOP_BAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BREADCRUMB_FULL_CHARS } from '@/declarations/ui/responsive'
import { cn } from '@/utils/classnames'

/**
 * One page of the trail
 * @typedef {Object} Crumb
 * @property {string} label - Display label
 * @property {string} [href] - Destination, absent for a heading
 */

export interface MobileCrumb {
  label: string
  href?: string
}

export interface MobileCrumbsProps {
  // Last entry is the page on screen
  trail: MobileCrumb[]
}

const CrumbTrail = ({ trail }: MobileCrumbsProps) => {
  const [isOpen, setOpen] = useState(false)
  const Separator = ICONS.next
  const FoldIcon = ICONS.more
  const BackIcon = ICONS.back

  const current = trail[trail.length - 1]
  const earlier = trail.slice(0, -1)
  const length = trail.reduce((total, crumb) => total + crumb.label.length, 0)
  const isFolded = earlier.length > 0 && length > BREADCRUMB_FULL_CHARS

  return (
    <nav aria-label={NAV_COPY.breadcrumbs} className={TOP_BAR.crumbs}>
      {isFolded ? (
        <>
          <button
            type="button"
            aria-label={NAV_COPY.crumbFold}
            aria-expanded={isOpen}
            onClick={() => setOpen((open) => !open)}
            className={TOP_BAR.crumbFold}
          >
            <FoldIcon className="size-4" aria-hidden="true" />
          </button>
          <Separator className={APP_SHELL.crumbSeparator} aria-hidden="true" />
        </>
      ) : (
        earlier.map((crumb) => (
          <span key={crumb.href ?? crumb.label} className={APP_SHELL.crumb}>
            {crumb.href ? (
              <Link href={crumb.href} className={APP_SHELL.crumbLink}>
                {crumb.label}
              </Link>
            ) : (
              <span className={APP_SHELL.crumbCategory}>{crumb.label}</span>
            )}
            <Separator className={APP_SHELL.crumbSeparator} aria-hidden="true" />
          </span>
        ))
      )}
      <span className={cn(APP_SHELL.crumbCurrent, 'min-w-0')} aria-current="page">
        {current.label}
      </span>

      {isFolded && isOpen && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={TOP_BAR.crumbScrim}
            onClick={() => setOpen(false)}
          />
          <div className={TOP_BAR.crumbList}>
            {earlier.map((crumb) =>
              crumb.href ? (
                <Link key={crumb.href} href={crumb.href} className={TOP_BAR.crumbRow}>
                  <BackIcon className="size-4 shrink-0" aria-hidden="true" />
                  {crumb.label}
                </Link>
              ) : (
                <span key={crumb.label} className={TOP_BAR.crumbRowStatic}>
                  {crumb.label}
                </span>
              )
            )}
          </div>
        </>
      )}
    </nav>
  )
}

/**
 * Page trail in the top bar: whole while it fits, else « … › Page » with the earlier pages in a box beneath
 * @param {MobileCrumb[]} trail - Pages from the area to the one on screen
 * @return {JSX.Element}
 */

export const MobileCrumbs = ({ trail }: MobileCrumbsProps) => {
  const pathname = usePathname()

  // A new page starts again with the box shut
  return <CrumbTrail key={pathname} trail={trail} />
}
