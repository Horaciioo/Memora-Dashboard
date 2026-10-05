'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { DiscordReplica } from '@/composites/replicas/discord/DiscordReplica'
import { SupportGuide } from '@/composites/replicas/SupportGuide'
import { useDiscordScene } from '@/core/hooks/interaction/useDiscordScene'
import { playDiscordScene } from '@/core/lib/replicas/discordScene'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock, GuideStep, ReplicaRun } from '@/declarations/academy/curriculum/types'
import { COMPARE_RUNS, COURSE_SCENE, SUPPORT_GUIDE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Pause between two runs
const RUN_GAP_MS = 1600

interface RunStageProps {
  run: ReplicaRun
  guide: GuideStep[] | undefined
  label: string
  onOver?: () => void
  // Replay button in the middle once over
  replayable?: boolean
}

/**
 * One run played full size
 * @param {RunStageProps} props - Run
 * @return {JSX.Element}
 */

const RunStage = ({ run, guide, label, onOver, replayable }: RunStageProps) => {
  const { state, controls } = useDiscordScene(run.scene.initial, run.scene.steps)

  // Tell the parent once every beat played
  useEffect(() => {
    if (!controls.isOver || !onOver) return
    const timer = window.setTimeout(onOver, RUN_GAP_MS)

    return () => window.clearTimeout(timer)
  }, [controls.isOver, onOver])

  return (
    <div className={COMPARE_RUNS.stage}>
      <div className={COMPARE_RUNS.stageHead}>
        <span className={COMPARE_RUNS.stageLabel}>{label}</span>
      </div>
      <div className={SUPPORT_GUIDE.wrap}>
        {guide && <SupportGuide steps={guide} current={state.guideStep} />}
        <DiscordReplica state={state} />
        {replayable && controls.isOver && (
          <Button
            variant="primary"
            icon="refresh"
            className={COMPARE_RUNS.replay}
            onClick={controls.restart}
          >
            {COURSE_COPY.runReplay}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Several runs of one ticket played one after the other
 * @param {ExerciseViewProps} props - Block
 * @return {JSX.Element}
 */

export const CompareRunsExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'compareRuns' }>>) => {
  const total = block.runs.length
  // Watching each run in turn
  const [playing, setPlaying] = useState<number | null>(answer ? null : 0)
  // Waits for its button
  const [started, setStarted] = useState(!block.startLabel || answer !== undefined)
  const [opened, setOpened] = useState<number | null>(null)
  const finals = useMemo(() => block.runs.map((run) => playDiscordScene(run.scene)), [block.runs])
  const picked = typeof answer === 'string' ? answer : null
  const pickedRun = block.runs.find((run) => run.key === picked)

  const next = useCallback(
    () => setPlaying((current) => (current !== null && current + 1 < total ? current + 1 : null)),
    [total]
  )

  return (
    <div className={COURSE_SCENE.wide}>
      <ExerciseFrame
        kind="compareRuns"
        title={block.title}
        result={result}
        isSaving={isSaving}
        canCheck={false}
        autoCheck
        onCheck={() => onCheck()}
        onRetry={onRetry}
      >
        <div className={COURSE_SCENE.context}>
          <Markdown source={block.context} />
        </div>

        {!started ? (
          <div className={COURSE_SCENE.controls}>
            <Button variant="primary" icon="flash" onClick={() => setStarted(true)}>
              {block.startLabel}
            </Button>
          </div>
        ) : playing !== null ? (
          <RunStage
            key={block.runs[playing]!.key}
            run={block.runs[playing]!}
            guide={block.guide}
            label={COURSE_COPY.runPlaying(playing + 1, total)}
            onOver={next}
          />
        ) : (
          <>
            {opened !== null && (
              <div className={COMPARE_RUNS.enlarged}>
                <RunStage
                  key={`open-${block.runs[opened]!.key}`}
                  run={block.runs[opened]!}
                  guide={block.guide}
                  label={COURSE_COPY.runLabel(opened + 1)}
                  replayable
                />
              </div>
            )}

            <div className={COMPARE_RUNS.strip}>
              {block.runs.map((run, index) => (
                <button
                  key={run.key}
                  type="button"
                  className={COMPARE_RUNS.thumb}
                  aria-pressed={opened === index}
                  onClick={() => setOpened(opened === index ? null : index)}
                >
                  <span
                    className={cn(
                      COMPARE_RUNS.thumbFrame,
                      opened === index && COMPARE_RUNS.thumbOpen
                    )}
                  >
                    <span className={COMPARE_RUNS.thumbScale}>
                      <DiscordReplica state={finals[index]!} />
                    </span>
                  </span>
                  <span className={COMPARE_RUNS.thumbLabel}>{COURSE_COPY.runLabel(index + 1)}</span>
                </button>
              ))}
            </div>

            <p className={COURSE_SCENE.context}>{block.question}</p>
            <div className={COMPARE_RUNS.picks}>
              {block.runs.map((run, index) => (
                <Button
                  key={run.key}
                  variant={picked === run.key ? 'primary' : 'secondary'}
                  className={COMPARE_RUNS.pick}
                  disabled={result !== undefined}
                  onClick={() => {
                    onAnswer(run.key)
                    onCheck(run.key)
                  }}
                >
                  {COURSE_COPY.runPick(index + 1)}
                </Button>
              ))}
            </div>

            {result && pickedRun && (
              <p
                className={cn(
                  COMPARE_RUNS.feedback,
                  pickedRun.correct ? COMPARE_RUNS.feedbackGood : COMPARE_RUNS.feedbackBad
                )}
              >
                {pickedRun.feedback}
              </p>
            )}
          </>
        )}
      </ExerciseFrame>
    </div>
  )
}
