'use client'

import { useTransition } from 'react'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { pickCreator } from '@/app/(dashboard)/actions'
import { VIEW_COPY } from '@/declarations/access/copy'
import { CREATOR_SELECT } from '@/declarations/ui/blocks'
import type { CreatorLead } from '@/types/access'

export interface CreatorSelectProps {
  creators: CreatorLead[]
  activeYoutuberId: string | null
}

/**
 * Creator picker
 * @param {CreatorLead[]} creators - Creators the member may pick between
 * @param {string | null} activeYoutuberId - Creator the view is narrowed to
 * @return {JSX.Element}
 */

export const CreatorSelect = ({ creators, activeYoutuberId }: CreatorSelectProps) => {
  const [isPicking, startPicking] = useTransition()

  return (
    <div className={CREATOR_SELECT.wrapper}>
      <p className={CREATOR_SELECT.label}>{VIEW_COPY.activeCreator}</p>
      <SelectMenu
        id="rail-creator"
        value={activeYoutuberId ?? ''}
        // The channel handle earns nothing here, the portrait and the name carry the choice
        options={creators.map((creator) => ({
          value: creator.id,
          label: creator.name,
          accent: creator.accent ?? undefined,
          image: creator.avatarUrl,
        }))}
        label={VIEW_COPY.activeCreator}
        emptyLabel={VIEW_COPY.noCreator}
        placeholder={VIEW_COPY.noCreator}
        mark="avatar"
        size="large"
        disabled={isPicking}
        onChange={(id) => startPicking(() => void pickCreator(id || null))}
      />
    </div>
  )
}
