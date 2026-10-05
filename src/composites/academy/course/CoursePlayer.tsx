'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import { FillExercise } from '@/composites/academy/course/FillExercise'
import { OrderExercise, SortExercise } from '@/composites/academy/course/OrderingExercises'
import { SceneExercise } from '@/composites/academy/course/SceneExercise'
import { ReadBlock } from '@/composites/academy/course/ReadBlock'
import { SimulationExercise } from '@/composites/academy/course/SimulationExercise'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { useCourse } from '@/core/hooks/data/useCourse'
import { publishCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { useScrollFill } from '@/core/hooks/interaction/useScrollFill'
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
  const chapterRef = useRef<HTMLElement>(null)

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
  const [slide, setSlide] = useState<'forward' | 'back'>('forward')
  // Opening page until the first chapter
  const [page, setPage] = useState<'intro' | 'chapters' | 'outro'>(() =>
    course.intro && Object.keys(initialProgress.blocks).length === 0 ? 'intro' : 'chapters'
  )

  const chapter = course.chapters[current]!
  const isLast = current === course.chapters.length - 1
  const canAdvance = clearedAt(current)
  const fill = useScrollFill(chapterRef, current)

  const goTo = useCallback(
    (index: number) => {
      setSlide(index > current ? 'forward' : 'back')
      setCurrent(index)
      window.scrollTo({ top: 0 })
    },
    [current]
  )

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
      finished: run.finished,
      onSelect: (index) => {
        if (index < current) goTo(index)
      },
    })
  }, [backHref, backLabel, chapters, course.name, current, goTo, run.finished, surface.label])

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
            ref={chapterRef}
            className={cn(
              COURSE_PLAYER.stage,
              slide === 'forward' ? COURSE_PLAYER.slideForward : COURSE_PLAYER.slideBack
            )}
          >
            <header className={COURSE_PLAYER.chapterHead}>
              <span className={COURSE_PLAYER.chapterCount}>
                {COURSE_COPY.chapterCount(current + 1, course.chapters.length)}
              </span>
              <h2 className={COURSE_PLAYER.chapterTitle}>{chapter.title}</h2>
            </header>

            <div className={COURSE_PLAYER.blocks}>
              {chapter.blocks.map((block) => (
                <div
                  key={block.key}
                  className={cn(!WIDE_KINDS.has(block.kind) && COURSE_PLAYER.column)}
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

            {(!isLast || reviewed) && (
              <footer className={COURSE_PLAYER.foot}>
                <span className={COURSE_PLAYER.rule} aria-hidden="true" />
                <Button
                  variant="primary"
                  disabled={!canAdvance}
                  onClick={() => (isLast ? open('outro') : goTo(current + 1))}
                >
                  {isLast
                    ? COURSE_COPY.nextPage
                    : COURSE_COPY.nextChapterTo(current + 2, course.chapters[current + 1]!.title)}
                </Button>
                {!canAdvance && <p className={COURSE_PLAYER.footHint}>{COURSE_COPY.nextLocked}</p>}
              </footer>
            )}
          </section>
        )}

        {!reviewed && isLast && run.finished && <CourseComplete name={course.name} />}
      </div>
    </CourseContextProvider>
  )
}
