'use client'

import { useOptimistic, useTransition } from 'react'
import { switchView } from '@/app/(dashboard)/actions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { VIEW_COPY } from '@/declarations/access/copy'
import type { NavigationViewName } from '@/declarations/navigation'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * Change of view with its toast: the view shown at once, the server following
 * @param {NavigationViewName} view - View in force
 * @param {Record<NavigationViewName, MemberRoleName>} roles - Role standing for each view
 * @return {{ shown: NavigationViewName, isSwitching: boolean, switchTo: (next: NavigationViewName) => void }} - State and trigger
 */

export const useViewSwitch = (
  view: NavigationViewName,
  roles: Record<NavigationViewName, MemberRoleName>
) => {
  const { notify } = useNotifications()
  const [shown, setShown] = useOptimistic(view)
  const [isSwitching, startSwitching] = useTransition()

  const switchTo = (next: NavigationViewName) =>
    startSwitching(async () => {
      setShown(next)
      await switchView(next)
      notify({
        tone: 'success',
        title: VIEW_COPY.switched(ROLE_REGISTRY.label(roles[next])),
        emphasis: VIEW_COPY.switchedEmphasis,
      })
    })

  return { shown, isSwitching, switchTo }
}
