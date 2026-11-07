import AppLink from '@/components/elements/navigation/AppLink'
import { PlayRecords } from '@/composites/play/member/stats/PlayRecords'
import { PlayTopGames } from '@/composites/play/member/stats/PlayTopGames'
import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { PlayHistory } from '@/composites/play/mobile/PlayHistory'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_PROFILE_COPY } from '@/declarations/play'
import { PLAY_PROFILE } from '@/declarations/ui/variants'
import type { PlaySheetView } from '@/types/play'

/**
 * Most played games, records and last games of a player
 * @param {Object} props - Sheet
 * @param {PlaySheetView} props.sheet - Player sheet
 * @param {string} [props.playerId] - Another player, none for the viewer
 * @return {JSX.Element}
 */

export const PlayProfileSections = ({
  sheet,
  playerId,
}: {
  sheet: PlaySheetView
  playerId?: string
}) => (
  <>
    <PlayTopGames games={sheet.topGames} playerId={playerId} />
    <PlayRecords records={sheet.records} />
    <PlayFold title={PLAY_PROFILE_COPY.recent}>
      <PlayHistory entries={sheet.recent} isOwn={!playerId} />
      {!playerId && sheet.recent.length > 0 && (
        <AppLink href={ROUTES.playHistory()} className={PLAY_PROFILE.more}>
          {PLAY_PROFILE_COPY.recentAll}
        </AppLink>
      )}
    </PlayFold>
  </>
)
