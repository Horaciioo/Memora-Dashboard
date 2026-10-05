'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PageHeader } from '@/components/structures/PageHeader'
import { BranchingExercise } from '@/composites/academy/course/BranchingExercise'
import { CaseExercise, QuizExercise } from '@/composites/academy/course/ChoiceExercises'
import { CommandExercise } from '@/composites/academy/course/CommandExercise'
import { CompareRunsExercise } from '@/composites/academy/course/CompareRunsExercise'
import { CourseComplete } from '@/composites/academy/course/CourseComplete'
import { CourseContextProvider } from '@/composites/academy/course/CourseContextProvider'
import { CourseIntro } from '@/composites/academy/course/CourseIntro'
import { CourseOutro } from '@/composites/academy/course/CourseOutro'
import { CourseTimeline } from '@/composites/academy/course/CourseTimeline'
import { CourseWelcome } from '@/composites/academy/course/CourseWelcome'
import { FillExercise } from '@/composites/academy/course/FillExercise'
import { OrderExercise, SortExercise } from '@/composites/academy/course/OrderingExercises'
import { SceneExercise } from '@/composites/academy/course/SceneExercise'
import { ReadBlock } from '@/composites/academy/course/ReadBlock'
import { SimulationExercise } from '@/composites/academy/course/SimulationExercise'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { useCourse } from '@/core/hooks/data/useCourse'
import { publishCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { useSlideAdvance } from '@/core/hooks/interaction/useSlideAdvance'
import { stepsOf } from '@/core/lib/academy/courseSteps'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { isExercise } from '@/declarations/academy/curriculum'
import type { Course, ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_PLAYER } from '@/declarations/ui/variants'
import type { CourseContext, CourseProgress } from '@/types/academy'
import { cn } from '@/utils/classnames'

export interface CoursePlayerProps {
  // Where each exercise is sent
  submitPath: string
  course: Course
  initialProgress: CourseProgress
  backHref: string
  backLabel: string
  // Training reviewed at the end
  trainingId?: string
  context?: CourseContext
}

// Blocks showing the Mod View
const WIDE_KINDS = new Set<string>(['tour', 'focus', 'scene', 'compareRuns', 'branching'])

// Context of a course read without the database
const EMPTY_CONTEXT: CourseContext = { ladder: { admins: [], responsables: [] }, livecon: [] }

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
    case 'branching':
      return <BranchingExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
  }
}

/**
 * Reader of one interactive course
 * @param {CoursePlayerProps} props - Address
 * @return {JSX.Element}
 */

