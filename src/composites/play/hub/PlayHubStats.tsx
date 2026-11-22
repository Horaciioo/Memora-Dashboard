import { PlayCareerCounters } from '@/composites/play/member/stats/PlayCareerCounters'
import { PlayCareerHero } from '@/composites/play/member/stats/PlayCareerHero'
import { PlayCareerRecord } from '@/composites/play/member/stats/PlayCareerRecord'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HEAD, PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

export interface PlayHubStatsProps {
  totals: PlayTileTotals
  player: { name: string; avatarUrl: string | null }
}

/**
 * Own stats of a game: rank card, figures, record
 * @param {PlayHubStatsProps} props - Totals and player
 * @return {JSX.Element}
 */

export const PlayHubStats = ({ totals, player }: PlayHubStatsProps) => (
  <>
    <PlayCareerHero totals={totals} player={player} />
    <PlayCareerCounters totals={totals} />
    <section className={PLAY_HUB.sheetGroup}>
      <h3 className={PLAY_HEAD.panelTitle}>{PLAY_HUB_COPY.sectionRecord}</h3>
      <PlayCareerRecord totals={totals} />
    </section>
  </>
)
