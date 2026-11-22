import { PlayGoldSparkles } from '@/composites/play/member/stats/PlayGoldSparkles'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { PLAY_HEAD_COPY, PLAY_PIN_MAX, PLAY_TROPHIES } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Showcase of a profile: the pinned trophies, empty slots up to the maximum
 * @param {Object} props - Pins
 * @param {string[]} props.pins - Pinned trophy keys
 * @return {JSX.Element}
 */

export const PlayPinnedTrophies = ({ pins }: { pins: string[] }) => {
  const shown = pins
    .map((key) => PLAY_TROPHIES.find((trophy) => trophy.key === key))
    .filter((trophy) => trophy !== undefined)

  if (shown.length === 0)
    return (
      <PlayEmpty icon="playTrophy" isCompact>
        {PLAY_HEAD_COPY.pinsEmpty}
      </PlayEmpty>
    )

  return (
    <ul className={PLAY_SHOWCASE.pins}>
      {Array.from({ length: PLAY_PIN_MAX }, (_, slot) => {
        const trophy = shown[slot]
        const Icon = trophy ? ICONS[trophy.icon] : undefined

        return (
          <li
            key={trophy?.key ?? `slot-${slot}`}
            className={cn(PLAY_SHOWCASE.pin, trophy && PLAY_SHOWCASE[trophy.rarity])}
          >
            {Icon ? (
              <span className={PLAY_SHOWCASE.pinIcon}>
                <Icon className={PLAY_SHOWCASE.glyph} aria-hidden="true" />
                <PlayGoldSparkles />
              </span>
            ) : (
              <span className={PLAY_SHOWCASE.pinSlot} />
            )}
            {trophy && <span className={PLAY_SHOWCASE.pinName}>{trophy.label}</span>}
          </li>
        )
      })}
    </ul>
  )
}
