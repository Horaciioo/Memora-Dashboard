import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { defaultState } from '@/core/services/work/shared'
import { PROGRAM_PROJECT_COPY } from '@/declarations/work/copy'
import { ROUTES } from '@/declarations/navigation'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'

// Priority the project opens with, the team may change it afterwards
const OPENING_PRIORITY = 'Urgente'

interface ProgramTask {
  key: string
  title: string
  description: string | null
  dueDate: Date | null
  href: string
  isDone: boolean
}

/**
 * Keep the project of a recruitment and the academy it feeds, and the tasks of their timeline,
 * in line with what both now say. Nothing here waits on a gesture from anyone
 * @param {string} recruitmentSessionId - Recruitment campaign
 * @return {Promise<void>} - Synced
 */

export const syncProgramProject = async (recruitmentSessionId: string): Promise<void> => {
  try {
    const session = await prisma.recruitmentSession.findUnique({
      where: { id: recruitmentSessionId },
      include: {
        academySession: true,
        responsables: { orderBy: { createdAt: 'asc' } },
        steps: { orderBy: { position: 'asc' } },
      },
    })
    if (!session) return

    const leadIds = session.responsables.map((seat) => seat.accountId)
    const links = [
      `[${PROGRAM_PROJECT_COPY.recruitment}](${ROUTES.recruitment(session.id)})`,
      ...(session.academySessionId
        ? [`[${PROGRAM_PROJECT_COPY.academy}](${ROUTES.session(session.academySessionId)})`]
        : []),
    ]
    const description = links.join('\n\n')

    const stored = await prisma.project.findUnique({
      where: { recruitmentSessionId },
      select: { id: true },
    })

    let projectId = stored?.id
    if (!projectId) {
      const [stateId, priority] = await Promise.all([
        defaultState(WorkflowScopes.Project),
        prisma.priority.findUnique({ where: { name: OPENING_PRIORITY } }),
      ])
      const created = await prisma.project.create({
        data: {
          title: `${PROGRAM_PROJECT_COPY.titlePrefix}${session.name}`,
          description,
          systemKey: `program:${session.id}`,
          recruitmentSessionId,
          academySessionId: session.academySessionId,
          stateId,
          priorityId: priority?.id ?? null,
          youtubers: { connect: [{ id: session.youtuberId }] },
          leads: { create: leadIds.map((accountId) => ({ accountId })) },
        },
        select: { id: true },
      })
      projectId = created.id
    } else {
      // Responsables join, the ones the team added stay
      await prisma.projectLead.createMany({
        data: leadIds.map((accountId) => ({ projectId: projectId!, accountId })),
        skipDuplicates: true,
      })
      await prisma.project.update({
        where: { id: projectId },
        data: {
          description,
          academySessionId: session.academySessionId,
          youtubers: { connect: [{ id: session.youtuberId }] },
        },
      })
    }

    const academy = session.academySession
    const wanted: ProgramTask[] = [
      ...session.steps.map((step) => ({
        key: `program:${session.id}:step:${step.id}`,
        title: step.title,
        description: step.notes,
        dueDate: step.scheduledAt,
        href: ROUTES.recruitment(session.id),
        isDone: step.doneAt !== null,
      })),
      ...(academy
        ? [
            {
              key: `program:${session.id}:academy:launch`,
              title: PROGRAM_PROJECT_COPY.launch,
              description: null,
              dueDate: academy.startsAt,
              href: ROUTES.session(academy.id),
              isDone:
                academy.status === AcademySessionStatuses.Running ||
                academy.status === AcademySessionStatuses.Closed,
            },
            ...(academy.secondPeriodAt
              ? [
                  {
                    key: `program:${session.id}:academy:second`,
                    title: PROGRAM_PROJECT_COPY.secondPeriod,
                    description: null,
                    dueDate: academy.secondPeriodAt,
                    href: ROUTES.session(academy.id),
                    isDone: false,
                  },
                ]
              : []),
            ...(academy.endsAt
              ? [
                  {
                    key: `program:${session.id}:academy:close`,
                    title: PROGRAM_PROJECT_COPY.close,
                    description: null,
                    dueDate: academy.endsAt,
                    href: ROUTES.session(academy.id),
                    isDone: academy.status === AcademySessionStatuses.Closed,
                  },
                ]
              : []),
          ]
        : []),
    ]

    const [todoId, doneState] = await Promise.all([
      defaultState(WorkflowScopes.Task),
      prisma.workflowState.findFirst({
        where: { scope: WorkflowScopes.Task, phase: WorkflowPhases.Done },
        orderBy: { position: 'asc' },
      }),
    ])
    const ownerId = leadIds[0] ?? null

    for (const task of wanted) {
      const base = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        href: task.href,
        ownerId,
        projectId,
      }
      await prisma.task.upsert({
        where: { systemKey: task.key },
        create: {
          ...base,
          systemKey: task.key,
          stateId: task.isDone && doneState ? doneState.id : todoId,
          youtubers: { connect: [{ id: session.youtuberId }] },
        },
        // A step cleared on the timeline closes its task, ticking one by hand stays
        update: task.isDone && doneState ? { ...base, stateId: doneState.id } : base,
      })
    }

    // Steps dropped from the timeline leave the board
    await prisma.task.deleteMany({
      where: {
        systemKey: { startsWith: `program:${session.id}:`, notIn: wanted.map((task) => task.key) },
      },
    })
  } catch (error) {
    // The recruitment and the academy never fail on their project
    logger.error('[program-project]', error)
  }
}

/**
 * Sync the project of the recruitment feeding an academy session
 * @param {string} academySessionId - Academy session
 * @return {Promise<void>} - Synced
 */

export const syncProgramProjectOfAcademy = async (academySessionId: string): Promise<void> => {
  const session = await prisma.recruitmentSession.findUnique({
    where: { academySessionId },
    select: { id: true },
  })
  if (session) await syncProgramProject(session.id)
}

/**
 * Sync the project of the recruitment a step belongs to
 * @param {string} stepId - Recruitment step
 * @return {Promise<void>} - Synced
 */

export const syncProgramProjectOfStep = async (stepId: string): Promise<void> => {
  const step = await prisma.recruitmentStep.findUnique({
    where: { id: stepId },
    select: { sessionId: true },
  })
  if (step) await syncProgramProject(step.sessionId)
}
