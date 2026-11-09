'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { usePlaySoundStore } from '@/core/store/play/playSound'
import { PLAY_SOUND_COPY } from '@/declarations/play/sounds'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Sound key opening the volume card of a game
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game played
 * @return {JSX.Element}
 */

export const PlayVolumeKey = ({ game }: { game: PlayGameName }) => {
  const [isOpen, setOpen] = useState(false)
  const isMuted = usePlaySoundStore((state) => state.isMuted)
  const SoundIcon = isMuted ? ICONS.golfMute : ICONS.golfSound

  useEffect(() => {
    if (!isOpen) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)

    return () => window.removeEventListener('keydown', close)
  }, [isOpen])

  return (
    <div className={BAC_SESSION.keyHolder}>
      <Button
        variant="arcadeGhost"
        className={BAC_SESSION.keyButton}
        aria-label={PLAY_SOUND_COPY.game}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
      >
        <SoundIcon className={BAC_SESSION.keysIcon} aria-hidden="true" />
      </Button>
      {isOpen && (
        <div className={BAC_SESSION.volumeCard} role="dialog" aria-label={PLAY_SOUND_COPY.game}>
          <PlayVolume game={game} />
        </div>
      )}
    </div>
  )
}
