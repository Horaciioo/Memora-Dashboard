'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import { usePresence } from '@/core/hooks/data/realtime'
import { PlayPlaceStates, writePlayPlace } from '@/core/lib/play/presenceState'
import { matchPlaySessionPath } from '@/core/lib/play/sessionPath'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import type { PresenceMember } from '@/types/presence'

const PlayOnlineContext = createContext<PresenceMember[]>([])

/**
 * Seats every Play tab in one room, reporting playing or watching a game
 * @param {Object} props - Room
 * @param {string | null} props.sessionId - Game the player sits at
 * @param {ReactNode} props.children - Play
 * @return {JSX.Element}
 */

export const PlayOnlineProvider = ({
  sessionId,
  children,
}: {
  sessionId: string | null
  children: ReactNode
}) => {
  const viewed = matchPlaySessionPath(usePathname())
  // Seated anywhere counts as playing, an open foreign game as watching
  const place = sessionId
    ? writePlayPlace(PlayPlaceStates.Playing, sessionId)
    : viewed && writePlayPlace(PlayPlaceStates.Watching, viewed)
  const { members } = usePresence(PLAY_TOPICS.lobbies, place)

  return (
    <PlayOnlineContext.Provider value={members.filter((member) => member.status !== 'left')}>
      {children}
    </PlayOnlineContext.Provider>
  )
}

/**
 * Other players in Play right now
 * @return {PresenceMember[]} - Online players
 */

export const usePlayOnline = (): PresenceMember[] => useContext(PlayOnlineContext)
