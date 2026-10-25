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
 * @return {JSX.Element}
 */

export const PlayTrophies = ({ global }: { global: PlayProfileView['global'] }) => (
  <section className={PLAY_STATS.section}>
    <h2 className={PLAY_STATS.heading}>{PLAY_HUB_COPY.sectionTrophies}</h2>
    <div className={PLAY_STATS.trophies}>
      {trophiesOf(global).map((trophy) => {
        const Icon = ICONS[trophy.icon]

        return (
          <div
            key={trophy.label}
            className={cn(PLAY_STATS.trophy, trophy.reached && PLAY_STATS.trophyOn)}
          >
            <span className={cn(PLAY_STATS.trophyIcon, trophy.reached && PLAY_STATS.trophyIconOn)}>
              <Icon className={PLAY_STATS.glyph} aria-hidden="true" />
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
  </section>
)
