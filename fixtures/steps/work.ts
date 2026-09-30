import { prisma, fx } from '../lib/client.ts'
import { day, plusMinutes } from '../lib/dates.ts'
import { between, chance, pick, sample } from '../lib/random.ts'
import { COMMUNICATIONS, MEETINGS, MEETING_TOPICS, PROJECTS, TASKS } from '../data/texts.ts'
import type { Cast, Person } from './people.ts'
import type { Reference } from './reference.ts'

/**
 * Work rows later steps point at
 * @typedef {Object} Work
 */

export interface Work {
  projects: { id: string; title: string; creatorId: string | null }[]
  tasks: { id: string; ownerId: string | null; title: string }[]
  meetings: { id: string; title: string; attendeeIds: string[]; scheduledAt: Date }[]
}

/**
 * Phase a piece of work sits in, read from how far its date is
 * @param {number} offset - Day offset of its deadline
 * @return {'TODO' | 'DOING' | 'DONE'} - Phase
 */

const phaseFor = (offset: number): 'TODO' | 'DOING' | 'DONE' => {
  if (offset < -10) return chance(0.85) ? 'DONE' : 'DOING'
  if (offset < 5) return chance(0.5) ? 'DOING' : pick(['TODO', 'DONE'] as const)

  return chance(0.7) ? 'TODO' : 'DOING'
}

/**
 * People working for one creator, or everyone when none
 * @param {Person[]} people - Candidates
 * @param {string | null} creatorId - Creator
 * @return {Person[]} - Matching people
 */

const forCreator = (people: Person[], creatorId: string | null): Person[] => {
  const active = people.filter((person) => person.status === 'ACTIVE')

  return creatorId ? active.filter((person) => person.creators.includes(creatorId)) : active
}

/**
 * Write the projects, their tasks, their meetings and the loose ones around them
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @return {Promise<Work>} - Work rows
 */

