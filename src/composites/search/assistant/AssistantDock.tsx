'use client'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { FloatingChat } from '@/composites/search/assistant/FloatingChat'
import { useRailEntries } from '@/core/hooks/interaction/layout/useRailEntries'
import { useNudgeCycle } from '@/core/hooks/interaction/state/useNudgeCycle'
import { useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_DOCK_COPY, ASSISTANT_OFFERS } from '@/declarations/assistant/offers'
import type { AssistantOffer } from '@/declarations/assistant/offers'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { FLOATING_ADD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface AssistantDockProps {
  viewContext: ViewContext
}

/**
 * Sunset glass Memora button, on every page
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element}
 */

export const AssistantDock = ({ viewContext }: AssistantDockProps) => {
  const { action, greeting, toggle, close } = useAssistantDock()
  const { session } = useAuthContext()
  const { shortcuts, groups } = useRailEntries(viewContext)
  const isOpen = greeting !== null
  // Creations of the pages the member reaches, this one apart
  const reached = new Map(
    [...shortcuts, ...groups.flatMap((group) => group.items)].map((item) => [item.href, item.icon])
  )
  const picks = Object.values<AssistantOffer>(ASSISTANT_OFFERS).flatMap((offer) => {
    const icon = reached.get(offer.href)

    // The page's own creation stays its chip, unless a guided talk exists for it
    return icon && (offer !== action?.offer || offer.scenario) ? [{ offer, icon }] : []
  })

  const nudge = useNudgeCycle(action?.offer.nudges ?? ASSISTANT_DOCK_COPY.nudges, !isOpen)

  return (
    <div
      className={FLOATING_ADD_STYLES.dock}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      {greeting && (
        <FloatingChat
          name={session?.displayName.split(' ')[0] ?? ''}
          greeting={greeting}
          action={action}
          picks={picks.slice(0, ASSISTANT_SETTINGS.maxPicks)}
          onClose={close}
        />
      )}
      <button
        type="button"
        {...action?.attributes}
        aria-expanded={isOpen}
        aria-label={action?.label ?? ASSISTANT_DOCK_COPY.label}
        onClick={toggle}
        className={cn('brain-wake', FLOATING_ADD_STYLES.root)}
      >
        {/* Memora's line takes the label's place */}
        <span
          role="status"
          className={cn(
            FLOATING_ADD_STYLES.label,
            nudge ? FLOATING_ADD_STYLES.labelOpen : FLOATING_ADD_STYLES.labelFolded
          )}
        >
          {nudge ?? action?.label ?? ASSISTANT_DOCK_COPY.label}
        </span>
        <BrainMark
          motion={nudge || isOpen ? 'loop' : 'idle'}
          className={cn('brain-mark-white', FLOATING_ADD_STYLES.icon)}
        />
      </button>
    </div>
  )
}
