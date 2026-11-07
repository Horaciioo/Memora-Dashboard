'use client'

import { useEffect, useRef } from 'react'

import { startAmbience } from '@/composites/play/naval/audio/ambience'
import type { NavalAmbience } from '@/composites/play/naval/audio/ambience'
import { cueEliminated, cueSonar } from '@/composites/play/naval/audio/cues'
import type { NavalEvent } from '@/composites/play/naval/useNavalPlayback'
import { useNavalAudioStore } from '@/core/store/navalAudio'

/**
 * Sea bed, tension, sonar on the viewer's turn and the bell for a fleet gone down
 * @param {Object} input - Table
 * @param {boolean} input.isMyTurn - The viewer may fire
 * @param {number} input.tension - Danger, zero to one
 * @param {NavalEvent | null} input.event - Last shot shown
 * @return {void}
 */

export const useNavalCues = ({
  isMyTurn,
  tension,
  event,
}: {
  isMyTurn: boolean
  tension: number
  event: NavalEvent | null
}): void => {
  const ambience = useRef<NavalAmbience | null>(null)
  const hasAmbience = useNavalAudioStore((state) => state.hasAmbience)
  const wasMine = useRef(false)

  // Sea bed for the whole battle
  useEffect(() => {
    ambience.current = startAmbience()

    return () => ambience.current?.stop()
  }, [])

  // Tension follows the danger
  useEffect(() => ambience.current?.update(hasAmbience ? tension : 0), [tension, hasAmbience])

  // Sonar once, when the turn comes round
  useEffect(() => {
    if (isMyTurn && !wasMine.current) cueSonar()
    wasMine.current = isMyTurn
  }, [isMyTurn])

  // Bell for a captain out
  const eliminatedId = event?.isEliminated ? event.id : 0
  useEffect(() => {
    if (eliminatedId) cueEliminated()
  }, [eliminatedId])
}
