'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { GolfPanorama } from '@/composites/play/golf/panorama/GolfPanorama'
import { GolfVoteDeck } from '@/composites/play/golf/vote/GolfVoteDeck'
import type { GolfVotePlayer } from '@/composites/play/golf/vote/GolfVoteDeck'
import {
  courseCards,
  MODE_HINTS,
  modeCards,
  roundCards,
} from '@/composites/play/golf/vote/voteCards'
import { useGolfVote } from '@/composites/play/golf/vote/useGolfVote'
import type { GolfGameSettings } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_VOTE_COPY, GolfVoteSteps } from '@/declarations/play/golf/vote'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { GolfModes } from '@/utils/constants/play'

// Three loaded only while the vote is open
const GolfCourseShots = dynamic(() => import('@/composites/play/golf/panorama/GolfCourseShots'), {
  ssr: false,
})

// Thumbnails drawn once per page visit
const SHOTS = new Map<string, string>()

export interface GolfVoteProps {
  settings: GolfGameSettings
  player?: GolfVotePlayer
  isSaving: boolean
  // Rules of a waiting game, not a new one
  isEditing: boolean
  onBack: () => void
  onConfirm: (settings: GolfGameSettings) => void
}

/**
 * Full screen vote after the rules: the format, the tournament length, then the course over a map from above
 * @param {GolfVoteProps} props - Rules and gestures
 * @return {JSX.Element | null}
 */

export const GolfVote = ({
  settings,
  player,
  isSaving,
  isEditing,
  onBack,
  onConfirm,
}: GolfVoteProps) => {
  const vote = useGolfVote({ settings, onBack, onConfirm })
  const [shots, setShots] = useState(() => new Map(SHOTS))
  const { step, steps, choice, isLeaving } = vote
  const isLast = step === steps[steps.length - 1]
  const missing = GOLF_COURSES.keys.filter((key) => !shots.has(key))

  // Words and cards of the step on screen
  const screens = {
    [GolfVoteSteps.Mode]: {
      title: GOLF_VOTE_COPY.modeTitle,
      lead: GOLF_VOTE_COPY.modeLead,
      hint: MODE_HINTS[choice.mode],
      cards: modeCards(),
      value: choice.mode as string,
    },
    [GolfVoteSteps.Rounds]: {
      title: GOLF_VOTE_COPY.roundsTitle,
      lead: GOLF_VOTE_COPY.roundsLead,
      hint: fillPlayMessage(GOLF_VOTE_COPY.roundsHint, { count: choice.maps }),
      cards: roundCards(),
      value: String(choice.maps),
    },
    [GolfVoteSteps.Course]: {
      title: GOLF_VOTE_COPY.courseTitle,
      lead:
        choice.mode === GolfModes.Tournament
          ? GOLF_VOTE_COPY.courseLeadTournament
          : GOLF_VOTE_COPY.courseLead,
      hint:
        choice.course === GOLF_RANDOM_COURSE
          ? GOLF_SETUP_COPY.randomHint
          : GOLF_COURSES.get(choice.course).tagline,
      cards: courseCards(shots),
      value: choice.course,
    },
  }
  const screen = screens[step]
  const confirmLabel = isLast
    ? isEditing
      ? PLAY_HUB_COPY.saveRules
      : GOLF_SETUP_COPY.create
    : GOLF_VOTE_COPY.confirm

  return createPortal(
    <div className={GOLF_VOTE.root} role="dialog" aria-label={screen.title}>
      <GolfPanorama course={choice.course === GOLF_RANDOM_COURSE ? undefined : choice.course} />
      <div className={GOLF_VOTE.stage}>
        <div key={`head-${step}`} className={GOLF_VOTE.head}>
          <h2 className={GOLF_VOTE.title}>{screen.title}</h2>
          <p className={GOLF_VOTE.lead}>{screen.lead}</p>
        </div>
        <GolfVoteDeck
          key={step}
          cards={screen.cards}
          value={screen.value}
          player={player}
          isLeaving={isLeaving}
          isCourse={step === GolfVoteSteps.Course}
          onPick={vote.pick}
          onConfirm={vote.confirm}
        />
        <p key={`hint-${screen.value}`} className={cn(GOLF_VOTE.hint, 'golf-vote-title')}>
          {screen.hint}
        </p>
        <div className={GOLF_VOTE.actions}>
          <button
            type="button"
            className={GOLF_VOTE.button}
            onClick={vote.back}
            disabled={isSaving}
          >
            {GOLF_VOTE_COPY.back}
          </button>
          <button
            type="button"
            className={cn(GOLF_VOTE.button, GOLF_VOTE.buttonMain)}
            onClick={vote.confirm}
            disabled={isSaving || isLeaving}
          >
            {confirmLabel}
          </button>
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
