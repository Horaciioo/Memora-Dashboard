import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readProgress } from '@/core/lib/curriculum/progress'
import { scoreExercise } from '@/core/lib/curriculum/scoring'
import type { ExerciseAnswer, ExerciseResult } from '@/core/lib/curriculum/scoring'
import { clearOpenTrainingStep } from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { COURSES, courseByKey, exercisesOf } from '@/declarations/academy/curriculum'
import type { Course } from '@/declarations/academy/curriculum/types'
import { isEncadrement } from '@/declarations/access/roles'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { JUNIOR_FUNCTION_OF } from '@/declarations/reference/fixed'
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

// Stages from which the secondary courses open
const PRACTICE_STAGES: AcademyStageName[] = [
  AcademyStages.Practice,
  AcademyStages.ReviewFinal,
  AcademyStages.Bonus,
]

// Catalogue written once per server process
let synced: Promise<void> | null = null

/**
 * Write the courses declared in code onto their training rows, once per process
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
        // A course for one trade hangs on it, a shared one on none
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
 * Trades a member works, a junior function counting as the trade it trains for
 * @param {string[]} functionIds - Functions held
 * @return {Promise<Set<string>>} - Trade names
 */

const tradesOf = async (functionIds: string[]): Promise<Set<string>> => {
  const rows = await prisma.jobFunction.findMany({
    where: { id: { in: functionIds } },
    select: { name: true },
  })

  return new Set(
    rows.map(
      (row) =>
        Object.entries(JUNIOR_FUNCTION_OF).find(([, junior]) => junior === row.name)?.[0] ??
        row.name
    )
  )
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
 * Read the catalogue a member follows: the courses of the trade their session trains for and the
 * shared ones, the secondary courses appearing only once a junior reaches the second period
 * @param {SessionUser} viewer - Signed-in member
 * @return {Promise<CourseCard[]>} - Courses, indispensable first
 */

export const listCourses = async (viewer: SessionUser): Promise<CourseCard[]> => {
  await syncCurriculum()

  const [trades, junior, rows] = await Promise.all([
    tradesOf(viewer.functionIds),
    prisma.academyJunior.findFirst({
      where: { accountId: viewer.id, status: AcademyJuniorStatuses.Active },
      select: { stage: true },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.training.findMany({
      where: { curriculumKey: { not: null } },
      include: { records: { where: { accountId: viewer.id } } },
      orderBy: { position: 'asc' },
    }),
  ])

  const seesAll = isEncadrement(viewer.role)
  const inPractice = !junior || PRACTICE_STAGES.includes(junior.stage)

  return rows.flatMap((row) => {
    const course = row.curriculumKey ? courseByKey(row.curriculumKey) : undefined
    if (!course || !concerns(course, trades, seesAll)) return []

    // The first period shows the indispensable courses alone, the rest arrives with practice
    if (course.track === 'secondary' && !inPractice && !seesAll) return []

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
      },
    ]
  })
}

/**
 * Address of a course when the member may open it
 * @param {SessionUser} viewer - Signed-in member
 * @param {string} key - Course key
 * @return {Promise<string | null>} - Reader address, none when not in their catalogue
 */

export const courseHrefFor = async (viewer: SessionUser, key: string): Promise<string | null> => {
  const card = (await listCourses(viewer)).find((entry) => entry.key === key)

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
  const card = (await listCourses(viewer)).find((entry) => entry.id === trainingId)
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

  await clearOpenTrainingStep(junior.id)

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
 * Score one exercise on the server, save it, and close the course once every exercise is
 * cleared, the follow-up file and the trainer hearing of it
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
      // A cleared exercise stays cleared, a later miss never undoes it
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
