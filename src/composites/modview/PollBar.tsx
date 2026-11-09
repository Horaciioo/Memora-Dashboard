'use client'

import { useEffect, useState } from 'react'

import { FoldToggle } from '@/composites/modview/FoldToggle'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { choiceShare, pollClock, pollTimeLeft, pollTotal } from '@/core/lib/modview/poll'
import { MODVIEW_POLL_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_POLL } from '@/declarations/ui/variants'
import type { LivePoll } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'

// Singular up to one
const countOf = (count: number, one: string, many: string): string =>
  (count > 1 ? many : one).replace('{count}', String(count))

export interface PollBarProps {
  poll: LivePoll
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Running poll above the chat: time, votes per choice and who launched it
 * @param {LivePoll} poll - Poll
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @return {JSX.Element}
 */

export const PollBar = ({ poll, gate, onAct }: PollBarProps) => {
  const [isFolded, setFolded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const PollIcon = ICONS.modPoll
  const isActive = poll.status === 'active'

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setNow(Date.now()), SECOND_MS)

    return () => clearInterval(timer)
  }, [isActive])

  const total = pollTotal(poll)
  const top = Math.max(...poll.choices.map((choice) => choice.votes))
  const canEnd = isActive && gate({ kind: 'pollEnd', pollId: poll.id }).allowed
  const author = poll.startedBy
    ? MODVIEW_POLL_COPY.startedBy.replace('{name}', poll.startedBy)
    : MODVIEW_POLL_COPY.startedOnTwitch

  return (
    <aside className={MODVIEW_POLL.root} aria-label={MODVIEW_POLL_COPY.title}>
      <div className={MODVIEW_POLL.timer}>
        <div
          className={MODVIEW_POLL.timerFill}
          style={{ width: `${(isActive ? pollTimeLeft(poll, now) : 0) * 100}%` }}
        />
      </div>

      <div className={MODVIEW_POLL.body}>
        <p className={MODVIEW_POLL.head}>
          <PollIcon className={MODVIEW_POLL.headIcon} aria-hidden="true" />
          <span className={MODVIEW_POLL.headText}>
            {isActive ? MODVIEW_POLL_COPY.title : MODVIEW_POLL_COPY.results}
            {` ${author}`}
          </span>
          <span className={MODVIEW_POLL.tools}>
            {canEnd && (
              <button
                type="button"
                className={MODVIEW_POLL.end}
                onClick={() => onAct({ kind: 'pollEnd', pollId: poll.id })}
              >
                {MODVIEW_POLL_COPY.end}
              </button>
            )}
            <FoldToggle isFolded={isFolded} onToggle={() => setFolded(!isFolded)} />
          </span>
        </p>

        <p className={isFolded ? MODVIEW_POLL.questionFolded : MODVIEW_POLL.question}>
          {poll.title}
        </p>

        {!isFolded && (
          <ul className={MODVIEW_POLL.choices}>
            {poll.choices.map((choice) => {
              const share = choiceShare(choice, total)
              const leads = total > 0 && choice.votes === top

              return (
                <li key={choice.id} className={MODVIEW_POLL.choice}>
                  <div
                    className={cn(
                      MODVIEW_POLL.choiceFill,
                      leads ? MODVIEW_POLL.choiceFillTop : MODVIEW_POLL.choiceFillRest
                    )}
                    style={{ width: `${share}%` }}
                  />
                  <span className={MODVIEW_POLL.choiceName}>{choice.title}</span>
                  <span className={MODVIEW_POLL.choiceVotes}>
                    {countOf(choice.votes, MODVIEW_POLL_COPY.vote, MODVIEW_POLL_COPY.votes)}
                  </span>
                  <span className={MODVIEW_POLL.choiceShare}>{`${share} %`}</span>
                </li>
              )
            })}
          </ul>
        )}

        <p className={MODVIEW_POLL.foot}>
          <span>{countOf(total, MODVIEW_POLL_COPY.voter, MODVIEW_POLL_COPY.voters)}</span>
          <span>
            {isActive
              ? MODVIEW_POLL_COPY.left.replace('{clock}', pollClock(poll, now))
              : MODVIEW_POLL_COPY.finished}
          </span>
        </p>
      </div>
    </aside>
  )
}
