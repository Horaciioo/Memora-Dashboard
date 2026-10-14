import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readProgress } from '@/core/lib/curriculum/progress'
import { scoreExercise } from '@/core/lib/curriculum/scoring'
import type { ExerciseAnswer, ExerciseResult } from '@/core/lib/curriculum/scoring'
import { hasSeenGuide } from '@/core/services/preferences/GuideService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import {
  AVAILABLE_COURSE_KEYS,
  COURSES,
  courseByKey,
  exercisesOf,
} from '@/declarations/academy/curriculum'
import type { Course } from '@/declarations/academy/curriculum/types'
import { isEncadrement } from '@/declarations/access/roles'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { GUIDE_KEYS, TOUR_COURSE_ID } from '@/declarations/academy/welcome'
import { ROUTES } from '@/declarations/navigation'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import type { SessionUser } from '@/types/auth'
import type { CourseCard, CourseProgress } from '@/types/academy'
import {
  AcademyJuniorStatuses,
  AcademyPeriods,
  AcademyStages,
  TrainingStatuses,
} from '@/utils/constants/hierarchy'
import type { AcademyStageName, TrainingStatusName } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

/**
 * Stages from which the secondary courses open
 * @type {AcademyStageName[]}
 */

export const PRACTICE_STAGES: AcademyStageName[] = [
  AcademyStages.Practice,
  AcademyStages.ReviewFinal,
  AcademyStages.Bonus,
]

/**
 * Whether the specialisations opened for a junior who has not been told yet
 * @param {string} accountId - Junior account
 * @return {Promise<boolean>} - Bubble due
 */

export const hasNewSpecialisations = async (accountId: string): Promise<boolean> => {
  const [junior, seen] = await Promise.all([
    prisma.academyJunior.findFirst({
      where: { accountId, status: AcademyJuniorStatuses.Active },
      select: { stage: true },
      orderBy: { startedAt: 'desc' },
    }),
    hasSeenGuide(accountId, GUIDE_KEYS.specialisations),
  ])

  return !seen && junior !== null && PRACTICE_STAGES.includes(junior.stage)
}

// Catalogue written once per server process
let synced: Promise<void> | null = null

/**
 * Write the courses declared in code onto their training rows
 * @return {Promise<void>} - Synced
 */

export const syncCurriculum = (): Promise<void> => {
  synced ??= (async () => {
    const functions = await prisma.jobFunction.findMany({ select: { id: true, name: true } })
    const functionIds = new Map(functions.map((row) => [row.name, row.id]))

    for (const [position, course] of COURSES.entries()) {
      const data = {
        name: course.name,
        summary: course.summary,
        period:
          course.track === 'indispensable' ? AcademyPeriods.Discovery : AcademyPeriods.Practice,
        mandatory: course.track === 'indispensable',
        // A course for one trade hangs on it
        functionId:
          course.functions.length === 1 ? (functionIds.get(course.functions[0]!) ?? null) : null,
        position,
      }

      await prisma.training.upsert({
        where: { curriculumKey: course.key },
        update: data,
        create: { ...data, curriculumKey: course.key },
      })
    }
  })().catch((error: unknown) => {
    synced = null
    throw error
  })

  return synced
}

/**
 * Trades a member works
 * @param {string[]} functionIds - Functions held
 * @return {Promise<Set<string>>} - Trade names
 */

const tradesOf = async (functionIds: string[]): Promise<Set<string>> => {
  const rows = await prisma.jobFunction.findMany({
    where: { id: { in: functionIds } },
    select: { name: true },
  })

  return new Set(rows.map((row) => tradeOfFunction(row.name)))
}

/**
 * Tell whether a course is meant for a member
 * @param {Course} course - Course
 * @param {Set<string>} trades - Trades of the member
 * @param {boolean} seesAll - Encadrement preview
 * @return {boolean} - Course shown
 */

const concerns = (course: Course, trades: Set<string>, seesAll: boolean): boolean =>
  seesAll || course.functions.length === 0 || course.functions.some((name) => trades.has(name))

/**
 * The first visit as a course: done by walking the pages, never opened
 * @param {boolean} isDone - Visit finished
 * @return {CourseCard} - Card
 */

const tourCard = (isDone: boolean): CourseCard => ({
  id: TOUR_COURSE_ID,
  key: TOUR_COURSE_ID,
  name: COURSE_COPY.tourName,
  summary: COURSE_COPY.tourSummary,
  track: 'indispensable',
  surface: 'general',
  minutes: 5,
  chapters: 0,
  exercises: 0,
  passed: 0,
  status: (isDone ? TrainingStatuses.Done : TrainingStatuses.NotStarted) as TrainingStatusName,
  isLocked: false,
  isTour: true,
})

