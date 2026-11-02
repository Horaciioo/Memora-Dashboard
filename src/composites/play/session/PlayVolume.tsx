'use client'

import { usePlaySoundStore, volumeOf } from '@/core/store/playSound'
import { PLAY_SOUND_COPY, PLAY_VOLUME } from '@/declarations/play/sounds'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_VOLUME_UI } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Mute key and slider, for one game or for the global level
 * @param {Object} props - Volume
 * @param {PlayGameName} [props.game] - Game, the global level without one
 * @return {JSX.Element}
 */

export const PlayVolume = ({ game }: { game?: PlayGameName }) => {
  const { isMuted, toggle, setMaster, setGame, followMaster } = usePlaySoundStore()
  const volume = usePlaySoundStore((state) => (game ? volumeOf(state, game) : state.master))
  const isOwn = usePlaySoundStore((state) => game !== undefined && state.games[game] !== undefined)
  const SoundIcon = isMuted ? ICONS.golfMute : ICONS.golfSound

  return (
    <>
      <div className={PLAY_VOLUME_UI.row}>
        <button
          type="button"
          className={PLAY_VOLUME_UI.mute}
          aria-label={isMuted ? PLAY_SOUND_COPY.unmute : PLAY_SOUND_COPY.mute}
          aria-pressed={isMuted}
          onClick={toggle}
        >
          <SoundIcon className={PLAY_VOLUME_UI.icon} aria-hidden="true" />
        </button>
        <input
          type="range"
          className={PLAY_VOLUME_UI.slider}
          aria-label={PLAY_SOUND_COPY.volume}
          min={0}
          max={1}
          step={PLAY_VOLUME.step}
          value={isMuted ? 0 : volume}
          onChange={(event) => {
            const level = Number(event.target.value)
            if (game) setGame(game, level)
            else setMaster(level)
          }}
        />
      </div>
      {game &&
        (isOwn ? (
          <button
            type="button"
            className={PLAY_VOLUME_UI.follow}
            onClick={() => followMaster(game)}
          >
            {PLAY_SOUND_COPY.follow}
          </button>
        ) : (
          <span className={PLAY_VOLUME_UI.followed}>{PLAY_SOUND_COPY.followed}</span>
        ))}
    </>
  )
}
