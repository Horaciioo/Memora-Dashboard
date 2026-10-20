'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { NetworkLogo } from '@/components/elements/display/marks/NetworkLogo'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { CHANNEL_LINK_PREFIX } from '@/declarations/platforms/channels'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { platformLogoOf } from '@/declarations/platforms/logos'
import { CHANNEL_BLOCK, SECURITY_LIST } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
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

// Creation form
const CHANNEL_FIELDS: FieldDefinition[] = [
  {
    name: 'platform',
    kind: 'select',
    label: CHANNEL_COPY.platform,
    required: true,
    mark: 'network',
    options: Object.values(LivePlatforms).map((platform) => ({
      value: platform,
      label: PLATFORM_LABELS[platform],
      prefix: CHANNEL_LINK_PREFIX[platform],
    })),
  },
  {
    name: 'value',
    kind: 'text',
    label: CHANNEL_COPY.channel,
    info: CHANNEL_COPY.channelInfo,
    placeholder: CHANNEL_COPY.channelPlaceholder,
    required: true,
    prefixFrom: 'platform',
    noLookup: true,
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
      <ul className={SECURITY_LIST.list}>
        {channels.map((channel) => {
          const key = channel.platform.toLowerCase()

          return (
            <li
              key={channel.id}
              className={SECURITY_LIST.row}
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
              <NetworkLogo network={key} className={SECURITY_LIST.glyph} />
              <div className={SECURITY_LIST.body}>
                <p className={SECURITY_LIST.title}>{PLATFORM_LABELS[channel.platform]}</p>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className={SECURITY_LIST.link}
                  style={{ color: platformLogoOf(key)?.paint }}
                >
                  {channel.url}
                </a>
              </div>
            </li>
          )
        })}
      </ul>
      {channels.length === 0 && !canManage && (
        <p className={CHANNEL_BLOCK.empty}>{CHANNEL_COPY.empty}</p>
      )}
      {canManage && (
        <div className={SECURITY_LIST.footer}>
          <Button
            variant="secondary"
            icon="add"
            onClick={() => {
              clearIssues()
              setAdding(true)
            }}
          >
            {CHANNEL_COPY.add}
          </Button>
        </div>
      )}

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
