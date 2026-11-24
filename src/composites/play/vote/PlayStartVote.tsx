'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { PlayVoteDeck } from '@/composites/play/vote/PlayVoteDeck'
import type { PlayVoteCard } from '@/composites/play/vote/PlayVoteDeck'
import { PlayVoteProgress } from '@/composites/play/vote/PlayVoteProgress'
import { PlayVoteTimer } from '@/composites/play/vote/PlayVoteTimer'
import { usePlayVote } from '@/composites/play/vote/usePlayVote'
import type { PlayVoteProps } from '@/composites/play/registry'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { mostPicked, voteOf, voteRulesOf } from '@/core/lib/play/vote'
import type { PlayVoteState } from '@/core/lib/play/vote'
import { PLAY_GAMES, playKeysOf } from '@/declarations/play/games'
import { PLAY_HUD_SKINS, voteSkinOf } from '@/declarations/play/hud'
import { GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { PLAY_VOTE_STEPS } from '@/declarations/play/votes'
import type { PlayVoteStepSpec } from '@/declarations/play/votes'
import { ICONS } from '@/declarations/ui/icons'
import type { VoteLook } from '@/declarations/ui/variants/games/golf'
import { PLAY_VOTE, PLAY_VOTE_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

// Picture a game draws for a card, none keeps the glyph
export type PlayVoteFace = (step: string, key: string) => ReactNode | null

/**
 * Cards of a declared step
 * @param {PlayVoteStepSpec} spec - Step
 * @param {VoteLook} look - Classes of the screen
 * @param {PlayVoteFace} [faceOf] - Game pictures
 * @return {PlayVoteCard[]} - Cards
 */

const cardsOf = (spec: PlayVoteStepSpec, look: VoteLook, faceOf?: PlayVoteFace): PlayVoteCard[] =>
  spec.choices.map((choice) => {
    const Icon = choice.icon && ICONS[choice.icon]
    const picture = faceOf?.(spec.key, choice.key)

    return {
      key: choice.key,
      label: choice.label,
      face: picture ? (
        picture
      ) : Icon ? (
        <Icon className={look.glyph} aria-hidden="true" />
      ) : (
        <span
          className={look.number}
          style={{
            fontSize: `calc(var(--vote-card) * ${Math.min(0.52, 1.4 / choice.key.length)})`,
          }}
        >
          {choice.key}
        </span>
      ),
    }
  })

/**
 * The open vote, one step on screen
 * @param {Object} props - Vote
 * @return {JSX.Element}
 */

const VoteScreen = ({
  game,
  vote,
  sessionId,
  serverTime,
  viewerId,
  hostId,
  faces,
  faceOf,
}: Omit<PlayVoteProps, 'settings'> & {
  game: PlayGameName
  vote: PlayVoteState
  faceOf?: PlayVoteFace
}) => {
  const moves = usePlayMoves()
  const isHost = viewerId === hostId
  const spec = PLAY_VOTE_STEPS[game]?.find((entry) => entry.key === vote.step)
  const options = spec?.choices.map((choice) => choice.key) ?? []
  const { picks, leader, pick, expire, validate, back } = usePlayVote({
    vote,
    winner: (picked) => mostPicked(options, picked, hostId, spec?.initial),
    viewerId,
    isHost,
    isSeated: viewerId in faces,
    onSend: (payload, isQuiet) => moves.vote(sessionId, payload, isQuiet),
  })
  const voters = Object.entries(picks).flatMap(([id, key]) =>
    faces[id] ? [{ id, key, ...faces[id] }] : []
  )
  if (!spec) return <></>
  const steps = voteRulesOf(game)?.steps(vote.chosen, Object.keys(faces).length) ?? []
  // Games with a HUD dress the vote in it, over their own ground
  const hasHud = PLAY_HUD_SKINS.has(game)
  const look = hasHud ? PLAY_VOTE_HUD : PLAY_VOTE
  const { ground } = PLAY_GAMES.get(game)

  return (
    <div
      className={look.root}
      style={playKeysOf(game)}
      data-hud={hasHud ? game.toLowerCase() : undefined}
      data-hud-skin={voteSkinOf(game, vote, leader)}
      role="dialog"
      aria-label={spec.title}
    >
      {hasHud && ground && <i className={cn(ground, 'hidden')} aria-hidden="true" />}
      <div className={look.stage}>
        <PlayVoteProgress steps={steps} step={vote.step} />
        <div key={`head-${vote.step}`} className={look.head}>
          <h2 className={look.title}>{spec.title}</h2>
          <p className={look.lead}>{spec.lead}</p>
        </div>
        <PlayVoteDeck
          key={vote.step}
          cards={cardsOf(spec, look, faceOf)}
          value={leader}
          voters={voters}
          isCourse={Boolean(faceOf)}
          look={look}
          onPick={pick}
        />
        <div className={look.foot}>
          <p key={`hint-${leader}`} className={look.hint}>
            {spec.choices.find((choice) => choice.key === leader)?.hint}
          </p>
          <div className={look.actions}>
            {isHost && (
              <button
                type="button"
                className={look.button}
                onClick={back}
                disabled={moves.isSaving}
              >
                {GOLF_VOTE_COPY.back}
              </button>
            )}
            <PlayVoteTimer
              key={vote.step}
              endsAt={vote.endsAt}
              serverTime={serverTime}
              onExpire={expire}
              look={look}
            />
            {isHost && (
              <button
                type="button"
                className={cn(look.button, look.buttonMain)}
                onClick={validate}
                disabled={moves.isSaving}
              >
                {GOLF_VOTE_COPY.confirm}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Launch vote of a game with declared steps: every player picks the main rules
 * @param {PlayGameName} game - Game
 * @param {PlayVoteFace} [faceOf] - Pictures the game draws for its cards
 * @return {(props: PlayVoteProps) => JSX.Element | null} - Vote of that game
 */

export const declaredVote = (game: PlayGameName, faceOf?: PlayVoteFace) => {
  const PlayStartVote = ({ settings, ...props }: PlayVoteProps) => {
    const vote = voteOf(settings)

    return vote
      ? createPortal(
          <VoteScreen {...props} game={game} vote={vote} faceOf={faceOf} />,
          document.body
        )
      : null
  }

  return PlayStartVote
}
