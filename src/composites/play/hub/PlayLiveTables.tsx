'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_FOLLOW_COPY, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_LIVE } from '@/declarations/ui/variants'
import type { PlayLobbyCard } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayStatuses } from '@/utils/constants/play'

// Faces drawn before the +n
const SHOWN_FACES = 4

export interface PlayLiveTablesProps {
  title: string
  empty: string
  tables: PlayLobbyCard[]
  // Game the reader sits in
  mineId?: string | null
  isLocked: boolean
  // Game hubs leave the game name out
  hasGame?: boolean
  className?: string
}

/**
 * Tables being played: who sits there, join or watch
 * @param {PlayLiveTablesProps} props - Tables
 * @return {JSX.Element}
 */

export const PlayLiveTables = ({
  title,
  empty,
  tables,
  mineId,
  isLocked,
  hasGame,
  className,
}: PlayLiveTablesProps) => {
  const router = useRouter()
  const moves = usePlayMoves()

  return (
    <section className={cn(PLAY_LIVE.box, className)} aria-label={title}>
      <header className={PLAY_LIVE.head}>
        <span className={PLAY_LIVE.pulse} aria-hidden="true" />
        <h2 className={PLAY_LIVE.title}>{title}</h2>
      </header>

      {tables.length === 0 && <p className={PLAY_LIVE.empty}>{empty}</p>}
      <div className={PLAY_LIVE.list}>
        {tables.map((table) => {
          const isMine = table.id === mineId
          const isRunning = table.status === PlayStatuses.Running
          const isFull = table.players >= table.maxPlayers
          const extra = table.faces.length - SHOWN_FACES

          return (
            <article key={table.id} className={cn(PLAY_LIVE.card, isMine && PLAY_LIVE.cardMine)}>
              <div className={PLAY_LIVE.top}>
                {hasGame && <PlayGameLogo game={table.game} className={PLAY_LIVE.logo} />}
                <div className={PLAY_LIVE.text}>
                  <span className={PLAY_LIVE.name}>
                    {hasGame
                      ? PLAY_GAMES.label(table.game)
                      : fillPlayMessage(PLAY_HUB_COPY.hostedBy, { host: table.hostName ?? '' })}
                  </span>
                  <span className={cn(PLAY_LIVE.stage, isRunning && PLAY_LIVE.stageLive)}>
                    {isMine
                      ? PLAY_HUB_COPY.liveMine
                      : isRunning
                        ? PLAY_HUB_COPY.liveRunning
                        : PLAY_HUB_COPY.liveWaiting}
                    {hasGame &&
                      ` · ${fillPlayMessage(PLAY_HUB_COPY.hostedBy, { host: table.hostName ?? '' })}`}
                  </span>
                </div>
              </div>

              <div className={PLAY_LIVE.bottom}>
                <div className={PLAY_LIVE.faces}>
                  {table.faces.slice(0, SHOWN_FACES).map((face) => (
                    <Avatar
                      key={face.id}
                      name={face.name}
                      src={face.avatarUrl}
                      size="xs"
                      className={PLAY_LIVE.face}
                    />
                  ))}
                  {extra > 0 && <span className={PLAY_LIVE.more}>+{extra}</span>}
                  <span className={PLAY_LIVE.count}>
                    {fillPlayMessage(PLAY_HUB_COPY.players, {
                      players: table.players,
                      max: table.maxPlayers,
                    })}
                  </span>
                </div>

                <div className={PLAY_LIVE.actions}>
                  {isMine && (
                    <Button
                      variant="arcadeSmall"
                      icon="playResume"
                      className={PLAY_LIVE.action}
                      aria-label={PLAY_HUB_COPY.resume}
                      onClick={() => router.push(ROUTES.playSession(table.id))}
                    />
                  )}
                  {!isMine && table.isOverseen && (
                    <Button
                      variant="arcadeGhostSmall"
                      icon="playSpectators"
                      className={PLAY_LIVE.action}
                      aria-label={PLAY_HUB_COPY.oversee}
                      onClick={() => router.push(ROUTES.playSession(table.id))}
                    />
                  )}
                  {!isMine && !table.isOverseen && (
                    <>
                      <Button
                        variant="arcadeGhostSmall"
                        icon={table.isFollowed ? 'playUnfollow' : 'playFeed'}
                        className={PLAY_LIVE.action}
                        aria-label={
                          table.isFollowed ? PLAY_FOLLOW_COPY.unfollow : PLAY_FOLLOW_COPY.follow
                        }
                        aria-pressed={table.isFollowed}
                        isLoading={moves.isSaving}
                        onClick={() => void moves.follow(table.id, !table.isFollowed)}
                      />
                      {isRunning && (
                        <Button
                          variant="arcadeGhostSmall"
                          icon="playSpectators"
                          className={PLAY_LIVE.action}
                          aria-label={PLAY_HUB_COPY.watch}
                          onClick={() => router.push(ROUTES.playSession(table.id))}
                        />
                      )}
                      <Button
                        variant="arcadeSmall"
                        icon="playInvite"
                        className={PLAY_LIVE.action}
                        aria-label={PLAY_HUB_COPY.join}
                        disabled={isLocked || isFull}
                        isLoading={moves.isSaving}
                        onClick={() => void moves.join(table.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
