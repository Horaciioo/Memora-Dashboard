'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { GolfPanorama } from '@/composites/play/golf/panorama/GolfPanorama'
import { GolfVoteDeck } from '@/composites/play/golf/vote/GolfVoteDeck'
import { GolfVoteTimer } from '@/composites/play/golf/vote/GolfVoteTimer'
import {
  courseCards,
  MODE_HINTS,
  modeCards,
  roundCards,
} from '@/composites/play/golf/vote/voteCards'
import { useGolfVote } from '@/composites/play/golf/vote/useGolfVote'
import type { GolfGameSettings, GolfVoteState } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_VOTE_COPY, GolfVoteSteps } from '@/declarations/play/golf/vote'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { GolfModes } from '@/utils/constants/play'
import type { GolfModeName } from '@/utils/constants/play'

// Three loaded only while the vote is open
const GolfCourseShots = dynamic(() => import('@/composites/play/golf/panorama/GolfCourseShots'), {
  ssr: false,
})

// Thumbnails drawn once per page visit
const SHOTS = new Map<string, string>()

export interface GolfVoteProps {
  vote: GolfVoteState
  settings: GolfGameSettings
  // Server ms at the page render
  serverTime: number
  viewerId: string
  hostId: string
  // Players of the table by account
  faces: Record<string, { name: string; avatarUrl: string | null }>
  isSaving: boolean
  // Sends one action to the vote route
  onSend: (payload: Record<string, unknown>) => void
}

/**
 * Full screen vote of the lobby: the format, the tournament length, then the course over a map from above.
 * Every player picks within the time, the card most picked wins, the host may close a step early
 * @param {GolfVoteProps} props - Vote and gestures
 * @return {JSX.Element | null}
 */

export const GolfVote = ({
  vote,
  settings,
  serverTime,
  viewerId,
  hostId,
  faces,
  isSaving,
  onSend,
}: GolfVoteProps) => {
  const isHost = viewerId === hostId
  const { picks, leader, pick, close, validate, back } = useGolfVote({
    vote,
    settings,
    viewerId,
    hostId,
    isHost,
    onSend,
  })
  const [shots, setShots] = useState(() => new Map(SHOTS))
  const { step } = vote
  const missing = GOLF_COURSES.keys.filter((key) => !shots.has(key))
  const voters = Object.entries(picks).flatMap(([id, key]) =>
    faces[id] ? [{ id, key, ...faces[id] }] : []
  )
  const maps = Number(vote.chosen.rounds ?? settings.maps)

  // Words and cards of the step on screen
  const screens = {
    [GolfVoteSteps.Mode]: () => ({
      title: GOLF_VOTE_COPY.modeTitle,
      lead: GOLF_VOTE_COPY.modeLead,
      hint: MODE_HINTS[leader as GolfModeName],
      cards: modeCards(),
    }),
    [GolfVoteSteps.Rounds]: () => ({
      title: GOLF_VOTE_COPY.roundsTitle,
      lead: GOLF_VOTE_COPY.roundsLead,
      hint: fillPlayMessage(GOLF_VOTE_COPY.roundsHint, { count: Number(leader) || maps }),
      cards: roundCards(),
    }),
    [GolfVoteSteps.Course]: () => ({
      title: GOLF_VOTE_COPY.courseTitle,
      lead:
        vote.chosen.mode === GolfModes.Tournament
          ? GOLF_VOTE_COPY.courseLeadTournament
          : GOLF_VOTE_COPY.courseLead,
      hint:
        leader === GOLF_RANDOM_COURSE
          ? GOLF_SETUP_COPY.randomHint
          : GOLF_COURSES.get(leader).tagline,
      cards: courseCards(shots),
    }),
  }
  // Only the step on screen is built, the leader belongs to its cards
  const screen = screens[step]()

  return createPortal(
    <div className={GOLF_VOTE.root} role="dialog" aria-label={screen.title}>
      <GolfPanorama
        course={step === GolfVoteSteps.Course && leader !== GOLF_RANDOM_COURSE ? leader : undefined}
      />
      <div className={GOLF_VOTE.stage}>
        <div key={`head-${step}`} className={GOLF_VOTE.head}>
          <h2 className={GOLF_VOTE.title}>{screen.title}</h2>
          <p className={GOLF_VOTE.lead}>{screen.lead}</p>
        </div>
        <GolfVoteDeck
          key={step}
          cards={screen.cards}
          value={leader}
          voters={voters}
          isCourse={step === GolfVoteSteps.Course}
          onPick={pick}
        />
        <p key={`hint-${leader}`} className={cn(GOLF_VOTE.hint, 'golf-vote-title')}>
          {screen.hint}
        </p>
        <div className={GOLF_VOTE.actions}>
          {isHost && (
            <button type="button" className={GOLF_VOTE.button} onClick={back} disabled={isSaving}>
              {GOLF_VOTE_COPY.back}
            </button>
          )}
          <GolfVoteTimer key={step} endsAt={vote.endsAt} serverTime={serverTime} onExpire={close} />
          {isHost && (
            <button
              type="button"
              className={cn(GOLF_VOTE.button, GOLF_VOTE.buttonMain)}
              onClick={validate}
              disabled={isSaving}
            >
              {GOLF_VOTE_COPY.confirm}
            </button>
          )}
        </div>
      </div>
      <GolfCourseShots
        missing={missing}
        onShot={(course, url) => {
          SHOTS.set(course, url)
          setShots(new Map(SHOTS))
        }}
      />
    </div>,
    document.body
  )
}
