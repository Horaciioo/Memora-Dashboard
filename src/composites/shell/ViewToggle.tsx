'use client'

import { useTransition } from 'react'
import { switchView } from '@/app/(dashboard)/actions'
import { NAVIGATION_VIEW_REGISTRY, VIEW_ROLES } from '@/declarations/access/views'
import { ROLE_EMBLEMS } from '@/declarations/members/profiles'
import { nextNavigationView } from '@/declarations/navigation'
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
 * Glyph of the level in force, Moderator, Responsable or Admin, walking the reachable views on
 * click: its label names the one it lands on, no wording on screen
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {string} [className] - Classes overriding the standard glyph button
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @return {JSX.Element | null}
 */

export const ViewToggle = ({ viewContext, className, iconClassName }: ViewToggleProps) => {
  const [isSwitching, startSwitching] = useTransition()
  const { view, available, switchable } = viewContext

  if (!switchable) return null

  const meta = NAVIGATION_VIEW_REGISTRY.get(view)
  // The glyph is the level in force: Moderator, Responsable or Admin
  const Glyph = ROLE_EMBLEMS[VIEW_ROLES[view]].glyph
  const target = nextNavigationView(view, available)
  const targetMeta = NAVIGATION_VIEW_REGISTRY.get(target)

  return (
    <button
      type="button"
      disabled={isSwitching}
      aria-label={targetMeta.label}
      title={`${targetMeta.label} : ${targetMeta.summary}`}
      onClick={() => startSwitching(() => void switchView(target))}
      style={{ color: TONE_VARS[meta.tone] }}
      className={className ?? cn(BUTTON_STYLES.base, BUTTON_STYLES.icon)}
    >
      <Glyph className={iconClassName ?? 'h-5 w-5 shrink-0'} aria-hidden="true" />
    </button>
  )
}