/**
 * Who a catalogue is read for
 * @typedef {Object} CourseSubject
 * @property {string} accountId - Member whose records are read
 * @property {string[]} functionIds - Functions they hold
 * @property {boolean} seesAll - Encadrement preview, nothing is hidden
 * @property {AcademyStageName | null} stage - Stage of their PIM, none outside one
 */

export interface CourseSubject {
  accountId: string
  functionIds: string[]
  seesAll: boolean
  stage: AcademyStageName | null
}

/**
 * Build the catalogue of one member: the courses of their trade and the shared ones
 * @param {CourseSubject} subject - Member read
 * @return {Promise<CourseCard[]>} - Courses, without the first visit
 */

const buildCourses = async (subject: CourseSubject): Promise<CourseCard[]> => {
  await syncCurriculum()

  const [trades, rows] = await Promise.all([
    tradesOf(subject.functionIds),
    prisma.training.findMany({
      where: { curriculumKey: { not: null } },
      include: { records: { where: { accountId: subject.accountId } } },
      orderBy: { position: 'asc' },
    }),
  ])

  const inPractice = subject.stage === null || PRACTICE_STAGES.includes(subject.stage)

  return rows.flatMap((row): CourseCard[] => {
    const course = row.curriculumKey ? courseByKey(row.curriculumKey) : undefined
    if (!course || !concerns(course, trades, subject.seesAll)) return []

    // Specialisations wait for the practice period
    if (course.track === 'secondary' && !inPractice && !subject.seesAll) {
      return [
        {
          id: row.id,
          key: course.key,
          name: '',
          summary: '',
          track: course.track,
          surface: 'general',
          minutes: 0,
          chapters: 0,
          exercises: 0,
          passed: 0,
          status: TrainingStatuses.NotStarted as TrainingStatusName,
          isLocked: true,
        },
      ]
    }

    const record = row.records[0]
    const progress = readProgress(record?.progress)
    const exercises = exercisesOf(course)

    return [
      {
        id: row.id,
        key: course.key,
        name: course.name,
        summary: course.summary,
        track: course.track,
        surface: course.surface,
        minutes: course.minutes,
        chapters: course.chapters.length,
        exercises: exercises.length,
        passed: exercises.filter((block) => progress.blocks[block.key]?.passed).length,
        status: (record?.status ?? TrainingStatuses.NotStarted) as TrainingStatusName,
        isLocked: false,
        isUnavailable: !AVAILABLE_COURSE_KEYS.includes(course.key),
        maturity: course.maturity,
      },
    ]
  })
}

/**
 * Read the catalogue a member follows: the courses of the trade their session trains for and the shared ones
 * @param {SessionUser} viewer - Signed-in member
 * @return {Promise<CourseCard[]>} - Courses
 */

export const listCourses = async (viewer: SessionUser): Promise<CourseCard[]> => {
  const [junior, isTourDone] = await Promise.all([
    prisma.academyJunior.findFirst({
      where: { accountId: viewer.id, status: AcademyJuniorStatuses.Active },
      select: { stage: true },
      orderBy: { startedAt: 'desc' },
    }),
    hasSeenGuide(viewer.id, GUIDE_KEYS.tourDone),
  ])

  const cards = await buildCourses({
    accountId: viewer.id,
    functionIds: viewer.functionIds,
    seesAll: isEncadrement(viewer.role),
    stage: junior?.stage ?? null,
  })

  return [tourCard(isTourDone), ...cards]
}

/**
 * Read the catalogue of a junior, as they would see it
 * @param {string} juniorId - Junior seat
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<CourseCard[]>} - Courses, locked ones hidden behind their period
 */

export const juniorCourses = async (
  juniorId: string,
  scope: AcademyScope
): Promise<CourseCard[]> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope.session, ...scope.juniors },
    select: {
      accountId: true,
      stage: true,
      account: { select: { role: true, functions: { select: { functionId: true } } } },
    },
  })
  if (!junior) throw notFound()

  return buildCourses({
    accountId: junior.accountId,
    functionIds: junior.account.functions.map((held) => held.functionId),
    seesAll: isEncadrement(junior.account.role),
    stage: junior.stage,
  })
}

/**
 * Address of a course when the member may open it
 * @param {SessionUser} viewer - Signed-in member
 * @param {string} key - Course key
 * @return {Promise<string | null>} - Reader address
 */

export const courseHrefFor = async (viewer: SessionUser, key: string): Promise<string | null> => {
  const card = (await listCourses(viewer)).find(
    (entry) => entry.key === key && !entry.isLocked && !entry.isUnavailable && !entry.isTour
  )

  return card ? ROUTES.training(card.id) : null
}

/**
 * Read one course with the member's progress on it
 * @param {string} trainingId - Training identifier
 * @param {SessionUser} viewer - Signed-in member
 * @return {Promise<{ card: CourseCard, course: Course, progress: CourseProgress }>} - Course
 */

