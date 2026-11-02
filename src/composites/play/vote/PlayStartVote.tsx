'use client'

import { createPortal } from 'react-dom'

import { GolfVoteDeck } from '@/composites/play/golf/vote/GolfVoteDeck'
import type { GolfVoteCard } from '@/composites/play/golf/vote/GolfVoteDeck'
import { GolfVoteTimer } from '@/composites/play/golf/vote/GolfVoteTimer'
import { useGolfVote } from '@/composites/play/golf/vote/useGolfVote'
import type { PlayVoteProps } from '@/composites/play/registry'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { mostPicked, voteOf } from '@/core/lib/play/vote'
import type { PlayVoteState } from '@/core/lib/play/vote'
import { playKeysOf } from '@/declarations/play/games'
import { GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { PLAY_VOTE_STEPS } from '@/declarations/play/votes'
import type { PlayVoteStepSpec } from '@/declarations/play/votes'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_VOTE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Cards of a declared step
 * @param {PlayVoteStepSpec} spec - Step
 * @return {GolfVoteCard[]} - Cards
 */

const cardsOf = (spec: PlayVoteStepSpec): GolfVoteCard[] =>
  spec.choices.map((choice) => {
    const Icon = choice.icon && ICONS[choice.icon]

    return {
      key: choice.key,
      label: choice.label,
      face: Icon ? (
        <Icon className={PLAY_VOTE.glyph} aria-hidden="true" />
      ) : (
        <span className={PLAY_VOTE.number}>{choice.key}</span>
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
}: Omit<PlayVoteProps, 'settings'> & { game: PlayGameName; vote: PlayVoteState }) => {
  const moves = usePlayMoves()
  const isHost = viewerId === hostId
  const spec = PLAY_VOTE_STEPS[game]?.find((entry) => entry.key === vote.step)
  const options = spec?.choices.map((choice) => choice.key) ?? []
  const { picks, leader, pick, close, validate, back } = useGolfVote({
    vote,
    winner: (picked) => mostPicked(options, picked, hostId),
    viewerId,
    isHost,
    onSend: (payload) => void moves.vote(sessionId, payload),
  })
  const voters = Object.entries(picks).flatMap(([id, key]) =>
    faces[id] ? [{ id, key, ...faces[id] }] : []
  )
  if (!spec) return <></>

  return (
    <div className={PLAY_VOTE.root} style={playKeysOf(game)} role="dialog" aria-label={spec.title}>
      <div className={PLAY_VOTE.stage}>
        <div key={`head-${vote.step}`} className={PLAY_VOTE.head}>
          <h2 className={PLAY_VOTE.title}>{spec.title}</h2>
          <p className={PLAY_VOTE.lead}>{spec.lead}</p>
        </div>
        <GolfVoteDeck
          key={vote.step}
          cards={cardsOf(spec)}
          value={leader}
          voters={voters}
          look={PLAY_VOTE}
          onPick={pick}
        />
        <p key={`hint-${leader}`} className={PLAY_VOTE.hint}>
          {spec.choices.find((choice) => choice.key === leader)?.hint}
        </p>
        <div className={PLAY_VOTE.actions}>
          {isHost && (
            <button
              type="button"
              className={PLAY_VOTE.button}
              onClick={back}
              disabled={moves.isSaving}
            >
              {GOLF_VOTE_COPY.back}
            </button>
          )}
          <GolfVoteTimer
            key={vote.step}
            endsAt={vote.endsAt}
            serverTime={serverTime}
            onExpire={close}
            look={PLAY_VOTE}
          />
          {isHost && (
            <button
              type="button"
              className={cn(PLAY_VOTE.button, PLAY_VOTE.buttonMain)}
              onClick={validate}
              disabled={moves.isSaving}
            >
              {GOLF_VOTE_COPY.confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Launch vote of a game with declared steps: every player picks the main rules
 * @param {PlayGameName} game - Game
 * @return {(props: PlayVoteProps) => JSX.Element | null} - Vote of that game
 */

export const declaredVote = (game: PlayGameName) => {
  const PlayStartVote = ({ settings, ...props }: PlayVoteProps) => {
    const vote = voteOf(settings)

    return vote
      ? createPortal(<VoteScreen {...props} game={game} vote={vote} />, document.body)
      : null
  }

  return PlayStartVote
}
