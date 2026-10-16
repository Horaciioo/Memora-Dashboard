'use client'

import { useState } from 'react'

import { AddRow } from '@/components/structures/inline/AddRow'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { CHANNEL_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { useMenu } from '@/managers/front-end'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CreatorChannelView } from '@/types/platforms'
import { LivePlatforms } from '@/utils/constants/lives'

// Name shown for each platform
const PLATFORM_LABELS = {
  [LivePlatforms.Twitch]: CHANNEL_COPY.twitch,
  [LivePlatforms.YouTube]: CHANNEL_COPY.youtube,
}

// Glyph drawn for each platform
const PLATFORM_ICONS = {
  [LivePlatforms.Twitch]: 'twitch',
  [LivePlatforms.YouTube]: 'youtube',
} as const

// Creation form
const CHANNEL_FIELDS: FieldDefinition[] = [
  {
    name: 'platform',
    kind: 'select',
    label: CHANNEL_COPY.platform,
    required: true,
    options: Object.values(LivePlatforms).map((platform) => ({
      value: platform,
      label: PLATFORM_LABELS[platform],
    })),
  },
  {
    name: 'value',
    kind: 'text',
    label: CHANNEL_COPY.channel,
    info: CHANNEL_COPY.channelInfo,
    required: true,
  },
]

export interface CreatorChannelsPanelProps {
  youtuberId: string
  initialChannels: CreatorChannelView[]
  canManage: boolean
}

/**
 * Platform channels of a creator
 * @param {string} youtuberId - Creator
 * @param {CreatorChannelView[]} initialChannels - Channels resolved server-side
 * @param {boolean} canManage - Viewer may edit
 * @return {JSX.Element}
 */

export const CreatorChannelsPanel = ({
  youtuberId,
  initialChannels,
  canManage,
}: CreatorChannelsPanelProps) => {
  const { isSaving, issues, clearIssues, run } = useMutation()
  const { contextMenu } = useMenu()
  const [channels, setChannels] = useState(initialChannels)
  const [isAdding, setAdding] = useState(false)

  const add = async (values: FormValues): Promise<boolean> => {
    const next = await run(
      () => apiPost<CreatorChannelView[]>(API_ROUTES.creatorChannels(youtuberId), values),
      CHANNEL_COPY.saved
    )
    if (!next) return false

    setChannels(next)
    setAdding(false)
    return true
  }

  const remove = async (id: string) => {
    const next = await run(
      () => apiDelete<CreatorChannelView[]>(API_ROUTES.creatorChannels(youtuberId), { id }),
      CHANNEL_COPY.removed
    )
    if (next) setChannels(next)
  }

  return (
    <>
      <div className={CHANNEL_BLOCK.list}>
        {channels.map((channel) => {
          const Glyph = ICONS[PLATFORM_ICONS[channel.platform]]

          return (
            <div
              key={channel.id}
              className={CHANNEL_BLOCK.card}
              onContextMenu={
                canManage
                  ? contextMenu(
                      [
                        {
                          id: 'remove',
                          label: CHANNEL_COPY.remove,
                          icon: 'remove',
                          danger: true,
                          onSelect: () => void remove(channel.id),
                        },
                      ],
                      channel.login
                    )
                  : undefined
              }
            >
              <Glyph className={CHANNEL_BLOCK.glyph} />
              <div className={CHANNEL_BLOCK.body}>
                <p className={CHANNEL_BLOCK.name}>{PLATFORM_LABELS[channel.platform]}</p>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className={CHANNEL_BLOCK.link}
                >
                  {channel.url}
                </a>
              </div>
            </div>
          )
        })}
        {channels.length === 0 && !canManage && (
          <p className={CHANNEL_BLOCK.empty}>{CHANNEL_COPY.empty}</p>
        )}
        {canManage && (
          <AddRow
            label={CHANNEL_COPY.add}
            tile="channel"
            onClick={() => {
              clearIssues()
              setAdding(true)
            }}
            className="w-56! shrink-0"
          />
        )}
      </div>

      <FormDrawer
        subject={FORM_SUBJECTS.channel}
        open={isAdding}
        title={CHANNEL_COPY.add}
        fields={CHANNEL_FIELDS}
        issues={issues}
        isSaving={isSaving}
        submitVerb={ACTION_COPY.add}
        onSubmit={add}
        onClose={() => setAdding(false)}
      />
    </>
  )
}
