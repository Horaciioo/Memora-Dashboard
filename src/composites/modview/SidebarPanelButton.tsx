'use client'

import type { ReactNode } from 'react'

import { Tip } from '@/components/elements/feedback/Tip'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_SIDEBAR, MODVIEW_TEAM_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PanelButtonProps {
  icon: IconName
  label: string
  isOpen: boolean
  onToggle: () => void
  // Where the panel hangs
  anchor: 'top' | 'bottom'
  // Wider panel, for a list with its own controls
  isWide?: boolean
  // Colour class of the glyph
  tone?: string
  // Control at the far end of the title
  action?: ReactNode
  // Point on the glyph, something waits
  hasUnread?: boolean
  // Tooltip replacing the label
  hint?: string
  // Bubble hanging beside the glyph
  floating?: ReactNode
  children: ReactNode
}

/**
 * Icon that opens a panel on its right
 * @param {PanelButtonProps} props - Button props
 * @return {JSX.Element}
 */

export const PanelButton = ({
  icon,
  label,
  isOpen,
  onToggle,
  anchor,
  isWide,
  tone,
  action,
  hasUnread,
  hint,
  floating,
  children,
}: PanelButtonProps) => {
  const Icon = ICONS[icon]

  const trigger = (
    <button
      type="button"
      className={cn(MODVIEW_SIDEBAR.button, isOpen && MODVIEW_SIDEBAR.buttonOpen)}
      aria-label={label}
      title={hint && !isOpen ? undefined : label}
      aria-haspopup="true"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <Icon className={cn(MODVIEW_SIDEBAR.icon, tone)} aria-hidden="true" />
    </button>
  )

  return (
    <div className={MODVIEW_SIDEBAR.group}>
      {hint && !isOpen ? (
        <Tip label={hint} floating>
          {trigger}
        </Tip>
      ) : (
        trigger
      )}

      {hasUnread && !isOpen && <span className={MODVIEW_TEAM_CHAT.unread} aria-hidden="true" />}

      {!isOpen && floating}

      {isOpen && <span className={MODVIEW_SIDEBAR.arrow} aria-hidden="true" />}

      {isOpen && (
        <div
          role="group"
          aria-label={label}
          className={cn(
            MODVIEW_SIDEBAR.panel,
            anchor === 'top' ? MODVIEW_SIDEBAR.panelTop : MODVIEW_SIDEBAR.panelBottom,
            isWide ? MODVIEW_SIDEBAR.panelWide : MODVIEW_SIDEBAR.panelNormal
          )}
        >
          <div className={MODVIEW_SIDEBAR.titleRow}>
            <div className={MODVIEW_SIDEBAR.titleHead}>
              <span className={MODVIEW_SIDEBAR.titleTile} aria-hidden="true">
                <Icon className={MODVIEW_SIDEBAR.titleIcon} />
              </span>
              <p className={MODVIEW_SIDEBAR.title}>{label}</p>
            </div>
            {action}
          </div>
          {children}
        </div>
      )}
    </div>
  )
}
