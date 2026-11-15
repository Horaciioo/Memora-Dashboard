'use client'

import { useMemo } from 'react'

import { Button } from '@/components/elements/actions/Button'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'
import { usePlayLobbyStore } from '@/core/store/play/playLobby'
import { PLAY_HUB_COPY } from '@/declarations/play'

// Template per kind of line
const COPY = { created: PLAY_HUB_COPY.createdSession }

/**
 * Feed of a lobby: who opened the table, then the host's way to configure it
 * @param {Object} props - Table
 * @param {PlayFace} props.host - Host
 * @param {string} props.createdAt - Opening time
 * @param {boolean} props.canConfigure - Reader is the host and the rules are still to choose
 * @return {JSX.Element}
 */

export const PlayLobbyFeed = ({
  host,
  createdAt,
  canConfigure,
}: {
  host: PlayFace
  createdAt: string
  canConfigure: boolean
}) => {
  const setSetupOpen = usePlayLobbyStore((state) => state.setSetupOpen)
  const players = useMemo(() => [host], [host])
  const feed = useMemo<PlayFeedLine[]>(
    () => [
      {
        id: 'created',
        kind: 'created',
        accountId: host.id,
        at: createdAt,
        values: {},
        action: canConfigure ? (
          <Button variant="arcadeSmall" onClick={() => setSetupOpen(true)}>
            {PLAY_HUB_COPY.configure}
          </Button>
        ) : undefined,
      },
    ],
    [host.id, createdAt, canConfigure, setSetupOpen]
  )

  return <PlaySessionFeed feed={feed} copy={COPY} players={players} />
}
