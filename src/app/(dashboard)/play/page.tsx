import type { Metadata } from 'next'
import AppLink from '@/components/elements/navigation/AppLink'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { PlayProgressCards } from '@/composites/play/member/PlayProgressCards'
import { PlayGameGrid } from '@/composites/play/hub/PlayGameGrid'
import { PlayLobbyList } from '@/composites/play/hub/PlayLobbyList'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { API_ROUTES } from '@/core/lib/api/routes'
import { listLobbies, readCatalog, readPlayPresence, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { BUTTON_STYLES, PAGE_STYLES, PLAY_HUB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

/**
 * Play home: progression, games, tables
 * @return {Promise<JSX.Element>} - Play page
 */

export default async function PlayPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables, presence] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id),
    readPlayPresence(session.id),
  ])
  const { games } = readCatalog()
  const isLocked = Boolean(presence || profile.ban)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PLAY_HUB_COPY.pageTitle} heroDescription={PLAY_HUB_COPY.hero} />
      <PlaySignal url={API_ROUTES.playSessionsStream} />

      <div className={PLAY_HUB.stack}>
        {profile.ban && <p className={PLAY_HUB.callout}>{PLAY_HUB_COPY.banned}</p>}
        {presence && (
          <div className={PLAY_HUB.callout}>
            <span>
              {fillPlayMessage(PLAY_HUB_COPY.current, { game: PLAY_GAMES.label(presence.game) })}
            </span>
            <AppLink
              href={ROUTES.playSession(presence.sessionId)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
            >
              {PLAY_HUB_COPY.resume}
            </AppLink>
          </div>
        )}

        <Section title={PLAY_HUB_COPY.sectionGames} raised>
          <PlayGameGrid games={games} isLocked={isLocked} />
        </Section>

        <Section title={PLAY_HUB_COPY.sectionLobbies} raised>
          <PlayLobbyList
            lobbies={tables.lobbies}
            isLocked={isLocked}
            empty={PLAY_HUB_COPY.noLobby}
          />
        </Section>

        {tables.running.length > 0 && (
          <Section title={PLAY_HUB_COPY.sectionRunning} raised>
            <PlayLobbyList
              lobbies={tables.running}
              isRunning
              isLocked={isLocked}
              empty={PLAY_HUB_COPY.noRunning}
            />
          </Section>
        )}

        <Section title={PLAY_HUB_COPY.sectionProgress} raised>
          <PlayProgressCards state={profile} />
        </Section>
      </div>
    </div>
  )
}
