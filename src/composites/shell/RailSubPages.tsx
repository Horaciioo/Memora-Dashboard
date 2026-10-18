'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRailSubPages, type RailSubPage } from '@/core/hooks/interaction/layout/useRailSubPages'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

interface ChainProps {
  // Last labels seen, so a closing level keeps its text while it folds
  pages: RailSubPage[]
  // Levels from the top still on the page
  depth: number
  // First level, tucked under the destination
  isRoot?: boolean
}

const Chain = ({ pages, depth, isRoot }: ChainProps) => {
  const pathname = usePathname()
  const [isReady, setReady] = useState(false)
  const [page, ...rest] = pages

  // Mounted shut, so the first paint can unfold
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  if (!page) return null

  const isOpen = isReady && depth > 0
  const isCurrent = pathname === page.href

  return (
    <div
      className={cn('fold', isRoot && LEFT_SIDEBAR.subPageRoot)}
      data-open={isOpen}
      inert={!isOpen}
    >
      <div>
        <div className={LEFT_SIDEBAR.subPage}>
          <Link
            href={page.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(LEFT_SIDEBAR.subLink, isCurrent && LEFT_SIDEBAR.subLinkActive)}
          >
            <span className="truncate">{page.label}</span>
          </Link>
          <Chain pages={rest} depth={depth - 1} />
        </div>
      </div>
    </div>
  )
}

export interface RailSubPagesProps {
  base: string
}

/**
 * Pages opened under a destination, each nested in the last
 * @param {string} base - Destination path
 * @return {JSX.Element | null}
 */

export const RailSubPages = ({ base }: RailSubPagesProps) => {
  const pages = useRailSubPages(base)
  const [seen, setSeen] = useState<RailSubPage[]>(pages)

  // Levels that left stay in place, closed
  const merged = [...pages, ...seen.slice(pages.length)]
  const isStale = merged.some(
    (page, i) => page.href !== seen[i]?.href || page.label !== seen[i]?.label
  )

  if (isStale || merged.length !== seen.length) setSeen(merged)

  return <Chain pages={seen} depth={pages.length} isRoot />
}
