'use client'

import { useState } from 'react'

import { InlineText } from '@/components/structures/InlineText'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { SECURITY_LIST } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { CreatorChannelView } from '@/types/platforms'

// Longest Twitch login
const CHANNEL_LOGIN_MAX = 25

export interface CreatorChannelsPanelProps {
  youtuberId: string
  initialTwitch: CreatorChannelView | null
  canManage: boolean
}

/**
 * Platform channels of a creator, edited in place
 * @param {string} youtuberId - Creator
 * @param {CreatorChannelView | null} initialTwitch - Twitch channel
 * @param {boolean} canManage - Viewer may edit
 * @return {JSX.Element}
 */

export const CreatorChannelsPanel = ({
  youtuberId,
  initialTwitch,
  canManage,
}: CreatorChannelsPanelProps) => {
  const { run } = useMutation()
  const [twitch, setTwitch] = useState(initialTwitch)
  const Glyph = ICONS.twitch

  const save = async (login: string): Promise<boolean> => {
    const next = await run(
      () => apiPut<CreatorChannelView | null>(API_ROUTES.creatorChannel(youtuberId), { login }),
      CHANNEL_COPY.saved
    )
    // A failure already told the member
    if (next === null) return false

    setTwitch(next)
    return true
  }

  return (
    <ul className={SECURITY_LIST.list}>
      <li className={SECURITY_LIST.row}>
        <Glyph className={SECURITY_LIST.glyph} />
        <div className={SECURITY_LIST.body}>
          <p className={SECURITY_LIST.title}>{CHANNEL_COPY.twitch}</p>
          <InlineText
            id="creator-twitch-channel"
            value={twitch?.login ?? ''}
            placeholder={CHANNEL_COPY.placeholder}
            disabled={!canManage}
            maxLength={CHANNEL_LOGIN_MAX}
            onCommit={save}
          />
        </div>
      </li>
    </ul>
  )
}
