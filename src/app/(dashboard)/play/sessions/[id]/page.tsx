import { cn } from '@/utils/classnames'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayLobby } from '@/composites/play/hub/lobby/PlayLobby'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayChatBubble } from '@/composites/play/session/PlayChatBubble'
import { PlaySessionRoom } from '@/composites/play/session/PlaySessionRoom'
import { PLAY_SESSION_TABLES } from '@/composites/play/session/sessionTables'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { inviteCandidates, listMessages, listSpectators, readSession } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HUB_COPY, playKeysOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, PLAY_HUB, PLAY_ROOM } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { PLAY_OPEN_STATUSES, PlayStatuses } from '@/utils/constants/play'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

interface PlaySessionPageProps {
  params: Promise<{ id: string }>
}

// Heading under the title, by stage
const STAGE_COPY: Record<string, string> = {
  [PlayStatuses.Lobby]: PLAY_HUB_COPY.lobbyWaiting,
  [PlayStatuses.Running]: PLAY_HUB_COPY.lobbyRunning,
}

/**
 * One game: logo and stage, divider, then its table
 * @param {PlaySessionPageProps} props - Game id
 * @return {Promise<JSX.Element>} - Game page
 */

export default async function PlaySessionPage({ params }: PlaySessionPageProps) {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const { id } = await params
  // Chat read beside the game, shown only once the game lets the reader in
  const [game, messages] = await Promise.all([
    readSession(id, session.id, access.can(Permissions.PlayManage)).catch(() => null),
    listMessages(id).catch(() => []),
  ])
  if (!game) notFound()

  const meta = PLAY_GAMES.get(game.game)
  const isLobby = game.status === PlayStatuses.Lobby
  const canInvite = game.me.isSeated && PLAY_OPEN_STATUSES.includes(game.status)
  const candidates = canInvite
    ? await inviteCandidates(
        game.seats.filter((seat) => !seat.hasLeft).map((seat) => seat.accountId),
        session.id
      )
    : []
  const BackIcon = ICONS.playBack
  const title = STAGE_COPY[game.status] ?? PLAY_HUB_COPY.lobbyFinished
  const chat = {
    sessionId: id,
    messages,
    seats: game.seats.map(({ accountId, hasLeft, isHost }) => ({ accountId, hasLeft, isHost })),
    table: {
      gameSlug: meta.slug,
      status: game.status,
      viewerId: session.id,
      isViewerHost: game.me.isHost,
    },
    invite: canInvite ? { candidates, canSeat: isLobby } : null,
  }

  // Finished single games can be replayed, tournament ones lead to the next game
  const { tournament } = game
  const replay =
    game.status === PlayStatuses.Finished
      ? {
          canReplay: !tournament,
          rematch: tournament ? null : game.rematch,
          tournament: tournament && {
            index: tournament.index,
            gamesCount: tournament.gamesCount,
            nextId: tournament.nextId,
          },
        }
      : null

  // Started game with its own table
  const drawTable = PLAY_SESSION_TABLES[game.game]
  if (!isLobby && game.board !== null && drawTable) {
    const faceOf = ({
      accountId,
      name,
      avatarUrl,
      color,
      isHost,
      botKind,
    }: (typeof game.seats)[number]) => ({
      id: accountId,
      name,
      avatarUrl,
      color,
      isHost,
      isBot: Boolean(botKind),
    })
    const players = game.seats.filter((seat) => !seat.hasLeft).map(faceOf)
    const spectators = listSpectators(
      id,
      players.map((player) => player.id)
    ).map(({ id: accountId, displayName, avatarUrl }) => ({
      id: accountId,
      name: displayName,
      avatarUrl,
    }))
    const table = drawTable({
      sessionId: id,
      board: game.board,
      players,
      seats: game.seats.map(faceOf),
      spectators,
      viewerId: session.id,
      me: game.me,
      canInspect: access.can(Permissions.PlayManage),
    })

    return (
      <div className={meta.ground ?? undefined} style={playKeysOf(game.game)}>
        <PlaySignal topic={PLAY_TOPICS.session(id)} />
        <PlaySessionRoom
          game={game.game}
          gameLabel={meta.label}
          gameSlug={meta.slug}
          title={title}
          players={players}
          spectators={spectators}
          me={game.me}
          chat={chat}
          feed={table.feed}
          replay={replay}
        >
          {table.board}
        </PlaySessionRoom>
      </div>
    )
  }

  return (
    <div className={meta.ground ?? undefined} style={playKeysOf(game.game)}>
      <PlaySignal topic={PLAY_TOPICS.session(id)} />

      <div className={BAC_SESSION.page}>
        <div className={PLAY_ROOM.main}>
          <header className={PLAY_ROOM.head}>
            <PlayGameLogo game={game.game} className={PLAY_ROOM.logo} />
            <h1 className={PLAY_HUB.srOnly}>{title}</h1>
            <AppLink href={ROUTES.playGame(meta.slug)} className={cn(PLAY_ROOM.back, 'lg:hidden')}>
              <BackIcon className={PLAY_HUB.backIcon} aria-hidden="true" />
              {PLAY_HUB_COPY.backToHub}
            </AppLink>
          </header>

          <div className={PLAY_ROOM.center}>
            <PlayLobby
              id={game.id}
              gameSlug={meta.slug}
              status={game.status}
              minPlayers={game.minPlayers}
              maxPlayers={meta.maxPlayers}
              seats={game.seats}
              candidates={candidates}
              viewerId={session.id}
              me={game.me}
              game={game.game}
              serverTime={game.serverTime}
              visibility={game.visibility}
              joinCode={game.joinCode}
              rules={{
                settings: game.settings,
                tournamentGames: game.tournament?.gamesCount ?? null,
              }}
            />
          </div>
        </div>

        <PlayChatBubble
          chat={chat}
          above={
            <AppLink href={ROUTES.playGame(meta.slug)} className={PLAY_ROOM.back}>
              <BackIcon className={PLAY_HUB.backIcon} aria-hidden="true" />
              {PLAY_HUB_COPY.backToHub}
            </AppLink>
          }
        />
      </div>
    </div>
  )
}
