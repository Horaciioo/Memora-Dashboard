import { EVENT_TYPES, type EventTypeName } from '@/utils/constants/events'
import { NOTIFICATION_KINDS, type NotificationKindName } from '@/utils/constants/notifications'
import { prisma, fx, FIXTURE_PREFIX } from '../lib/client.ts'
import { day, plusMinutes } from '../lib/dates.ts'
import { between, chance, pick } from '../lib/random.ts'
import type { Cast } from './people.ts'

// Only the rows the fixtures wrote
const OWN = { id: { startsWith: FIXTURE_PREFIX } }

type Origin = 'User' | 'System' | 'Automation' | 'Scheduler'

// Origin ids
const ORIGINS: Record<Origin, number> = { User: 0, System: 1, Automation: 2, Scheduler: 3 }

/**
 * One journal line waiting to be written
 * @typedef {Object} LogLine
 */

interface LogLine {
  event: EventTypeName
  at: Date
  actorId?: string | null
  subjectId?: string | null
  targetType?: string
  targetId?: string
  summary: string
  change?: { verb: string; rest: string }
  origin?: Origin
}

/**
 * One notification waiting to be written
 * @typedef {Object} NoticeLine
 */

interface NoticeLine {
  kind: NotificationKindName
  recipientId: string
  actorId?: string | null
  targetType?: string
  targetId?: string
  subject?: string
  at: Date
}

/**
 * Journal and notifications of everything the fixtures wrote
 * @param {Cast} cast - People
 * @return {Promise<{ logs: number, notifications: number }>} - Counts
 */

