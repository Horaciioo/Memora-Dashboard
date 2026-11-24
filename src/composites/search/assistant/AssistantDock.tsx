'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { useRailEntries } from '@/core/hooks/interaction/layout/useRailEntries'
import { URGENT_SCENARIO, useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_OFFERS } from '@/declarations/assistant/offers'
import type { AssistantOffer } from '@/declarations/assistant/offers'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { FLOATING_ADD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Loaded when the chat opens
const FloatingChat = dynamic(
  () => import('@/composites/search/assistant/FloatingChat').then((module) => module.FloatingChat),
  { ssr: false }
)

export interface AssistantDockProps {
  viewContext: ViewContext
}

/**
 * Corner chat of Memora, opened from the search
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element}
 */

export const AssistantDock = ({ viewContext }: AssistantDockProps) => {
  const { action, focus, greeting, hello, close } = useAssistantDock()
  const { session } = useAuthContext()
  const { shortcuts, groups } = useRailEntries(viewContext)
  const isOpen = greeting !== null
  // Memora Intelligence holds her chat on the page itself, no corner chat there
  const isIntelligence = usePathname() === ROUTES.intelligence
  const dockRef = useRef<HTMLDivElement>(null)
  useOutsideDismiss(isOpen, dockRef, close)
  // Creations of the pages the member reaches, this one apart
  const reached = new Map(
    [...shortcuts, ...groups.flatMap((group) => group.items)].map((item) => [item.href, item.icon])
  )
  const picks = Object.values<AssistantOffer>(ASSISTANT_OFFERS).flatMap((offer) => {
    const icon = reached.get(offer.href)

    // The page's own creation stays its chip, unless a guided talk exists for it
    return icon && (offer !== action?.offer || offer.scenario) ? [{ offer, icon }] : []
  })

  if (isIntelligence) return null

  return (
    <div
      ref={dockRef}
      className={cn(
        FLOATING_ADD_STYLES.dock,
        focus?.scenario === URGENT_SCENARIO && FLOATING_ADD_STYLES.alert
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      {greeting && hello && (
        <FloatingChat
          name={session?.displayName.split(' ')[0] ?? ''}
          hello={hello}
          greeting={greeting}
          action={action}
          picks={picks.slice(0, ASSISTANT_SETTINGS.maxPicks)}
          onClose={close}
        />
      )}
    </div>
  )
}
