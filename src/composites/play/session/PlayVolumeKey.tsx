'use client'

import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { usePlaySoundStore } from '@/core/store/play/playSound'
import { PLAY_SOUND_COPY } from '@/declarations/play/sounds'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'
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

  const holderRef = useRef<HTMLDivElement>(null)
  const fold = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, holderRef, fold)

  return (
    <div ref={holderRef} className={BAC_SESSION.keyHolder}>
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
          {game === PlayGames.Naval && <NavalAutoZoomToggle />}
        </div>
      )}
    </div>
  )
}