export const seedJournal = async (cast: Cast) => {
  const logs: LogLine[] = []
  const notices: NoticeLine[] = []
  const now = new Date()
  const leads = [...cast.responsables, cast.admins[1]]
  const byId = new Map(cast.everyone.map((person) => [person.id, person]))

  // People: arrival, consent, edits of their file, logins
  for (const person of cast.everyone) {
    const author = pick(leads.filter((lead) => lead.id !== person.id))
    logs.push(
      {
        event: 'MemberCreated',
        at: person.joinedAt,
        actorId: author.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
      },
      {
        event: 'ConsentAccepted',
        at: plusMinutes(person.joinedAt, 30),
        actorId: person.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
      }
    )

    for (let count = between(0, 4); count > 0; count -= 1) {
      logs.push({
        event: 'MemberUpdated',
        at: day(-between(1, 170), between(9, 23)),
        actorId: chance(0.5) ? person.id : author.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
        change: pick([
          { verb: 'modifié', rest: 'le fuseau horaire en « Europe/Paris »' },
          { verb: 'renseigné', rest: 'les langues sur « Anglais »' },
          { verb: 'modifié', rest: 'le téléphone' },
          { verb: 'activé', rest: 'l’anniversaire dans l’équipe' },
          { verb: 'modifié', rest: 'le statut en « Actif »' },
        ]),
      })
    }

    if (chance(0.4)) {
      logs.push({
        event: 'DivisionChanged',
        at: day(-between(5, 160), 21),
        actorId: author.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
        change: {
          verb: 'modifié',
          rest: `la division en « ${pick(['Squad I', 'Squad II', 'Squad III'])} »`,
        },
      })
    }

    if (person.functions.length > 0 && chance(0.5)) {
      logs.push({
        event: 'FunctionChanged',
        at: plusMinutes(person.joinedAt, 1440 * between(1, 20)),
        actorId: author.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
      })
    }

    if (person.status !== 'LEFT') {
      for (let count = between(2, 10); count > 0; count -= 1) {
        const at = day(-between(0, 30), between(8, 23), between(0, 59))
        logs.push({
          event: 'SessionOpened',
          at,
          actorId: person.id,
          subjectId: person.id,
          summary: person.name,
        })
        if (chance(0.3))
          logs.push({
            event: 'SessionClosed',
            at: plusMinutes(at, between(20, 300)),
            actorId: person.id,
            subjectId: person.id,
            summary: person.name,
          })
      }
    } else {
      logs.push({
        event: 'MemberDeleted',
        at: day(-between(1, 150), 22),
        actorId: author.id,
        subjectId: person.id,
        targetType: 'member',
        targetId: person.id,
        summary: person.name,
      })
    }
  }

  const notes = await prisma.accountNote.findMany({ where: OWN })
  for (const note of notes) {
    logs.push({
      event: 'NoteAdded',
      at: note.createdAt,
      actorId: note.authorId,
      subjectId: note.accountId,
      targetType: 'member',
      targetId: note.accountId,
      summary: byId.get(note.accountId)?.name ?? '',
    })
  }

  // Work
  const projects = await prisma.project.findMany({
    where: OWN,
    include: { assistants: true, communications: true },
  })
  for (const project of projects) {
    logs.push({
      event: 'ProjectCreated',
      at: project.createdAt,
      actorId: project.createdById,
      targetType: 'project',
      targetId: project.id,
      summary: project.title,
    })
    logs.push({
      event: 'ProjectUpdated',
      at: plusMinutes(project.createdAt, 1440 * between(2, 20)),
      actorId: project.updatedById,
      targetType: 'project',
      targetId: project.id,
      summary: project.title,
      change: { verb: 'modifié', rest: 'l’état' },
    })

    for (const assistant of project.assistants) {
      notices.push({
        kind: 'ProjectAssigned',
        recipientId: assistant.accountId,
        actorId: project.createdById,
        targetType: 'project',
        targetId: project.id,
        subject: project.title,
        at: plusMinutes(project.createdAt, 60),
      })
    }

    for (const communication of project.communications.filter((entry) => entry.publishedAt)) {
      logs.push({
        event: 'CommunicationPublished',
        at: communication.publishedAt!,
        actorId: communication.authorId,
        targetType: 'project',
        targetId: project.id,
        summary: communication.title,
      })
      for (const assistant of project.assistants.slice(0, 3)) {
        notices.push({
          kind: 'CommunicationPublished',
          recipientId: assistant.accountId,
          actorId: communication.authorId,
          targetType: 'project',
          targetId: project.id,
          subject: communication.title,
          at: communication.publishedAt!,
        })
      }
    }
  }

  const tasks = await prisma.task.findMany({ where: OWN })
  for (const task of tasks) {
    logs.push({
      event: 'TaskCreated',
      at: task.createdAt,
      actorId: task.createdById,
      targetType: 'task',
      targetId: task.id,
      summary: task.title,
    })
    if (chance(0.6))
      logs.push({
        event: 'TaskUpdated',
        at: plusMinutes(task.createdAt, 1440 * between(1, 10)),
        actorId: task.updatedById ?? task.ownerId,
        targetType: 'task',
        targetId: task.id,
        summary: task.title,
        change: { verb: 'modifié', rest: 'l’état' },
      })
    if (task.ownerId && task.ownerId !== task.createdById) {
      notices.push({
        kind: 'TaskAssigned',
        recipientId: task.ownerId,
        actorId: task.createdById,
        targetType: 'task',
        targetId: task.id,
        subject: task.title,
        at: plusMinutes(task.createdAt, 5),
      })
    }
  }

  const meetings = await prisma.meeting.findMany({ where: OWN, include: { attendees: true } })
  for (const meeting of meetings) {
    logs.push({
      event: 'MeetingScheduled',
      at: meeting.createdAt,
      actorId: meeting.createdById,
      targetType: 'meeting',
      targetId: meeting.id,
      summary: meeting.title,
    })
    if (meeting.scheduledAt < now)
      logs.push({
        event: 'MeetingUpdated',
        at: plusMinutes(meeting.scheduledAt, 120),
        actorId: meeting.updatedById,
        targetType: 'meeting',
        targetId: meeting.id,
        summary: meeting.title,
        change: { verb: 'rédigé', rest: 'le compte rendu' },
      })

    for (const attendee of meeting.attendees.filter(
      (entry) => entry.accountId !== meeting.createdById
    )) {
      notices.push({
        kind: 'MeetingInvited',
        recipientId: attendee.accountId,
        actorId: meeting.createdById,
        targetType: 'meeting',
        targetId: meeting.id,
        subject: meeting.title,
        at: plusMinutes(meeting.createdAt, 10),
      })
    }
  }

  const teams = await prisma.team.findMany({ where: OWN, include: { members: true } })
  for (const team of teams) {
    for (const member of team.members) {
      if (chance(0.5))
        notices.push({
          kind: 'TeamAssigned',
          recipientId: member.accountId,
          actorId: team.leadId,
          targetType: 'team',
          targetId: team.id,
          subject: team.name,
          at: day(-between(20, 170), 19),
        })
    }
  }

  // Life of the team
  const absences = await prisma.absence.findMany({ where: OWN })
  for (const absence of absences) {
    const owner = byId.get(absence.accountId)
    logs.push({
      event: 'AbsenceRequested',
      at: absence.createdAt,
      actorId: absence.accountId,
      subjectId: absence.accountId,
      targetType: 'absence',
      targetId: absence.id,
      summary: owner?.name ?? '',
    })
    if (absence.reviewedAt) {
      logs.push({
        event: 'AbsenceReviewed',
        at: absence.reviewedAt,
        actorId: absence.reviewerId,
        subjectId: absence.accountId,
        targetType: 'absence',
        targetId: absence.id,
        summary: owner?.name ?? '',
      })
      notices.push({
        kind: 'AbsenceReviewed',
        recipientId: absence.accountId,
        actorId: absence.reviewerId,
        targetType: 'absence',
        targetId: absence.id,
        at: absence.reviewedAt,
      })
    }
  }

  const livecon = await prisma.liveconEntry.findMany({
    where: OWN,
    include: { level: true, youtuber: true },
  })
  for (const entry of livecon) {
    logs.push({
      event: 'LiveconChanged',
      at: entry.startedAt,
      actorId: entry.actorId,
      targetType: 'livecon',
      targetId: entry.youtuberId ?? undefined,
      summary: `${entry.youtuber?.name ?? ''} · ${entry.level.name}`,
    })
  }

  const rollCalls = await prisma.eventAttendance.findMany({ where: OWN, include: { event: true } })
  for (const attendance of rollCalls) {
    notices.push({
      kind: 'AttendanceRequested',
      recipientId: attendance.accountId,
      actorId: attendance.event.ownerId,
      targetType: 'calendar',
      targetId: attendance.eventId,
      subject: attendance.event.title,
      at: plusMinutes(attendance.event.startsAt, -3 * 1440),
    })
  }

  // Academy
  const juniors = await prisma.academyJunior.findMany({
    where: OWN,
    include: {
      account: true,
      reviews: true,
      skills: true,
      steps: { where: { validatedAt: { not: null } } },
      trainingRecords: true,
    },
  })
  for (const junior of juniors) {
    const name = junior.account.displayName
    logs.push({
      event: 'JuniorEnrolled',
      at: junior.startedAt,
      actorId: junior.trainerId,
      subjectId: junior.accountId,
      targetType: 'academy-junior',
      targetId: junior.id,
      summary: name,
    })

    for (const review of junior.reviews.filter((entry) => entry.decidedAt)) {
      logs.push({
        event: 'ReviewValidated',
        at: review.decidedAt!,
        actorId: review.decidedById,
        subjectId: junior.accountId,
        targetType: 'academy-review',
        targetId: review.id,
        summary: name,
      })
      notices.push({
        kind: 'ReviewDecided',
        recipientId: junior.accountId,
        actorId: review.decidedById,
        targetType: 'member',
        targetId: junior.accountId,
        subject: name,
        at: review.decidedAt!,
      })
      logs.push({
        event: 'AcademyAdvanced',
        at: plusMinutes(review.decidedAt!, 5),
        actorId: review.decidedById,
        subjectId: junior.accountId,
        targetType: 'academy-junior',
        targetId: junior.id,
        summary: name,
      })
    }

    for (const step of junior.steps.slice(0, 4)) {
      logs.push({
        event: 'StepValidated',
        at: step.validatedAt!,
        actorId: step.validatedById,
        subjectId: junior.accountId,
        targetType: 'academy-step',
        targetId: step.id,
        summary: step.title,
      })
      notices.push({
        kind: 'StepValidated',
        recipientId: junior.accountId,
        actorId: step.validatedById,
        targetType: 'member',
        targetId: junior.accountId,
        subject: step.title,
        at: step.validatedAt!,
      })
    }

    for (const skill of junior.skills.slice(0, 3)) {
      logs.push({
        event: 'SkillUpdated',
        at: plusMinutes(junior.startedAt, 1440 * between(3, 20)),
        actorId: skill.validatorId,
        subjectId: junior.accountId,
        targetType: 'skill',
        targetId: skill.id,
        summary: name,
      })
      notices.push({
        kind: 'SkillGraded',
        recipientId: junior.accountId,
        actorId: skill.validatorId,
        targetType: 'member',
        targetId: junior.accountId,
        subject: name,
        at: plusMinutes(junior.startedAt, 1440 * between(3, 20)),
      })
    }

    for (const record of junior.trainingRecords.filter((entry) => entry.completedAt)) {
      logs.push({
        event: 'TrainingValidated',
        at: record.completedAt!,
        actorId: record.validatorId,
        subjectId: junior.accountId,
        targetType: 'training',
        targetId: record.trainingId,
        summary: name,
      })
      notices.push({
        kind: 'TrainingValidated',
        recipientId: junior.accountId,
        actorId: record.validatorId,
        targetType: 'training',
        targetId: record.trainingId,
        subject: name,
        at: record.completedAt!,
      })
    }
  }

  // Recruitment
  const campaigns = await prisma.recruitmentSession.findMany({
    where: OWN,
    include: { candidates: { include: { outcome: true } }, responsables: true },
  })
  for (const campaign of campaigns) {
    logs.push({
      event: 'RecruitmentOpened',
      at: campaign.createdAt,
      actorId: campaign.responsables[0]?.accountId,
      targetType: 'recruitment',
      targetId: campaign.id,
      summary: campaign.name,
    })
    for (const responsable of campaign.responsables) {
      notices.push({
        kind: 'RecruitmentAssigned',
        recipientId: responsable.accountId,
        actorId: cast.root.id,
        targetType: 'recruitment',
        targetId: campaign.id,
        subject: campaign.name,
        at: campaign.createdAt,
      })
    }

    for (const candidate of campaign.candidates) {
      if (candidate.recruiterId) {
        notices.push({
          kind: 'CandidateAssigned',
          recipientId: candidate.recruiterId,
          actorId: campaign.responsables[0]?.accountId,
          targetType: 'recruitment',
          targetId: campaign.id,
          subject: campaign.name,
          at: plusMinutes(candidate.createdAt, 60),
        })
      }
      if (candidate.outcome?.isTerminal && candidate.interviewAt) {
        logs.push({
          event: 'RecruitmentDecided',
          at: plusMinutes(candidate.interviewAt, 2880),
          actorId: campaign.responsables[0]?.accountId,
          targetType: 'recruitment',
          targetId: campaign.id,
          summary: candidate.outcome.name,
        })
      }
    }
  }

  // Administration
  for (let count = 0; count < 25; count += 1) {
    const at = day(-between(1, 175), between(9, 23))
    logs.push(
      pick<LogLine>([
        {
          event: 'ReferenceChanged',
          at,
          actorId: cast.root.id,
          targetType: 'plateformes',
          summary: 'Plateforme · Twitch',
        },
        {
          event: 'PermissionChanged',
          at,
          actorId: cast.root.id,
          targetType: 'function',
          summary: 'Lives',
        },
        {
          event: 'SanctionChanged',
          at,
          actorId: pick(cast.responsables).id,
          targetType: 'sanctions',
          summary: 'Autre langue',
        },
        { event: 'LeadsAnchored', at, actorId: cast.root.id, targetType: 'youtuber', summary: '2' },
        {
          event: 'SecurityChanged',
          at,
          actorId: pick(cast.everyone).id,
          summary: 'Double authentification',
        },
      ])
    )
  }
  logs.push({
    event: 'PimHeld',
    at: day(-170, 20),
    actorId: pick(cast.responsables).id,
    summary: 'Ancienne PIM',
    origin: 'System',
  })

  // Loose mentions and access changes
  for (let count = 0; count < 30; count += 1) {
    const recipient = count % 2 === 0 ? cast.root : pick(cast.everyone)
    notices.push(
      chance(0.6)
        ? {
            kind: 'Mentioned',
            recipientId: recipient.id,
            actorId: pick(cast.everyone).id,
            subject: 'dans #modération',
            at: day(-between(0, 60), between(9, 23)),
          }
        : {
            kind: 'AccessChanged',
            recipientId: recipient.id,
            actorId: cast.root.id,
            targetType: 'member',
            targetId: recipient.id,
            at: day(-between(0, 90), 18),
          }
    )
  }

  // The root admin also hears about what the responsables do
  for (const project of projects.slice(0, 6)) {
    notices.push({
      kind: 'ProjectAssigned',
      recipientId: cast.root.id,
      actorId: project.createdById,
      targetType: 'project',
      targetId: project.id,
      subject: project.title,
      at: plusMinutes(project.createdAt, 30),
    })
  }

  await prisma.activityLog.createMany({
    data: logs.map((line) => ({
      id: fx('log'),
      eventType: EVENT_TYPES.ids[line.event],
      origin: ORIGINS[line.origin ?? 'User'],
      actorId: line.actorId ?? null,
      subjectId: line.subjectId ?? null,
      targetType: line.targetType ?? null,
      targetId: line.targetId ?? null,
      summary: line.summary,
      payload: line.change ? { change: line.change } : undefined,
      createdAt: line.at,
    })),
  })

  const past = notices.filter((notice) => notice.at <= now)
  await prisma.notification.createMany({
    data: past.map((notice) => {
      // Older ones were read
      const ageDays = (now.getTime() - notice.at.getTime()) / 86_400_000

      return {
        id: fx('notification'),
        recipientId: notice.recipientId,
        actorId: notice.actorId ?? null,
        kind: NOTIFICATION_KINDS.ids[notice.kind],
        targetType: notice.targetType ?? null,
        targetId: notice.targetId ?? null,
        subject: notice.subject ?? null,
        readAt: ageDays > 4 || chance(0.3) ? plusMinutes(notice.at, between(10, 600)) : null,
        createdAt: notice.at,
      }
    }),
  })

  return { logs: logs.length, notifications: past.length }
}
