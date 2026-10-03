'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { ChatLineView } from '@/composites/academy/course/ChatFeed'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { KeyPointsBlock } from '@/composites/academy/course/FigureBlocks'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { usePlungeScene } from '@/core/hooks/interaction/usePlungeScene'
import { gaugesOf, lineOf, missesOf, outcomeOf } from '@/core/lib/curriculum/plunge'
import type { PlungeDecisions } from '@/core/lib/curriculum/plunge'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type {
  ChatLine,
  ExerciseBlock,
  PlungeGesture,
} from '@/declarations/academy/curriculum/types'
import { PLUNGE_ACTIONS, PLUNGE_GAUGE, PLUNGE_GESTURES } from '@/declarations/academy/plunge'
import { ICONS } from '@/declarations/ui/icons'
import {
  COURSE_CHAT,
  COURSE_DEMO,
  COURSE_EXERCISE,
  COURSE_PLUNGE,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

type PlungeBlock = Extract<ExerciseBlock, { kind: 'plunge' }>

// Gestures a saved answer can hold
const GESTURES = Object.keys(PLUNGE_GESTURES)

/**
 * One gauge of the chat mood
 * @param {Object} props - Label, value and fill style
 * @return {JSX.Element}
 */

const Gauge = ({ label, value, fill }: { label: string; value: number; fill: string }) => (
  <div className={COURSE_PLUNGE.gauge}>
    <div className={COURSE_PLUNGE.gaugeHead}>
      <span className={COURSE_PLUNGE.gaugeLabel}>{label}</span>
      <span className={COURSE_PLUNGE.gaugeFigure}>{Math.round(value)}</span>
    </div>
    <div
      className={COURSE_PLUNGE.gaugeTrack}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={PLUNGE_GAUGE.max}
      aria-valuenow={Math.round(value)}
    >
      <div className={cn(COURSE_PLUNGE.gaugeFill, fill)} style={{ width: `${value}%` }} />
    </div>
  </div>
)

/**
 * Tag a gesture leaves next to the name
 * @param {PlungeGesture} gesture - Gesture played
 * @return {ReactNode} - Tag, nothing for a deletion or a line left alone
 */

const tagOf = (gesture: PlungeGesture): ReactNode => {
  if (gesture === 'timeout') {
    return (
      <span className={cn(COURSE_DEMO.tag, COURSE_DEMO.tagTimeout)}>
        {COURSE_COPY.demoTagTimeout('10 min')}
      </span>
    )
  }

  if (gesture === 'ban') {
    return <span className={cn(COURSE_DEMO.tag, COURSE_DEMO.tagBan)}>{COURSE_COPY.demoTagBan}</span>
  }

  return null
}

/**
 * Opening scene: the learner lands in a live with no explanation and acts, bets on how sure they
 * are, then sees what the team made of each message. Failing comes first, the lesson after
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const PlungeExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
}: ExerciseViewProps<PlungeBlock>) => {
  const record = asRecord(answer) as Record<string, string>
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<'scene' | 'reveal'>('scene')
  const [decisions, setDecisions] = useState<PlungeDecisions>({})
  const [frozen, setFrozen] = useState<Record<string, ChatLine>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [bet, setBet] = useState<string | null>(null)
  const decisionsRef = useRef<PlungeDecisions>({})
  const chatRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)

  // A line lands with the text its context calls for
  const arrive = useCallback(
    (index: number) => {
      const message = block.messages[index]

      if (message) {
        setFrozen((current) => ({
          ...current,
          [message.key]: lineOf(message, decisionsRef.current),
        }))
      }
    },
    [block.messages]
  )
  const scene = usePlungeScene(block.messages.length, open && stage === 'scene', arrive)

  // Follow the newest line
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight })
  }, [scene.shown, selected])

  // Debrief opens from its top
  useEffect(() => {
    if (stage === 'reveal') revealRef.current?.scrollIntoView({ block: 'start' })
  }, [stage, open])

  const setGesture = (key: string, gesture: PlungeGesture) => {
    decisionsRef.current = { ...decisionsRef.current, [key]: gesture }
    setDecisions(decisionsRef.current)
    setSelected(null)
  }

  const begin = () => {
    decisionsRef.current = {}
    setDecisions({})
    setFrozen({})
    setSelected(null)
    setBet(null)
    setStage('scene')
    scene.restart()
    setOpen(true)
  }

  // Saved run opens on its debrief
  const review = () => {
    const saved: PlungeDecisions = {}

    for (const message of block.messages) {
      const value = record[message.key]

      if (value && GESTURES.includes(value)) saved[message.key] = value as PlungeGesture
    }

    decisionsRef.current = saved
    setDecisions(saved)
    setFrozen({})
    setBet(record.bet ?? null)
    setStage('reveal')
    setOpen(true)
  }

  const wholeAnswer = (value: string) => ({
    ...Object.fromEntries(
      block.messages.map((message) => [message.key, decisionsRef.current[message.key] ?? 'leave'])
    ),
    bet: value,
  })

  const choose = (value: string) => {
    setBet(value)
    onAnswer(wholeAnswer(value))
    setStage('reveal')
  }

  const finish = () => {
    if (!result && bet) onCheck(wholeAnswer(bet))
    setOpen(false)
  }

  const gauges = gaugesOf(
    block.messages,
    decisions,
    stage === 'reveal' ? block.messages.length : scene.shown
  )
  const misses = missesOf(block.messages, decisions)
  // One message of the debrief
  const renderRow = (message: PlungeBlock['messages'][number]) => {
    const gesture = decisions[message.key] ?? 'leave'
    const outcome = outcomeOf(message, gesture)
    const tone =
      outcome === 'fit'
        ? COURSE_PLUNGE.rowFit
        : outcome === 'defensible'
          ? COURSE_PLUNGE.rowSplit
          : COURSE_PLUNGE.rowMiss

    return (
      <article key={message.key} className={cn(COURSE_PLUNGE.row, tone)}>
        <div className={COURSE_PLUNGE.rowLine}>
          <ChatLineView
            line={frozen[message.key] ?? lineOf(message, decisions)}
            surface="twitch"
            arriving={false}
            mark={{ deleted: gesture === 'delete', tags: tagOf(gesture) }}
          />
        </div>
        <div className={COURSE_PLUNGE.rowCalls}>
          <span className={COURSE_PLUNGE.rowCall}>
            <span className={COURSE_PLUNGE.rowCallLabel}>{COURSE_COPY.plungeYou}</span>
            <span className={COURSE_PLUNGE.rowCallValue}>{PLUNGE_GESTURES[gesture].label}</span>
          </span>
          <span className={COURSE_PLUNGE.rowCall}>
            <span className={COURSE_PLUNGE.rowCallLabel}>{COURSE_COPY.plungeTeam}</span>
            <span className={COURSE_PLUNGE.rowCallValue}>
              {COURSE_COPY.plungeVerdict[message.verdict]}
            </span>
          </span>
        </div>
        <span className={COURSE_PLUNGE.rowOutcome}>{COURSE_COPY.plungeOutcome[outcome]}</span>
        <p className={COURSE_PLUNGE.rowWhy}>{message.why}</p>
      </article>
    )
  }

  // Gaps first, calls that matched folded away
  const gaps = block.messages.filter(
    (message) => outcomeOf(message, decisions[message.key] ?? 'leave') !== 'fit'
  )
  const fits = block.messages.filter(
    (message) => outcomeOf(message, decisions[message.key] ?? 'leave') === 'fit'
  )
  const Undo = ICONS.back

  return (
    <ExerciseFrame
      kind="plunge"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={stage === 'reveal'}
      autoCheck
      onCheck={finish}
      onRetry={begin}
    >
      <p className={COURSE_EXERCISE.simContext}>{block.context}</p>

      <div>
        <Button variant="primary" icon="flash" onClick={result ? review : begin}>
          {result ? COURSE_COPY.plungeReview : COURSE_COPY.plungeBegin}
        </Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={block.title} size="lg">
        {stage === 'scene' ? (
          <div className={COURSE_PLUNGE.stage}>
            <div className={COURSE_PLUNGE.gauges}>
              <Gauge
                label={COURSE_COPY.plungeWarmth}
                value={gauges.warmth}
                fill={COURSE_PLUNGE.warmth}
              />
              <Gauge
                label={COURSE_COPY.plungeTension}
                value={gauges.tension}
                fill={COURSE_PLUNGE.tension}
              />
            </div>

            <figure className={cn(COURSE_CHAT.panel, COURSE_CHAT.twitch)}>
              <figcaption className={cn(COURSE_CHAT.head, COURSE_CHAT.headTwitch)}>
                <span className={COURSE_CHAT.live}>
                  <span className={COURSE_CHAT.liveMark} aria-hidden="true" />
                  {COURSE_COPY.plungeLive(block.streamer)}
                </span>
              </figcaption>

              <div ref={chatRef} className={COURSE_PLUNGE.chat} aria-live="polite">
                {block.messages.slice(0, scene.shown).map((message, index) => {
                  const gesture = decisions[message.key] ?? 'leave'
                  const isSelected = selected === message.key

                  return (
                    <Fragment key={message.key}>
                      <button
                        type="button"
                        aria-expanded={isSelected}
                        className={cn(
                          COURSE_PLUNGE.message,
                          COURSE_PLUNGE.messageOpen,
                          isSelected && COURSE_PLUNGE.messageSelected
                        )}
                        onClick={() => setSelected(isSelected ? null : message.key)}
                      >
                        <ChatLineView
                          line={frozen[message.key] ?? message.line}
                          surface="twitch"
                          arriving={index === scene.shown - 1 && !scene.over}
                          mark={{ deleted: gesture === 'delete', tags: tagOf(gesture) }}
                        />
                      </button>

                      {isSelected && (
                        <div className={COURSE_PLUNGE.actions}>
                          {PLUNGE_ACTIONS.map((action) => {
                            const Icon = ICONS[PLUNGE_GESTURES[action].icon]

                            return (
                              <button
                                key={action}
                                type="button"
                                className={COURSE_PLUNGE.action}
                                onClick={() => setGesture(message.key, action)}
                              >
                                <Icon className={COURSE_PLUNGE.actionIcon} aria-hidden="true" />
                                {PLUNGE_GESTURES[action].label}
                              </button>
                            )
                          })}
                          {gesture !== 'leave' && (
                            <button
                              type="button"
                              className={cn(COURSE_PLUNGE.action, COURSE_PLUNGE.actionUndo)}
                              onClick={() => setGesture(message.key, 'leave')}
                            >
                              <Undo className={COURSE_PLUNGE.actionIcon} aria-hidden="true" />
                              {COURSE_COPY.plungeUndo}
                            </button>
                          )}
                        </div>
                      )}
                    </Fragment>
                  )
                })}

                {!scene.over && (
                  <span className={COURSE_CHAT.typing} aria-hidden="true">
                    <span className={COURSE_CHAT.typingDot} />
                    <span className={COURSE_CHAT.typingDot} />
                    <span className={COURSE_CHAT.typingDot} />
                  </span>
                )}
              </div>
            </figure>

            {!scene.over && <p className={COURSE_PLUNGE.hint}>{COURSE_COPY.plungeTap}</p>}

            {scene.over && (
              <section className={COURSE_PLUNGE.bet}>
                <h3 className={COURSE_PLUNGE.betTitle}>{COURSE_COPY.plungeBetTitle}</h3>
                <p className={COURSE_PLUNGE.betLead}>{COURSE_COPY.plungeBetLead}</p>
                <div className={COURSE_PLUNGE.betChoices}>
                  <button
                    type="button"
                    className={COURSE_EXERCISE.choice}
                    onClick={() => choose('sure')}
                  >
                    {COURSE_COPY.plungeSure}
                  </button>
                  <button
                    type="button"
                    className={COURSE_EXERCISE.choice}
                    onClick={() => choose('unsure')}
                  >
                    {COURSE_COPY.plungeUnsure}
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div ref={revealRef} className={COURSE_PLUNGE.reveal}>
            <h3 className={COURSE_PLUNGE.revealTitle}>{COURSE_COPY.plungeRevealTitle}</h3>

            <div className={COURSE_PLUNGE.gauges}>
              <Gauge
                label={COURSE_COPY.plungeWarmth}
                value={gauges.warmth}
                fill={COURSE_PLUNGE.warmth}
              />
              <Gauge
                label={COURSE_COPY.plungeTension}
                value={gauges.tension}
                fill={COURSE_PLUNGE.tension}
              />
            </div>

            <p className={COURSE_PLUNGE.note}>{COURSE_COPY.plungeScore(misses)}</p>
            {bet && (
              <p className={COURSE_PLUNGE.note}>
                {
                  COURSE_COPY.plungeCalibration[
                    bet === 'sure'
                      ? misses >= PLUNGE_GAUGE.missThreshold
                        ? 'sureMissed'
                        : 'sureRight'
                      : misses >= PLUNGE_GAUGE.missThreshold
                        ? 'unsureMissed'
                        : 'unsureRight'
                  ]
                }
              </p>
            )}

            {gaps.length > 0 && (
              <section className={COURSE_PLUNGE.fits}>
                <h4 className={COURSE_PLUNGE.sectionTitle}>{COURSE_COPY.plungeGapsTitle}</h4>
                <div className={COURSE_PLUNGE.rows}>{gaps.map(renderRow)}</div>
              </section>
            )}

            <KeyPointsBlock
              block={{
                kind: 'keypoints',
                key: `${block.key}-lessons`,
                title: COURSE_COPY.plungeLessonsTitle,
                points: block.lessons,
              }}
            />

            {fits.length > 0 && (
              <details className={COURSE_PLUNGE.fits} open={gaps.length === 0}>
                <summary className={COURSE_PLUNGE.fitsSummary}>
                  {COURSE_COPY.plungeFitsTitle}
                </summary>
                <div className={COURSE_PLUNGE.rows}>{fits.map(renderRow)}</div>
              </details>
            )}

            <div>
              <Button variant="primary" icon="confirm" isLoading={isSaving} onClick={finish}>
                {COURSE_COPY.plungeDone}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </ExerciseFrame>
  )
}
