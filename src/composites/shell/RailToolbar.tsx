'use client'

import { useRouter } from 'next/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import type { IconName } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { cn } from '@/utils/classnames'

export interface RailToolbarProps {
  isCompact: boolean
  onToggle: () => void
}

/**
 * Bare glyphs above the search: fold the rail, walk the history, reload the page
 * @param {boolean} isCompact - Rail is folded to its glyphs
 * @param {() => void} onToggle - Folds or unfolds the rail
 * @return {JSX.Element}
 */

export const RailToolbar = ({ isCompact, onToggle }: RailToolbarProps) => {
  const router = useRouter()
  const foldLabel = isCompact ? NAV_COPY.expandRail : NAV_COPY.collapseRail

  const buttons: { icon: IconName; label: string; onClick: () => void; className?: string }[] = [
    { icon: 'sidebar', label: foldLabel, onClick: onToggle },
    { icon: 'back', label: NAV_COPY.historyBack, onClick: router.back, className: 'rail-fold' },
    {
      icon: 'forward',
      label: NAV_COPY.historyForward,
      onClick: router.forward,
      className: 'rail-fold',
    },
    {
      icon: 'refresh',
      label: NAV_COPY.reloadPage,
      onClick: router.refresh,
      className: 'rail-fold ml-auto',
    },
  ]

  return (
    <div className={cn(LEFT_SIDEBAR.toolbar, isCompact && 'justify-center')}>
      {buttons.map(({ icon, label, onClick, className }) => {
        const Icon = railIcon(icon)

        return (
          <button
            key={icon}
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(LEFT_SIDEBAR.toolbarButton, className)}
          >
            <Icon className={LEFT_SIDEBAR.toolbarIcon} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
