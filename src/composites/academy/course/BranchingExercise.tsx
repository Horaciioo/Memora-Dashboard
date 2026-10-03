'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { DiscordReplica } from '@/composites/replicas/discord/DiscordReplica'
import { SupportGuide } from '@/composites/replicas/SupportGuide'
import { useDiscordScene } from '@/core/hooks/interaction/useDiscordScene'
import { walkBranches } from '@/core/lib/curriculum/branching'
import { chainSteps } from '@/core/lib/replicas/discordScene'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { BRANCHING, COURSE_SCENE, SUPPORT_GUIDE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

type BranchingBlock = Extract<ExerciseBlock, { kind: 'branching' }>

// Pause before each node's beats, in ms
const NODE_GAP_MS = 900

interface BranchingStageProps {
  block: BranchingBlock
  picks: Record<string, string | string[]>
  isChecked: boolean
  onPick: (nodeKey: string, optionKey: string) => void
  onEnd: () => void
}

/**
 * The conversation played so far, and the choice it stops on
 * @param {BranchingStageProps} props - Game, picks and handlers
 * @return {JSX.Element}
 */

const BranchingStage = ({ block, picks, isChecked, onPick, onEnd }: BranchingStageProps) => {
  const walk = useMemo(() => walkBranches(block, picks), [block, picks])
  const steps = useMemo(
    () =>
      walk.path.reduce(
        (chained, node) => chainSteps(chained, node.steps, NODE_GAP_MS),
        block.opening.steps
      ),
    [block.opening.steps, walk.path]
  )
  const { state, controls } = useDiscordScene(block.opening.initial, steps)
  const last = walk.path.at(-1)
  const ended = useRef(false)

  // Score once the ending has played
  useEffect(() => {
    if (!controls.isOver || !walk.ending || ended.current) return
    ended.current = true
    onEnd()
  }, [controls.isOver, onEnd, walk.ending])

  return (
    <div className={BRANCHING.stage}>
      <div className={SUPPORT_GUIDE.wrap}>
        {block.guide && <SupportGuide steps={block.guide} current={state.guideStep} />}
        <DiscordReplica state={state} />
      </div>

      {controls.isOver && last?.prompt && last.options && !walk.ending && (
        <div key={last.key} className={BRANCHING.prompt}>
          <p className={BRANCHING.promptText}>{last.prompt}</p>
          <div className={BRANCHING.options}>
            {last.options.map((option) => (
              <Button
                key={option.key}
                variant="secondary"
                disabled={isChecked}
                onClick={() => onPick(last.key, option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {controls.isOver && walk.ending?.ending && (
        <div
          className={cn(
            BRANCHING.ending,
            walk.ending.ending.good ? BRANCHING.endingGood : BRANCHING.endingBad
          )}
        >
          <p className={BRANCHING.endingTitle}>{walk.ending.ending.title}</p>
          <Markdown source={walk.ending.ending.body} />
        </div>
      )}
    </div>
  )
}

/**
 * Choice game in the Discord replica: at each turn the learner decides, the conversation follows
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const BranchingExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<BranchingBlock>) => {
  const picks = asRecord(answer)
  // A new attempt replays from the first beat
  const [attempt, setAttempt] = useState(0)
  // Waits for its button, unless already played
  const [started, setStarted] = useState(!block.startLabel || answer !== undefined)

  const restart = () => {
    onAnswer({})
    onRetry()
    setAttempt((current) => current + 1)
  }

  return (
    <div className={COURSE_SCENE.wide}>
      <ExerciseFrame
        kind="branching"
        title={block.title}
        result={result}
        isSaving={isSaving}
        canCheck={false}
        autoCheck
        onCheck={() => onCheck()}
        onRetry={restart}
      >
        <div className={COURSE_SCENE.context}>
          <Markdown source={block.context} />
        </div>
        {!started && (
          <div className={COURSE_SCENE.controls}>
            <Button variant="primary" icon="flash" onClick={() => setStarted(true)}>
              {block.startLabel}
            </Button>
          </div>
        )}
        {started && (
          <BranchingStage
            key={attempt}
            block={block}
            picks={picks}
            isChecked={result !== undefined}
            onPick={(nodeKey, optionKey) => onAnswer({ ...picks, [nodeKey]: optionKey })}
            onEnd={() => {
              if (!result) onCheck(picks)
            }}
          />
        )}
        {result?.passed && (
          <div className={COURSE_SCENE.controls}>
            <Button variant="secondary" icon="refresh" onClick={restart}>
              {COURSE_COPY.branchingRestart}
            </Button>
          </div>
        )}
      </ExerciseFrame>
    </div>
  )
}
