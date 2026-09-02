'use client'

import { useTransition, type ReactNode } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { pickCreator } from '@/app/(dashboard)/actions'
import { VIEW_COPY } from '@/declarations/access/copy'
import { CREATOR_PICKER } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import type { CreatorLead } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface CreatorPickerProps {
  creators: CreatorLead[]
  activeYoutuberId: string | null
  // A sheet has room for a heading, the rail strip has not
  labelled?: boolean
  // Sits beside the heading, e.g. a maturity tag
  labelSlot?: ReactNode
  onPicked?: () => void
}

/**
 * Portraits laid out side by side, the dead screen standing for no creator at all
 * @param {CreatorLead[]} creators - Creators the member may pick between
 * @param {string | null} activeYoutuberId - Creator the view is narrowed to
 * @param {boolean} [labelled] - Renders the heading above the portraits
 * @param {ReactNode} [labelSlot] - Node placed next to the heading
 * @param {() => void} [onPicked] - Called once a choice is made
 * @return {JSX.Element}
 */

export const CreatorPicker = ({
  creators,
  activeYoutuberId,
  labelled,
  labelSlot,
  onPicked,
}: CreatorPickerProps) => {
  const [isPicking, startPicking] = useTransition()
  const OffIcon = ICONS.youtuberNone

  const pick = (youtuberId: string | null) => {
    onPicked?.()
    startPicking(() => void pickCreator(youtuberId))
  }

  return (
    <div className={CREATOR_PICKER.wrapper}>
      {labelled && (
        <div className={CREATOR_PICKER.head}>
          <p className={CREATOR_PICKER.label}>{VIEW_COPY.activeCreator}</p>
          {labelSlot}
        </div>
      )}

      <div className={CREATOR_PICKER.list}>
        <button
          type="button"
          disabled={isPicking}
          title={VIEW_COPY.noCreator}
          aria-label={VIEW_COPY.noCreator}
          aria-pressed={activeYoutuberId === null}
          onClick={() => pick(null)}
          className={cn(
            CREATOR_PICKER.option,
            activeYoutuberId === null ? CREATOR_PICKER.optionActive : CREATOR_PICKER.optionIdle
          )}
        >
          <OffIcon className={CREATOR_PICKER.optionIcon} aria-hidden="true" />
        </button>

        {creators.map((creator) => {
          const isActive = creator.id === activeYoutuberId

          return (
            <button
              key={creator.id}
              type="button"
              disabled={isPicking}
              title={creator.name}
              aria-label={creator.name}
              aria-pressed={isActive}
              style={accentVars(creator.accent, 'brand')}
              onClick={() => pick(creator.id)}
              className={cn(
                CREATOR_PICKER.option,
                isActive ? CREATOR_PICKER.optionActive : CREATOR_PICKER.optionIdle
              )}
            >
              <Avatar name={creator.name} src={creator.avatarUrl} size="md" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
