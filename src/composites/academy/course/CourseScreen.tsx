'use client'

import type { ReactNode } from 'react'

import { AskBlock } from '@/composites/academy/course/AskBlock'
import { BranchingExercise } from '@/composites/academy/course/BranchingExercise'
import { CaseExercise, QuizExercise } from '@/composites/academy/course/ChoiceExercises'
import { JudgementExercise } from '@/composites/academy/course/JudgementExercise'
import { OutlineList } from '@/composites/academy/course/OutlineList'
import { CommandExercise } from '@/composites/academy/course/CommandExercise'
import { CompareRunsExercise } from '@/composites/academy/course/CompareRunsExercise'
import { FillExercise } from '@/composites/academy/course/FillExercise'
import { OrderExercise, SortExercise } from '@/composites/academy/course/OrderingExercises'
import { ReadBlock } from '@/composites/academy/course/ReadBlock'
import { SceneExercise } from '@/composites/academy/course/SceneExercise'
import { SimulationExercise } from '@/composites/academy/course/SimulationExercise'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import type { CourseRun } from '@/core/hooks/data/useCourse'
import type { CourseStep } from '@/core/lib/academy/courseSteps'
import { isExercise } from '@/declarations/academy/curriculum'
import type {
  ExerciseBlock,
  ReadBlock as ReadBlockData,
} from '@/declarations/academy/curriculum/types'
import { COURSE_PLAYER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Blocks written ahead of the visual, in the wide reading column
const LEAD_KINDS = new Set<string>([
  'text',
  'callout',
  'outline',
  'ask',
  'sanctionBox',
  'orgChart',
  'sanctionCompare',
  'livecon',
  'rules',
])

// Blocks that go inside the box of the titled text before them
const IN_BOX_KINDS = new Set<string>([
  'callout',
  'outline',
  'sanctionBox',
  'sanctionCompare',
  'orgChart',
])

// Blocks showing the Mod View
const WIDE_KINDS = new Set<string>([
  'tour',
  'focus',
  'scene',
  'compareRuns',
  'branching',
  'judgement',
])

/**
 * Exercise view of a block
 * @param {ExerciseViewProps} props - Block and its state
 * @return {JSX.Element}
 */

const ExerciseView = (props: ExerciseViewProps) => {
  const { block } = props

  switch (block.kind) {
    case 'quiz':
      return <QuizExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'fill':
      return <FillExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'sort':
      return <SortExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'order':
      return <OrderExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'simulation':
      return <SimulationExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'case':
      return <CaseExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'command':
      return <CommandExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'scene':
      return <SceneExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'compareRuns':
      return <CompareRunsExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'judgement':
      return <JudgementExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
    case 'branching':
      return <BranchingExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
  }
}

export interface CourseScreenProps {
  step: CourseStep
  run: CourseRun
  // Goes on to the next screen
  onNext: () => void
  // Chapters of the course, for the plan
  chapters: { key: string; title: string }[]
}

/**
 * Blocks of the screen on display
 * @param {CourseScreenProps} props - Screen, the run of the course and the way on
 * @return {JSX.Element}
 */

export const CourseScreen = ({ step, run, onNext, chapters }: CourseScreenProps) => {
  // A note, a plan or a visual right after a titled text sits inside that text's box
  const asides = new Map<string, ReactNode>()
  const kept = new Set<string>()
  // An animation right after a titled text stands to the right of its box
  const sides = new Map<string, ReactNode>()
  step.blocks.forEach((block, index) => {
    const following = step.blocks[index + 1]
    if (block.kind === 'text' && block.title && following?.kind === 'voices') {
      sides.set(block.key, <ReadBlock block={following} />)
      kept.add(following.key)
      return
    }
    if (block.kind !== 'text' || !block.title || !following || !IN_BOX_KINDS.has(following.kind)) {
      return
    }
    asides.set(
      block.key,
      following.kind === 'outline' ? (
        <OutlineList chapters={chapters} />
      ) : (
        <ReadBlock block={following as ReadBlockData} isNested />
      )
    )
    kept.add(following.key)
  })

  return (
    <div className={COURSE_PLAYER.blocks}>
      {step.blocks
        .filter((block) => !kept.has(block.key))
        .map((block) => {
          const isLead = LEAD_KINDS.has(block.kind)
          const view = isExercise(block) ? (
            <ExerciseView
              block={block as ExerciseBlock}
              answer={run.answers[block.key]}
              result={run.results[block.key]}
              isSaving={run.isSaving}
              onAnswer={(answer) => run.answer(block.key, answer)}
              onCheck={(answer) => void run.check(block, answer)}
              onRetry={() => run.retry(block.key)}
            />
          ) : block.kind === 'ask' ? (
            <AskBlock block={block} onYes={onNext} />
          ) : (
            <ReadBlock block={block} aside={asides.get(block.key)} />
          )

          return (
            <div
              key={block.key}
              className={cn(
                isLead ? COURSE_PLAYER.lead : !WIDE_KINDS.has(block.kind) && COURSE_PLAYER.column,
                sides.has(block.key) && COURSE_PLAYER.beside
              )}
            >
              {view}
              {sides.get(block.key)}
            </div>
          )
        })}
    </div>
  )
}
