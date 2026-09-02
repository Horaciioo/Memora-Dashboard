'use client'

import { useTransition } from 'react'
import { switchView } from '@/app/(dashboard)/actions'
import { NAVIGATION_VIEW_REGISTRY } from '@/declarations/access/views'
import { nextNavigationView } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { TONE_VARS } from '@/declarations/ui/theme'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface ViewToggleProps {
  viewContext: ViewContext
  className?: string
  iconClassName?: string
}

/**
 * Lightning walking the reachable views, its colour naming the one in force and its label
 * the one it lands on — no wording on screen, the glyph carries the state
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {string} [className] - Classes overriding the standard glyph button
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @return {JSX.Element | null}
 */

export const ViewToggle = ({ viewContext, className, iconClassName }: ViewToggleProps) => {
  const [isSwitching, startSwitching] = useTransition()
  const { view, available, switchable } = viewContext
  const Flash = ICONS.flash

  if (!switchable) return null

  const meta = NAVIGATION_VIEW_REGISTRY.get(view)
  const target = nextNavigationView(view, available)
  const targetMeta = NAVIGATION_VIEW_REGISTRY.get(target)

  return (
    <button
      type="button"
      disabled={isSwitching}
      aria-label={targetMeta.label}
      title={`${targetMeta.label} — ${targetMeta.summary}`}
      onClick={() => startSwitching(() => void switchView(target))}
      style={{ color: TONE_VARS[meta.tone] }}
      className={className ?? cn(BUTTON_STYLES.base, BUTTON_STYLES.icon)}
    >
      <Flash className={iconClassName ?? 'h-4 w-4 shrink-0'} aria-hidden="true" />
    </button>
  )
}
