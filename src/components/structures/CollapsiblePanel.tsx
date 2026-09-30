'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { COLLAPSIBLE_PANEL } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface CollapsiblePanelProps {
  title: string
  icon?: IconName
  // Mono marker beside the title
  // Outside the toggle
  actions?: ReactNode
  defaultOpen?: boolean
  className?: string
  children: ReactNode
}

/**
 * Section folding its body
 * @param {CollapsiblePanelProps} props - Title, actions and body
 * @return {JSX.Element}
 */

export const CollapsiblePanel = ({
  title,
  icon,
  actions,
  defaultOpen = true,
  className,
  children,
}: CollapsiblePanelProps) => {
  const [isOpen, setOpen] = useState(defaultOpen)
  const Icon = icon ? ICONS[icon] : null
  const Chevron = ICONS.expand

  return (
    <section className={cn(COLLAPSIBLE_PANEL.frame, className)}>
      <div className={COLLAPSIBLE_PANEL.head}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setOpen((current) => !current)}
          className={COLLAPSIBLE_PANEL.toggle}
        >
          {Icon && <Icon className={COLLAPSIBLE_PANEL.icon} aria-hidden="true" />}
          <span className={COLLAPSIBLE_PANEL.title}>{title}</span>
          <Chevron
            className={cn(
              COLLAPSIBLE_PANEL.chevron,
              isOpen ? COLLAPSIBLE_PANEL.chevronOpen : COLLAPSIBLE_PANEL.chevronShut
            )}
            aria-hidden="true"
          />
        </button>
        {actions && <div className={COLLAPSIBLE_PANEL.actions}>{actions}</div>}
      </div>

      <div className="fold" data-open={isOpen} inert={!isOpen}>
        <div>
          <div className={COLLAPSIBLE_PANEL.body}>{children}</div>
        </div>
      </div>
    </section>
  )
}
