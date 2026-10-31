'use client'

import { useViewSwitch } from '@/core/hooks/interaction/layout/useViewSwitch'
import { SlideSwitch } from '@/components/elements/actions/SlideSwitch'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { VIEW_TINTS } from '@/declarations/access/views'
import { ROLE_EMBLEMS } from '@/declarations/members/profiles'
import type { NavigationViewName } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import type { ViewContext } from '@/types/access'

export interface RoleSwitchProps {
  viewContext: ViewContext
}

/**
 * Switch between the views a member reaches: blue moderator, orange lead, red admin, one stop
 * per reachable view
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element | null}
 */

export const RoleSwitch = ({ viewContext }: RoleSwitchProps) => {
  const { view, available, roles, switchable } = viewContext
  const { shown, switchTo } = useViewSwitch(view, roles)

  if (!switchable) return null

  const options = available.map((entry) => ({
    value: entry,
    label: ROLE_REGISTRY.label(roles[entry]),
    glyph: ROLE_EMBLEMS[roles[entry]].glyph,
    tint: VIEW_TINTS[entry],
  }))

  return (
    <SlideSwitch
      label={NAV_COPY.viewSwitch}
      options={options}
      value={shown}
      onChange={(next) => switchTo(next as NavigationViewName)}
    />
  )
}
