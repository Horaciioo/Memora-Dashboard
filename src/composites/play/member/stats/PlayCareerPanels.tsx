import { PlayCareerCounters } from '@/composites/play/member/stats/PlayCareerCounters'
import { PlayCareerRecord } from '@/composites/play/member/stats/PlayCareerRecord'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

/**
 * Figures and record of a player, two panels for a grid
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Totals of the player, all games or one
 * @return {JSX.Element}
 */

export const PlayCareerPanels = ({ totals }: { totals: PlayTileTotals }) => (
  <>
    <PlayPageTitle
      heading="h2"
      className={PLAY_PAGE.cell}
      isGrouped
      body={<PlayCareerCounters totals={totals} />}
    >
      {PLAY_HUB_COPY.sectionFigures}
    </PlayPageTitle>
    <PlayPageTitle
      heading="h2"
      className={PLAY_PAGE.cell}
      body={<PlayCareerRecord totals={totals} />}
    >
      {PLAY_HUB_COPY.sectionRecord}
    </PlayPageTitle>
  </>
)
