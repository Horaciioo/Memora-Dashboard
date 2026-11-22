import { PlayGoldSparkles } from '@/composites/play/member/stats/PlayGoldSparkles'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import type { PlayTrophyProgress } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HEAD_COPY } from '@/declarations/play'
import { FILLED_ICONS, ICONS } from '@/declarations/ui/icons'
import { PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { formatNumber } from '@/utils/format/numbers'
import { cn } from '@/utils/classnames'

export interface PlayTrophyCardProps {
  trophy: PlayTrophyProgress
  // Day it was won, ISO
  wonAt?: string
  pin: { isPinned: boolean; isSaving: boolean; onToggle: () => void } | null
}

// Names of the rarities
const TIER_NAMES = {
  common: PLAY_HEAD_COPY.rarityCommon,
  rare: PLAY_HEAD_COPY.rarityRare,
  legendary: PLAY_HEAD_COPY.rarityLegendary,
} as const

// Short French day, fixed zone so the server and the browser agree
const dayOf = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Paris',
  })

/**
 * One trophy: glyph, name, goal, then the day and rarity once won, or progress while locked
 * @param {PlayTrophyCardProps} props - Trophy, rarity, day and pin controls
 * @return {JSX.Element}
 */

export const PlayTrophyCard = ({ trophy, wonAt, pin }: PlayTrophyCardProps) => {
  const isHidden = Boolean(trophy.hint) && !trophy.reached
  const Icon = isHidden
    ? ICONS.lock
    : (trophy.reached && FILLED_ICONS[trophy.icon]) || ICONS[trophy.icon]
  const Pin = ICONS.playStar

  return (
    <li
      className={cn(
        PLAY_SHOWCASE.card,
        PLAY_SHOWCASE[trophy.rarity],
        trophy.reached && PLAY_SHOWCASE.cardOn,
        trophy.reached && trophy.rarity === 'legendary' && PLAY_SHOWCASE.cardLegend,
        !trophy.reached && !trophy.share && PLAY_SHOWCASE.cardIdle
      )}
    >
      <span className={cn(PLAY_SHOWCASE.icon, trophy.reached && PLAY_SHOWCASE.iconOn)}>
        <Icon
          className={cn(
            PLAY_SHOWCASE.glyph,
            trophy.reached && trophy.rarity === 'legendary' && PLAY_SHOWCASE.glyphLegend
          )}
          aria-hidden="true"
        />
        {trophy.reached && trophy.rarity === 'legendary' && <PlayGoldSparkles />}
      </span>
      <span className={PLAY_SHOWCASE.text}>
        <span className={cn(PLAY_SHOWCASE.tierLine, trophy.reached && PLAY_SHOWCASE.tierOn)}>
          {TIER_NAMES[trophy.rarity]}
        </span>
        <span className={cn(PLAY_SHOWCASE.name, trophy.reached && PLAY_SHOWCASE.nameOn)}>
          {isHidden ? PLAY_HEAD_COPY.secretName : trophy.label}
        </span>
        <span className={cn(PLAY_SHOWCASE.goal, trophy.reached && PLAY_SHOWCASE.goalOn)}>
          {isHidden ? trophy.hint : trophy.goal}
        </span>
        {trophy.reached
          ? wonAt && (
              <span className={cn(PLAY_SHOWCASE.wonRow, PLAY_SHOWCASE.wonRowOn)}>
                {fillPlayMessage(PLAY_HEAD_COPY.wonOn, { date: dayOf(wonAt) })}
              </span>
            )
          : !isHidden && (
              <span className={PLAY_SHOWCASE.progress}>
                <PlayLevelBar share={trophy.share * 100} isThin />
                <span className={PLAY_SHOWCASE.progressValue}>
                  {fillPlayMessage(PLAY_HEAD_COPY.progress, {
                    value: formatNumber(trophy.value),
                    target: formatNumber(trophy.target),
                  })}
                </span>
              </span>
            )}
      </span>
      {pin && (
        <button
          type="button"
          disabled={pin.isSaving}
          aria-pressed={pin.isPinned}
          aria-label={pin.isPinned ? PLAY_HEAD_COPY.unpin : PLAY_HEAD_COPY.pin}
          title={pin.isPinned ? PLAY_HEAD_COPY.unpin : PLAY_HEAD_COPY.pin}
          className={cn(PLAY_SHOWCASE.pinKey, pin.isPinned && PLAY_SHOWCASE.pinKeyOn)}
          onClick={pin.onToggle}
        >
          <Pin className={PLAY_SHOWCASE.pinGlyph} aria-hidden="true" />
        </button>
      )}
    </li>
  )
}