export const seedWork = async (reference: Reference, cast: Cast): Promise<Work> => {
  const work: Work = { projects: [], tasks: [], meetings: [] }
  const leaders = [...cast.responsables, cast.admins[1]]

  for (const [position, [emoji, title, description]] of PROJECTS.entries()) {
    const creator =
      position % 5 === 4 ? null : reference.creators[position % reference.creators.length]
    const creatorId = creator?.id ?? null
    const deadlineOffset = between(-120, 70)
    const createdAt = day(Math.min(deadlineOffset, 0) - between(20, 50), 10)
    const leads = sample(
      forCreator(leaders, creatorId).length > 0 ? forCreator(leaders, creatorId) : leaders,
      between(1, 2)
    )
    const assistants = sample(forCreator(cast.moderators, creatorId), between(2, 5))
    const author = leads[0]
    const id = fx('project')

    await prisma.project.create({
      data: {
        id,
        title,
        emoji,
        description: `${description}\n\n## Objectif\n\nLivrer avant la date prévue, avec un point d’étape chaque semaine.`,
        youtuberId: creatorId,
        stateId: reference.states.PROJECT[phaseFor(deadlineOffset)],
        priorityId: pick(reference.priorities),
        platformId: pick(reference.platforms).id,
        deadline: day(deadlineOffset, 23, 59),
        createdById: author.id,
        updatedById: pick(leads).id,
        position,
        archived: deadlineOffset < -90 && chance(0.5),
        createdAt,
        leads: {
          create: leads.map((person) => ({ id: fx('project-lead'), accountId: person.id })),
        },
        assistants: {
          create: assistants.map((person) => ({
            id: fx('project-assistant'),
            accountId: person.id,
          })),
        },
        communications: {
          create: sample(COMMUNICATIONS, between(0, 3)).map((body, index) => ({
            id: fx('communication'),
            authorId: pick(leads).id,
            platformId: pick(reference.platforms).id,
            title: pick([
              'Annonce aux viewers',
              'Message aux modos',
              'Rappel du programme',
              'Bilan public',
            ]),
            body,
            publishedAt: chance(0.7) ? day(Math.min(deadlineOffset, 0) - between(0, 15), 18) : null,
            position: index,
          })),
        },
      },
    })

    work.projects.push({ id, title, creatorId })

    // The tasks the project is broken into
    for (const [index, [taskEmoji, taskTitle]] of sample(TASKS, between(3, 7)).entries()) {
      const owner = chance(0.12) ? cast.root : pick([...assistants, ...leads])
      const dueOffset = deadlineOffset - between(0, 20)
      const task = fx('task')

      await prisma.task.create({
        data: {
          id: task,
          title: taskTitle,
          emoji: taskEmoji,
          description: chance(0.6)
            ? `Lié au projet **${title}**.\n\n- [ ] Préparer\n- [ ] Valider`
            : null,
          dueDate: chance(0.85) ? day(dueOffset, 20) : null,
          ownerId: owner.id,
          stateId: reference.states.TASK[phaseFor(dueOffset)],
          priorityId: pick(reference.priorities),
          youtuberId: creatorId,
          projectId: id,
          createdById: author.id,
          updatedById: pick(leads).id,
          position: index,
          createdAt: plusMinutes(createdAt, index * 600),
        },
      })

      work.tasks.push({ id: task, ownerId: owner.id, title: taskTitle })
    }
  }

  // Loose tasks, outside any project
  for (let index = 0; index < 30; index += 1) {
    const [emoji, title] = pick(TASKS)
    const creator = chance(0.8) ? pick(reference.creators).id : null
    const owner = chance(0.15) ? cast.root : pick(forCreator(cast.moderators, creator))
    const dueOffset = between(-150, 40)
    const task = fx('task')

    await prisma.task.create({
      data: {
        id: task,
        title,
        emoji,
        dueDate: chance(0.8) ? day(dueOffset, 21) : null,
        ownerId: owner.id,
        stateId: reference.states.TASK[phaseFor(dueOffset)],
        priorityId: pick(reference.priorities),
        youtuberId: creator,
        createdById: pick(leaders).id,
        position: 100 + index,
        archived: dueOffset < -100 && chance(0.4),
        createdAt: day(dueOffset - between(3, 20), 11),
      },
    })

    work.tasks.push({ id: task, ownerId: owner.id, title })
  }

  // One meeting a week or so over the whole history, and a few ahead
  for (let offset = -175; offset <= 28; offset += between(3, 7)) {
    const [emoji, title] = pick(MEETINGS)
    const project = chance(0.4) ? pick(work.projects) : null
    const creatorId = project?.creatorId ?? (chance(0.8) ? pick(reference.creators).id : null)
    const scheduledAt = day(offset, pick([18, 19, 20, 21]), pick([0, 30]))
    const lead = pick(
      forCreator(leaders, creatorId).length > 0 ? forCreator(leaders, creatorId) : leaders
    )
    const participants = sample(forCreator(cast.moderators, creatorId), between(3, 9))
    const assistant = participants.shift()
    const withRoot = chance(0.3)
    const isPast = offset < 0
    const id = fx('meeting')

    await prisma.meeting.create({
      data: {
        id,
        title,
        emoji,
        introduction: 'Tour de table rapide, puis les points dans l’ordre.',
        outro: isPast ? 'Prochaine réunion dans deux semaines, même heure.' : null,
        minutes: isPast
          ? `## Décisions\n\n- ${pick(MEETING_TOPICS)[2]}\n- Chacun relit le barème avant la fin de la semaine.\n\n## Présents\n\n${participants.length + 2} personnes.`
          : null,
        scheduledAt,
        durationMin: pick([30, 45, 60, 90]),
        stateId: reference.states.MEETING[isPast ? 'DONE' : chance(0.6) ? 'DOING' : 'TODO'],
        youtuberId: creatorId,
        projectId: project?.id ?? null,
        createdById: lead.id,
        updatedById: lead.id,
        position: offset + 200,
        createdAt: day(offset - between(3, 10), 12),
        topics: {
          create: sample(MEETING_TOPICS, between(2, 4)).map(
            ([topicEmoji, topicTitle, body], index) => ({
              id: fx('topic'),
              emoji: topicEmoji,
              title: topicTitle,
              body,
              position: index,
            })
          ),
        },
        attendees: {
          create: [
            { id: fx('attendee'), accountId: lead.id, kind: 'LEAD' as const },
            ...(assistant
              ? [{ id: fx('attendee'), accountId: assistant.id, kind: 'ASSISTANT' as const }]
              : []),
            ...participants.map((person) => ({
              id: fx('attendee'),
              accountId: person.id,
              kind: 'PARTICIPANT' as const,
            })),
            ...(withRoot
              ? [{ id: fx('attendee'), accountId: cast.root.id, kind: 'PARTICIPANT' as const }]
              : []),
          ],
        },
      },
    })

    work.meetings.push({
      id,
      title,
      scheduledAt,
      attendeeIds: [
        lead.id,
        ...(assistant ? [assistant.id] : []),
        ...participants.map((person) => person.id),
        ...(withRoot ? [cast.root.id] : []),
      ],
    })
  }

  return work
}
