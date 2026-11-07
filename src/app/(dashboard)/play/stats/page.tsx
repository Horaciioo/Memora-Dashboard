import type { Metadata } from 'next'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayProfileSections } from '@/composites/play/member/stats/PlayProfileSections'
import { PlayPlayerCard } from '@/composites/play/member/stats/PlayPlayerCard'
import { PlayStatTiles } from '@/composites/play/member/stats/PlayStatTiles'
import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { PlayHistory } from '@/composites/play/mobile/PlayHistory'
import { listPlayHistory, readPlayProfile, readPlaySheet } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HISTORY_COPY, PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HISTORY, PLAY_HUB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.statsTitle }

// Query value of the history section
const HISTORY = 'historique'

interface PlayStatsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Every figure of the player, or the games already played
 * @param {PlayStatsPageProps} props - Query with the section
 * @return {Promise<JSX.Element>} - Stats page
 */

export default async function PlayStatsPage({ searchParams }: PlayStatsPageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const isHistory = (await searchParams).tab === HISTORY
  const [profile, sheet, history] = await Promise.all([
    readPlayProfile(session.id),
    isHistory ? Promise.resolve(null) : readPlaySheet(session.id),
    isHistory ? listPlayHistory(session.id) : Promise.resolve(null),
  ])
  const tab = (href: string, label: string, isOn: boolean) => (
    <AppLink
      href={href}
      aria-current={isOn ? 'page' : undefined}
      className={cn(PLAY_HISTORY.tab, isOn && PLAY_HISTORY.tabOn)}
    >
      {label}
    </AppLink>
  )

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle>
        {isHistory ? PLAY_MOBILE_COPY.tabStatsFull : PLAY_HUB_COPY.statsTitle}
      </PlayPageTitle>
      <nav aria-label={PLAY_MOBILE_COPY.statsTabs} className={PLAY_HISTORY.tabs}>
        {tab(ROUTES.playStats, PLAY_MOBILE_COPY.statsProfile, !isHistory)}
        {tab(ROUTES.playStatsHistory, PLAY_MOBILE_COPY.statsHistory, isHistory)}
      </nav>
      {isHistory ? (
        <>
          <PlayHistory entries={history?.entries ?? []} />
          {history?.nextCursor && (
            <AppLink href={ROUTES.playHistory()} className={PLAY_HISTORY.page}>
              {PLAY_HISTORY_COPY.older}
            </AppLink>
          )}
        </>
      ) : (
        <>
          <PlayPlayerCard
            totals={profile.global}
            player={{ name: session.displayName, avatarUrl: session.avatarUrl }}
          />
          <PlayFold title={PLAY_MOBILE_COPY.statsFigures}>
            <PlayStatTiles totals={profile.global} />
          </PlayFold>
          {sheet && <PlayProfileSections sheet={sheet} />}
          <PlayGameLevels games={profile.games} />
        </>
      )}
    </div>
  )
}