export const CoursePlayer = ({
  submitPath,
  course,
  initialProgress,
  backHref,
  backLabel,
  trainingId,
  context,
}: CoursePlayerProps) => {
  const run = useCourse(submitPath, course, initialProgress)
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  const BackIcon = ICONS.back
  const ExpandIcon = ICONS.expand

  const clearedAt = useCallback(
    (chapterIndex: number): boolean =>
      course.chapters[chapterIndex]!.blocks.filter(isExercise).every(
        (block) => run.progress.blocks[block.key]?.passed
      ),
    [course.chapters, run.progress.blocks]
  )

  // Reopens on the first chapter still to clear
  const [current, setCurrent] = useState(() => {
    const open = course.chapters.findIndex((_, index) => !clearedAt(index))

    return open === -1 ? course.chapters.length - 1 : open
  })
  // Screen of the chapter on display
  const [step, setStep] = useState(0)
  const [slide, setSlide] = useState<'forward' | 'back'>('forward')
  // Opening page until the first chapter
  const [page, setPage] = useState<'intro' | 'chapters' | 'outro'>(() =>
    course.intro && Object.keys(initialProgress.blocks).length === 0 ? 'intro' : 'chapters'
  )

  const chapter = course.chapters[current]!
  const isLast = current === course.chapters.length - 1
  const canAdvance = clearedAt(current)
  const steps = useMemo(() => stepsOf(chapter), [chapter])
  const screen = steps[Math.min(step, steps.length - 1)]!
  const isLastStep = step >= steps.length - 1

  // A screen clears once its exercises pass
  const stepCleared = screen.blocks
    .filter(isExercise)
    .every((block) => run.progress.blocks[block.key]?.passed)
  const fill = (step + (stepCleared ? 1 : 0)) / steps.length

  const goTo = useCallback(
    (index: number) => {
      setSlide(index > current ? 'forward' : 'back')
      setCurrent(index)
      setStep(0)
      window.scrollTo({ top: 0 })
    },
    [current]
  )

  const goStep = useCallback((index: number) => {
    setStep(index)
    window.scrollTo({ top: 0 })
  }, [])

  const next = () => {
    if (!stepCleared) return

    if (!isLastStep) goStep(step + 1)
  }

  // Sliding past the page edge moves along the chapter
  useSlideAdvance({
    enabled: page === 'chapters',
    canNext: stepCleared && !isLastStep,
    canPrevious: step > 0,
    onNext: next,
    onPrevious: () => goStep(step - 1),
  })

  const chapters = useMemo(
    () => course.chapters.map(({ key, title }) => ({ key, title })),
    [course.chapters]
  )

  // The sidebar only ever goes back
  useEffect(() => {
    publishCourseRail({
      courseName: course.name,
      surfaceLabel: surface.label,
      backHref,
      backLabel,
      chapters,
      current,
      steps: steps.map(({ key, label }) => ({ key, label })),
      step,
      onStep: (index) => {
        if (index < step) goStep(index)
      },
      finished: run.finished,
      onSelect: (index) => {
        if (index < current) goTo(index)
      },
    })
  }, [
    backHref,
    backLabel,
    chapters,
    course.name,
    current,
    goStep,
    goTo,
    run.finished,
    step,
    steps,
    surface.label,
  ])

  useEffect(() => () => publishCourseRail(null), [])

  const reviewed = Boolean(trainingId)

  const open = (next: 'intro' | 'chapters' | 'outro') => {
    setPage(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <CourseContextProvider value={context ?? EMPTY_CONTEXT}>
      <PageHeader title={course.name} />
      <div className={COURSE_PLAYER.page}>
        <Link href={backHref} className={COURSE_PLAYER.back}>
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <CourseTimeline chapters={chapters} current={current} fill={fill} finished={run.finished} />

        {page === 'intro' && course.intro && (
          <CourseIntro
            course={course}
            intro={course.intro}
            onStart={() => {
              // The opening button always leads to chapter 1
              setCurrent(0)
              open('chapters')
            }}
          />
        )}

        {page === 'outro' && trainingId && <CourseOutro trainingId={trainingId} />}

        {page === 'chapters' && (
          <section
            key={chapter.key}
            className={cn(
              COURSE_PLAYER.stage,
              slide === 'forward' ? COURSE_PLAYER.slideForward : COURSE_PLAYER.slideBack
            )}
          >
            <header className={COURSE_PLAYER.chapterHead}>
              <h2 className={COURSE_PLAYER.chapterTitle}>{chapter.title}</h2>
              <span className={COURSE_PLAYER.chapterDivider} aria-hidden="true" />
              <span className={COURSE_PLAYER.chapterCount}>
                {COURSE_COPY.chapterCount(current + 1, course.chapters.length)}
              </span>
            </header>

            <div key={screen.key} className={COURSE_PLAYER.step}>
              {screen.welcome ? (
                <CourseWelcome chapter={chapter} steps={steps} />
              ) : (
                <div className={COURSE_PLAYER.blocks}>
                  {screen.blocks.map((block, index) => (
                    <div
                      key={block.key}
                      className={cn(
                        COURSE_PLAYER.reveal,
                        !WIDE_KINDS.has(block.kind) && COURSE_PLAYER.column
                      )}
                      style={{ '--i': index } as CSSProperties}
                    >
                      {isExercise(block) ? (
                        <ExerciseView
                          block={block as ExerciseBlock}
                          answer={run.answers[block.key]}
                          result={run.results[block.key]}
                          isSaving={run.isSaving}
                          onAnswer={(answer) => run.answer(block.key, answer)}
                          onCheck={(answer) => void run.check(block, answer)}
                          onRetry={() => run.retry(block.key)}
                        />
                      ) : (
                        <ReadBlock block={block} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className={COURSE_PLAYER.hint}>
              <span className={COURSE_PLAYER.stepCount}>
                {COURSE_COPY.stepCounter(step + 1, steps.length)}
              </span>
              {!isLastStep ? (
                <button
                  type="button"
                  disabled={!stepCleared}
                  onClick={next}
                  className={COURSE_PLAYER.hintButton}
                >
                  {stepCleared ? COURSE_COPY.slideHint : COURSE_COPY.slideLocked}
                  <ExpandIcon className={COURSE_PLAYER.hintGlyph} aria-hidden="true" />
                </button>
              ) : (
                (!isLast || reviewed) && (
                  <>
                    <Button
                      variant="primary"
                      disabled={!canAdvance}
                      onClick={() => (isLast ? open('outro') : goTo(current + 1))}
                    >
                      {isLast
                        ? COURSE_COPY.nextPage
                        : COURSE_COPY.nextChapterTo(
                            current + 2,
                            course.chapters[current + 1]!.title
                          )}
                    </Button>
                    {!canAdvance && (
                      <p className={COURSE_PLAYER.footHint}>{COURSE_COPY.nextLocked}</p>
                    )}
                  </>
                )
              )}
            </footer>
          </section>
        )}

        {!reviewed && isLast && run.finished && <CourseComplete name={course.name} />}
      </div>
    </CourseContextProvider>
  )
}