export const readCourse = async (
  trainingId: string,
  viewer: SessionUser
): Promise<{ card: CourseCard; course: Course; progress: CourseProgress }> => {
  const card = (await listCourses(viewer)).find(
    (entry) => entry.id === trainingId && !entry.isLocked && !entry.isUnavailable && !entry.isTour
  )
  const course = card ? courseByKey(card.key) : undefined
  if (!card || !course) throw notFound()

  const record = await prisma.trainingRecord.findUnique({
    where: { trainingId_accountId: { trainingId, accountId: viewer.id } },
    select: { progress: true },
  })

  return { card, course, progress: readProgress(record?.progress) }
}

/**
 * Tell the trainer of a junior that a course is done
 * @param {string} accountId - Junior account
 * @param {string} courseName - Course finished
 * @return {Promise<void>} - Notified
 */

const announceFinish = async (accountId: string, courseName: string): Promise<void> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { accountId, status: AcademyJuniorStatuses.Active },
    select: { id: true, trainerId: true },
    orderBy: { startedAt: 'desc' },
  })
  if (!junior) return

  // Responsables of the junior's creators hear of it too
  const creators = await prisma.account.findUnique({
    where: { id: accountId },
    select: { youtubers: { select: { id: true } } },
  })
  const leads = await prisma.youtuberLead.findMany({
    where: { youtuberId: { in: creators?.youtubers.map((creator) => creator.id) ?? [] } },
    select: { accountId: true },
  })
  const recipients = [junior.trainerId, ...leads.map((lead) => lead.accountId)]

  if (recipients.some(Boolean)) {
    await notify({
      kind: 'TrainingFinished',
      recipients,
      actorId: accountId,
      target: 'member',
      targetId: accountId,
      subject: courseName,
    })
  }
}

/**
 * Score one exercise on the server
 * @param {string} trainingId - Training identifier
 * @param {SessionUser} viewer - Signed-in member
 * @param {string} blockKey - Exercise key
 * @param {ExerciseAnswer} answer - Learner answer
 * @return {Promise<{ result: ExerciseResult, progress: CourseProgress, finished: boolean }>} - Outcome
 */

export const submitExercise = async (
  trainingId: string,
  viewer: SessionUser,
  blockKey: string,
  answer: ExerciseAnswer
): Promise<{ result: ExerciseResult; progress: CourseProgress; finished: boolean }> => {
  const { course, progress } = await readCourse(trainingId, viewer)
  const exercises = exercisesOf(course)
  const block = exercises.find((entry) => entry.key === blockKey)
  if (!block) throw notFound()

  const result = scoreExercise(block, answer, ACADEMY_SETTINGS.exercisePassPercent)
  const next: CourseProgress = {
    blocks: {
      ...progress.blocks,
      // A cleared exercise stays cleared
      [blockKey]: {
        passed: result.passed || progress.blocks[blockKey]?.passed === true,
        score: result.score,
        max: result.max,
        answer,
      },
    },
  }

  const finished = exercises.every((entry) => next.blocks[entry.key]?.passed)
  const existing = await prisma.trainingRecord.findUnique({
    where: { trainingId_accountId: { trainingId, accountId: viewer.id } },
    select: { status: true },
  })
  const alreadyDone = existing?.status === TrainingStatuses.Done

  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId: viewer.id } },
    update: {
      progress: next as unknown as Prisma.InputJsonValue,
      ...(finished && !alreadyDone
        ? { status: TrainingStatuses.Done, completedAt: new Date() }
        : alreadyDone
          ? {}
          : { status: TrainingStatuses.InProgress }),
    },
    create: {
      trainingId,
      accountId: viewer.id,
      startedAt: new Date(),
      progress: next as unknown as Prisma.InputJsonValue,
      status: finished ? TrainingStatuses.Done : TrainingStatuses.InProgress,
      completedAt: finished ? new Date() : null,
    },
  })

  if (finished && !alreadyDone) {
    await recordEvent({
      eventType: 'TrainingValidated',
      actorId: viewer.id,
      subjectId: viewer.id,
      targetType: 'training',
      targetId: trainingId,
      summary: course.name,
    })
    await announceFinish(viewer.id, course.name)
  }

  return { result, progress: next, finished }
}

/**
 * Keep what a learner thought of a course
 * @param {string} trainingId - Training identifier
 * @param {SessionUser} viewer - Signed-in member
 * @param {{ content: number, fluency: number, comment: string | null }} review - Marks out of 10
 * @return {Promise<void>} - Saved
 */

export const saveFeedback = async (
  trainingId: string,
  viewer: SessionUser,
  review: { content: number; fluency: number; comment: string | null }
): Promise<void> => {
  // Only a course the learner can open takes a review
  await readCourse(trainingId, viewer)

  await prisma.trainingFeedback.create({
    data: { trainingId, accountId: viewer.id, ...review },
  })
}
