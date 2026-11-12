import { PlayGoldSparkles } from '@/composites/play/member/stats/PlayGoldSparkles'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { PLAY_HUB_COPY, trophiesOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Trophies, won ones in gold, others with their bar
 * @param {Object} props - Totals
 * @param {PlayProfileView['global']} props.global - Global totals
 * @param {boolean} [props.isBare] - No heading
 * @return {JSX.Element}
 */

export const PlayTrophies = ({
  global,
  isBare = false,
}: {
  global: PlayProfileView['global']
  // Without section and heading, inside another box
  isBare?: boolean
}) => (
  <section className={isBare ? undefined : PLAY_STATS.section}>
    {!isBare && <h2 className={PLAY_STATS.heading}>{PLAY_HUB_COPY.sectionTrophies}</h2>}
    <div className={PLAY_STATS.trophiesBox}>
      <div className={PLAY_STATS.trophies}>
        {trophiesOf(global).map((trophy) => {
          const Icon = ICONS[trophy.icon]

          return (
            <div
              key={trophy.label}
              className={cn(
                PLAY_STATS.trophy,
                trophy.reached && PLAY_STATS.trophyOn,
                !trophy.reached && !trophy.share && PLAY_STATS.trophyIdle
              )}
            >
              <span
                className={cn(PLAY_STATS.trophyIcon, trophy.reached && PLAY_STATS.trophyIconOn)}
              >
                <Icon className={PLAY_STATS.glyph} aria-hidden="true" />
                {trophy.reached && <PlayGoldSparkles />}
              </span>
              <span className={PLAY_STATS.trophyText}>
                <span className={PLAY_STATS.trophyName}>{trophy.label}</span>
                <span className={PLAY_STATS.trophyGoal}>{trophy.goal}</span>
                {!trophy.reached && <PlayLevelBar share={trophy.share * 100} isThin />}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  </section>
)
