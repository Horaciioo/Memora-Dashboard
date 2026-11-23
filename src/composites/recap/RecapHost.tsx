'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { RecapGuideHost } from '@/composites/recap/RecapGuideHost'
import { useRecapPresence } from '@/core/hooks/data/system/useRecapPresence'
import { varied } from '@/core/lib/assistant/variants'
import { useAssistantDock } from '@/core/store/assistantDock'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_VARIANTS } from '@/declarations/assistant/variants/recap'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Welcomes the member back, the recap waits as a deck on Memora Intelligence
 * @return {JSX.Element}
 */

export const RecapHost = () => {
  useRecapPresence()
  const router = useRouter()
  const pathname = usePathname()
  const recap = useRecapStore((state) => state.recap)

  // A recap asked by hand leads to the page, one met on arrival is only told about
  useEffect(() => {
    if (!recap || pathname === ROUTES.intelligence) return

    if (useRecapStore.getState().isManual) {
      router.push(ROUTES.intelligence)

      return
    }

    const say = useAssistantDock.getState().say
    say(varied('recap.waiting', RECAP_VARIANTS.waiting))
    const timer = window.setTimeout(
      () => say(null),
      ASSISTANT_SETTINGS.nudgeShowSeconds * SECOND_MS
    )

    return () => window.clearTimeout(timer)
    // Only a new recap speaks, moving about the app does not
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recap])

  return <RecapGuideHost />
}
