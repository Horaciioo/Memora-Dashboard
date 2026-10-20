'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { useViewSwitch } from '@/core/hooks/interaction/layout/useViewSwitch'
import { isSimulated } from '@/core/lib/auth/simulation'
import { VIEW_COPY } from '@/declarations/access/copy'
import { NAVIGATION_VIEW_REGISTRY, VIEW_ROLES, VIEW_TINTS } from '@/declarations/access/views'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { SIMULATION_BLOCK } from '@/declarations/ui/blocks'
import type { ViewContext } from '@/types/access'

export interface SimulationBannerProps {
  viewContext: ViewContext
}

/**
 * Simulated view reminder, unfolds above the role switch
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element | null}
 */

export const SimulationBanner = ({ viewContext }: SimulationBannerProps) => {
  const { session } = useAuthContext()
  const { view, available } = viewContext
  const { isSwitching, switchTo } = useViewSwitch(view)
  const [shown, setShown] = useState(view)

  if (!session || !viewContext.switchable) return null

  // Widest view is the real level
  const home = available[available.length - 1]
  const isOpen = isSimulated(session) && view !== home

  // Text outlives the fold while it closes
  if (isOpen && shown !== view) setShown(view)

  return (
    <div
      className={isOpen ? SIMULATION_BLOCK.foldOpen : SIMULATION_BLOCK.fold}
      aria-hidden={!isOpen}
    >
      <div className={SIMULATION_BLOCK.clip}>
        <div
          role="status"
          className={SIMULATION_BLOCK.pill}
          style={{ '--view': VIEW_TINTS[shown] } as CSSProperties}
          title={NAVIGATION_VIEW_REGISTRY.get(shown).summary}
        >
          <span className={SIMULATION_BLOCK.text}>
            {VIEW_COPY.simulatedBanner(ROLE_REGISTRY.label(VIEW_ROLES[shown]))}
          </span>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            disabled={isSwitching}
            onClick={() => switchTo(home)}
            className={SIMULATION_BLOCK.leave}
          >
            {VIEW_COPY.simulatedLeave}
          </button>
        </div>
      </div>
    </div>
  )
}
