'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PageHeader } from '@/components/structures/PageHeader'
import { CaseExercise, QuizExercise } from '@/composites/academy/course/ChoiceExercises'
import { CommandExercise } from '@/composites/academy/course/CommandExercise'
import { CourseComplete } from '@/composites/academy/course/CourseComplete'
import { CourseTimeline } from '@/composites/academy/course/CourseTimeline'
import { FillExercise } from '@/composites/academy/course/FillExercise'
import { OrderExercise, SortExercise } from '@/composites/academy/course/OrderingExercises'
import { PlungeExercise } from '@/composites/academy/course/PlungeExercise'
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
import type { CourseProgress } from '@/types/academy'
import { cn } from '@/utils/classnames'

export interface CoursePlayerProps {
  // Where each exercise is sent
  submitPath: string
  course: Course
  initialProgress: CourseProgress
  backHref: string
  backLabel: string
}

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
    case 'plunge':
      return <PlungeExercise {...(props as ExerciseViewProps<typeof block>)} block={block} />
  }
}

/**
 * Reader of one interactive course, one chapter at a time. A timeline of circles follows the
 * reading, the next chapter opens only from its button once every exercise is cleared, and the
 * chapters stand in the left sidebar while the course is open
 * @param {CoursePlayerProps} props - Address, course, saved progress and the way back
 * @return {JSX.Element}
 */

export const CoursePlayer = ({
  submitPath,
  course,
  initialProgress,
  backHref,
  backLabel,
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

  // Reopens on the first chapter still to clear, or on the last one once everything is done
  const [current, setCurrent] = useState(() => {
    const open = course.chapters.findIndex((_, index) => !clearedAt(index))

    return open === -1 ? course.chapters.length - 1 : open
  })
  const [slide, setSlide] = useState<'forward' | 'back'>('forward')

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

  // The sidebar only ever goes back, never ahead of the chapter reached
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

  return (
    <>
      <PageHeader title={course.name} />
      <div className={COURSE_PLAYER.page}>
        <Link href={backHref} className={COURSE_PLAYER.back}>
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <CourseTimeline chapters={chapters} current={current} fill={fill} finished={run.finished} />

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
            {chapter.blocks.map((block) =>
              isExercise(block) ? (
                <ExerciseView
                  key={block.key}
                  block={block as ExerciseBlock}
                  answer={run.answers[block.key]}
                  result={run.results[block.key]}
                  isSaving={run.isSaving}
                  onAnswer={(answer) => run.answer(block.key, answer)}
                  onCheck={(answer) => void run.check(block, answer)}
                  onRetry={() => run.retry(block.key)}
                />
              ) : (
                <ReadBlock key={block.key} block={block} />
              )
            )}
          </div>

          {!isLast && (
            <footer className={COURSE_PLAYER.foot}>
              <span className={COURSE_PLAYER.rule} aria-hidden="true" />
              <Button
                variant="primary"
                icon="forward"
                disabled={!canAdvance}
                onClick={() => goTo(current + 1)}
              >
                {COURSE_COPY.nextChapter}
              </Button>
              {!canAdvance && <p className={COURSE_PLAYER.footHint}>{COURSE_COPY.nextLocked}</p>}
            </footer>
          )}
        </section>

        {isLast && run.finished && <CourseComplete name={course.name} />}
      </div>
    </>
  )
}
