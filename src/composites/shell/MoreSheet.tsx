'use client'

import Link from 'next/link'
import { Dialog } from '@/components/structures/Dialog'
import { CreatorPicker } from '@/composites/shell/CreatorPicker'
import { visibleNavGroups } from '@/declarations/navigation'
import { MOBILE_MORE } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'

export interface MoreSheetProps {
  open: boolean
  viewContext: ViewContext
  // Routes already reachable from the nav pill
  shown: Set<string>
  onClose: () => void
}

/**
 * The reachable pages the nav pill has no room for, plus the creator picker
 * @param {boolean} open - Sheet is mounted
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {Set<string>} shown - Routes already on the pill
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const MoreSheet = ({ open, viewContext, shown, onClose }: MoreSheetProps) => {
  const { can, session } = useAuthContext()

  const groups = visibleNavGroups(viewContext.view, session, can)
    .map((group) => ({ ...group, items: group.items.filter((item) => !shown.has(item.href)) }))
    .filter((group) => group.items.length > 0)

  return (
    <Dialog open={open} onClose={onClose} title={NAV_COPY.moreTitle} size="sm">
      <div className={MOBILE_MORE.wrapper}>
        {viewContext.creators.length > 0 && (
          <CreatorPicker
            creators={viewContext.creators}
            activeYoutuberId={viewContext.activeYoutuberId}
            labelled
          />
        )}

        {groups.map((group) => (
          <div key={group.label} className={MOBILE_MORE.section}>
            <p className={MOBILE_MORE.sectionLabel}>{group.label}</p>
            <div className={MOBILE_MORE.grid}>
              {group.items.map((item) => {
                const Icon = ICONS[item.icon]

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={MOBILE_MORE.tile}
                  >
                    <Icon className={MOBILE_MORE.tileIcon} aria-hidden="true" />
                    <span className={MOBILE_MORE.tileLabel}>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
