import type { Metadata } from 'next'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayHistory } from '@/composites/play/mobile/PlayHistory'
import { PlayHistoryFilter } from '@/composites/play/mobile/PlayHistoryFilter'
import { listPlayHistory } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HISTORY_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HISTORY, PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HISTORY_COPY.title }

interface PlayHistoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Games the player finished, filtered by game, paged by cursor
 * @param {PlayHistoryPageProps} props - Query with game and cursor
 * @return {Promise<JSX.Element>} - History page
 */

export default async function PlayHistoryPage({ searchParams }: PlayHistoryPageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const query = await searchParams
  const slug = typeof query.game === 'string' ? query.game : null
  const cursor = typeof query.cursor === 'string' ? query.cursor : null
  const game = slug ? playGameOfSlug(slug) : null
  const gameSlug = game ? PLAY_GAMES.get(game).slug : undefined
  const { entries, nextCursor } = await listPlayHistory(session.id, { game, cursor })

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle>{PLAY_HISTORY_COPY.title}</PlayPageTitle>
      <PlayHistoryFilter game={game} />
      <PlayHistory entries={entries} isFiltered={game !== null} />
      {cursor && (
        <AppLink href={ROUTES.playHistory(gameSlug)} className={PLAY_HISTORY.page}>
          {PLAY_HISTORY_COPY.newest}
        </AppLink>
      )}
      {nextCursor && (
        <AppLink href={ROUTES.playHistory(gameSlug, nextCursor)} className={PLAY_HISTORY.page}>
          {PLAY_HISTORY_COPY.older}
        </AppLink>
      )}
    </div>
  )
}
