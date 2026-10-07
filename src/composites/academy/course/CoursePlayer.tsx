'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, ViewTransition } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PageHeader } from '@/components/structures/PageHeader'
import { CourseComplete } from '@/composites/academy/course/CourseComplete'
import {
  CourseContextProvider,
  EMPTY_COURSE_CONTEXT,
} from '@/composites/academy/course/CourseContextProvider'
import { CourseIntro } from '@/composites/academy/course/CourseIntro'
import { CourseOutro } from '@/composites/academy/course/CourseOutro'
import { CourseScreen } from '@/composites/academy/course/CourseScreen'
import { useCourse } from '@/core/hooks/data/useCourse'
import { publishCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { stepsOf } from '@/core/lib/academy/courseSteps'
import { fillCreator } from '@/core/lib/academy/creator'
import { moveSteps, STEP_TRANSITION } from '@/core/lib/academy/stepTransition'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { isExercise } from '@/declarations/academy/curriculum'
import type { Course } from '@/declarations/academy/curriculum/types'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_PLAYER } from '@/declarations/ui/variants'
import type { CourseContext, CourseProgress } from '@/types/academy'

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

/**
 * Reader of one interactive course
 * @param {CoursePlayerProps} props - Address
 * @return {JSX.Element}
 */

export const CoursePlayer = ({
  submitPath,
  course: source,
  initialProgress,
  backHref,
  backLabel,
  trainingId,
  context,
}: CoursePlayerProps) => {
  const creator = (context ?? EMPTY_COURSE_CONTEXT).creator
  // The name of the creator it is about goes where the course left its token
  const course = useMemo(() => fillCreator(source, creator), [source, creator])
  const run = useCourse(submitPath, course, initialProgress)
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  const BackIcon = ICONS.back
  const ForwardIcon = ICONS.forward

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
  // The welcome question has its own buttons
  const hasQuestion = screen.blocks.some((block) => block.kind === 'ask')

  // A screen clears once its exercises pass
  const screenExercises = screen.blocks.filter(isExercise)
  const stepCleared = screenExercises.every((block) => run.progress.blocks[block.key]?.passed)

  const goTo = useCallback(
    (index: number) => {
      moveSteps(index > current ? 'forward' : 'back', () => {
        setCurrent(index)
        setStep(0)
      })
      window.scrollTo({ top: 0 })
    },
    [current]
  )

  const goStep = useCallback(
    (index: number) => {
      moveSteps(index > step ? 'forward' : 'back', () => setStep(index))
      window.scrollTo({ top: 0 })
    },
    [step]
  )

  const next = () => {
    if (!stepCleared) return

    if (!isLastStep) goStep(step + 1)
  }

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
    <CourseContextProvider value={context ?? EMPTY_COURSE_CONTEXT}>
      <PageHeader title={course.name} />
      <div className={COURSE_PLAYER.page}>
        <Link href={backHref} className={COURSE_PLAYER.back}>
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

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
          <section className={COURSE_PLAYER.stage}>
            <div className={COURSE_PLAYER.body}>
              <ViewTransition
                key={screen.key}
                enter={STEP_TRANSITION}
                exit={STEP_TRANSITION}
                default="none"
              >
                <div className={COURSE_PLAYER.step}>
                  <CourseScreen step={screen} run={run} onNext={next} chapters={chapters} />
                </div>
              </ViewTransition>

              {!hasQuestion && (
                <footer className={COURSE_PLAYER.foot}>
                  {step > 0 ? (
                    <Button variant="secondary" onClick={() => goStep(step - 1)}>
                      <BackIcon className={COURSE_PLAYER.footGlyph} aria-hidden="true" />
                      {COURSE_COPY.previousStep}
                    </Button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {!isLastStep ? (
                    <Button variant="primary" disabled={!stepCleared} onClick={next}>
                      {COURSE_COPY.nextStep}
                      <ForwardIcon className={COURSE_PLAYER.footGlyph} aria-hidden="true" />
                    </Button>
                  ) : !isLast || reviewed ? (
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
                      <ForwardIcon className={COURSE_PLAYER.footGlyph} aria-hidden="true" />
                    </Button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {!isLastStep && !stepCleared && (
                    <p className={COURSE_PLAYER.footHint}>{COURSE_COPY.stepLocked}</p>
                  )}
                  {isLastStep && !canAdvance && (!isLast || reviewed) && (
                    <p className={COURSE_PLAYER.footHint}>{COURSE_COPY.nextLocked}</p>
                  )}
                </footer>
              )}
            </div>
          </section>
        )}

        {!reviewed && isLast && run.finished && <CourseComplete name={course.name} />}
      </div>
    </CourseContextProvider>
  )
}
