'use client'

import { useCallback, useRef, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { CreatorPicker } from '@/composites/shell/CreatorPicker'
import { useOutsideDismiss } from '@/core/hooks/interaction/useOutsideDismiss'
import { VIEW_COPY } from '@/declarations/access/copy'
import { CREATOR_SWITCH } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { CreatorLead } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface CreatorSwitchProps {
  creators: CreatorLead[]
  activeYoutuberId: string | null
}

/**
 * Trigger wearing the creator on screen, the strip of the others unfurling leftward
 * out of the rail and folding back on a second press
 * @param {CreatorLead[]} creators - Creators the member may pick between
 * @param {string | null} activeYoutuberId - Creator the view is narrowed to
 * @return {JSX.Element}
 */

export const CreatorSwitch = ({ creators, activeYoutuberId }: CreatorSwitchProps) => {
  const [isOpen, setOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  const OffIcon = ICONS.youtuberNone

  const shut = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, boundary, shut)

  const active = creators.find((creator) => creator.id === activeYoutuberId) ?? null
  const label = active?.name ?? VIEW_COPY.noCreator

  return (
    <div ref={boundary} className={CREATOR_SWITCH.wrapper}>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
        className={CREATOR_SWITCH.trigger}
      >
        {active ? (
          <Avatar name={active.name} src={active.avatarUrl} size="md" />
        ) : (
          <OffIcon className={CREATOR_SWITCH.triggerIcon} aria-hidden="true" />
        )}
      </button>

      <div
        className={cn(
          CREATOR_SWITCH.panel,
          isOpen ? CREATOR_SWITCH.panelOpen : CREATOR_SWITCH.panelShut
        )}
      >
        <CreatorPicker creators={creators} activeYoutuberId={activeYoutuberId} onPicked={shut} />
      </div>
    </div>
  )
}
