'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { ChatFeed } from '@/composites/academy/course/ChatFeed'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock, SimulationStepSeed } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_EXERCISE, DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One situation of a simulation: its scene plays out, then the moves appear, and the pick is
 * answered on the spot with the reason
 * @param {Object} props - Step, surface, pick and handlers
 * @return {JSX.Element}
 */

const SimulationStep = ({
  step,
  surface,
  index,
  total,
  picked,
  onPick,
}: {
  step: SimulationStepSeed
  surface: 'twitch' | 'youtube' | 'discord'
  index: number
  total: number
  picked: string | undefined
  onPick: (optionKey: string) => void
}) => {
  const [ready, setReady] = useState(surface === 'discord')
  const chosen = step.options.find((option) => option.key === picked)
  const VerdictIcon = chosen?.correct ? ICONS.success : ICONS.failure

  return (
    <div className={COURSE_EXERCISE.simStep}>
      <span className={COURSE_EXERCISE.simCount}>
        {COURSE_COPY.simulationStep(index + 1, total)}
      </span>

      {surface === 'discord' ? (
        <div className={DISCORD_MESSAGE.frame}>
          {step.lines.map((line, at) => (
            <DiscordMessage key={at} source={line.text} mentions={[]} author={line.author} />
          ))}
        </div>
      ) : (
        <ChatFeed
          surface={surface}
          lines={step.lines}
          autoplay={picked === undefined}
          onPlayed={() => setReady(true)}
        />
      )}

      {ready && (
        <>
          <p className={COURSE_EXERCISE.prompt}>{step.prompt}</p>
          <div className={COURSE_EXERCISE.simOptions}>
            {step.options.map((option) => (
              <button
                key={option.key}
                type="button"
                disabled={picked !== undefined}
                onClick={() => onPick(option.key)}
                className={cn(
                  COURSE_EXERCISE.choice,
                  picked === option.key &&
                    (option.correct ? COURSE_EXERCISE.choiceRight : COURSE_EXERCISE.choiceWrong),
                  picked !== undefined && option.correct && COURSE_EXERCISE.choiceRight
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {chosen && (
            <p
              role="status"
              className={cn(
                COURSE_EXERCISE.feedback,
                chosen.correct ? COURSE_EXERCISE.resultPassed : COURSE_EXERCISE.resultFailed
              )}
            >
              <VerdictIcon className={COURSE_EXERCISE.resultIcon} aria-hidden="true" />
              {chosen.feedback}
            </p>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Simulation: a button opens it over the blurred page, then a scene at a time, each ending on a
 * decision answered at once. Situations already played stay above, the next one opening below
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const SimulationExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'simulation' }>>) => {
  const record = asRecord(answer) as Record<string, string>
  const [open, setOpen] = useState(false)

  // Situations opened so far: every answered one and the first not answered
  const answered = block.steps.filter((step) => record[step.key] !== undefined).length
  const opened = Math.min(answered + 1, block.steps.length)
  const lastDone = answered === block.steps.length

  const finish = () => {
    onCheck(record)
    setOpen(false)
  }

  return (
    <ExerciseFrame
      kind="simulation"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={lastDone}
      autoCheck
      onCheck={finish}
      onRetry={() => {
        // A miss replays the whole scene from its first situation
        onAnswer({})
        onRetry()
        setOpen(true)
      }}
    >
      <p className={COURSE_EXERCISE.simContext}>{block.context}</p>

      {!result && (
        <div>
          <Button variant="primary" icon="flash" onClick={() => setOpen(true)}>
            {COURSE_COPY.simulationBegin}
          </Button>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={block.title} size="lg">
        <div className={COURSE_EXERCISE.simStage}>
          <p className={COURSE_EXERCISE.simContext}>{block.context}</p>

          {block.steps.slice(0, opened).map((step, index) => (
            <SimulationStep
              key={step.key}
              step={step}
              surface={block.surface}
              index={index}
              total={block.steps.length}
              picked={record[step.key]}
              onPick={(optionKey) => onAnswer({ ...record, [step.key]: optionKey })}
            />
          ))}

          {lastDone && (
            <div>
              <Button variant="primary" icon="confirm" disabled={isSaving} onClick={finish}>
                {isSaving ? COURSE_COPY.saving : COURSE_COPY.simulationFinish}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </ExerciseFrame>
  )
}
