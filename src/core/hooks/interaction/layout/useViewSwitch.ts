'use client'

import { useOptimistic, useTransition } from 'react'
import { switchView } from '@/app/(dashboard)/actions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { VIEW_COPY } from '@/declarations/access/copy'
import { VIEW_ROLES } from '@/declarations/access/views'
import type { NavigationViewName } from '@/declarations/navigation'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * Change of view with its toast: the view shown at once, the server following
 * @param {NavigationViewName} view - View in force
 * @return {{ shown: NavigationViewName, isSwitching: boolean, switchTo: (next: NavigationViewName) => void }} - State and trigger
 */

export const useViewSwitch = (view: NavigationViewName) => {
  const { notify } = useNotifications()
  const [shown, setShown] = useOptimistic(view)
  const [isSwitching, startSwitching] = useTransition()

  const switchTo = (next: NavigationViewName) =>
    startSwitching(async () => {
      setShown(next)
      await switchView(next)
      notify({
        tone: 'success',
        title: VIEW_COPY.switched(ROLE_REGISTRY.label(VIEW_ROLES[next])),
        emphasis: VIEW_COPY.switchedEmphasis,
      })
    })

  return { shown, isSwitching, switchTo }
}
