import { INTEGRATION_STEP } from '@/declarations/recruitment/outcomes'
import { prisma, fx, fxDiscordId } from '../lib/client.ts'
import { day, plusMinutes } from '../lib/dates.ts'
import { between, chance, pick, sample, token, weighted } from '../lib/random.ts'
import type { FunctionKey } from '../data/roster.ts'
import {
  CANDIDATE_COMMENTS,
  CANDIDATE_REVIEWS,
  JUNIOR_NOTES_NEGATIVE,
  JUNIOR_NOTES_POSITIVE,
  JUNIOR_OBJECTIVES,
  REVIEW_FEELINGS,
  REVIEW_SUMMARIES,
} from '../data/texts.ts'
import type { Cast, Person } from './people.ts'
import type { Reference } from './reference.ts'

type Stage = 'PREPARATION' | 'DISCOVERY' | 'REVIEW_ONE' | 'PRACTICE' | 'REVIEW_FINAL' | 'BONUS'
type Campaign = 'DRAFT' | 'ANNOUNCED' | 'INTERVIEWS' | 'CLOSED' | 'ARCHIVED'
type Promotion = 'DRAFT' | 'OPEN' | 'RUNNING' | 'CLOSED' | 'ARCHIVED'

// Gap between two ordered rows, as the app spaces them
const POSITION_STEP = 1000

// Days a PIM lasts from the promotion start, per stage
const STAGE_STARTS: [Stage, number][] = [
  ['DISCOVERY', 0],
  ['REVIEW_ONE', 10],
  ['PRACTICE', 14],
  ['REVIEW_FINAL', 28],
  ['BONUS', 32],
]

const STAGE_ORDER: Stage[] = [
  'PREPARATION',
  'DISCOVERY',
  'REVIEW_ONE',
  'PRACTICE',
  'REVIEW_FINAL',
  'BONUS',
]

/**
 * Campaigns of the fixtures, each feeding its own promotion
 * @type {Array<Object>}
 */

const CAMPAIGNS: {
  creator: number
  functionKey: FunctionKey
  opens: number | null
  campaign: Campaign
  promotion: Promotion
}[] = [
  {
    creator: 0,
    functionKey: 'functionLive',
    opens: -175,
    campaign: 'ARCHIVED',
    promotion: 'ARCHIVED',
  },
  {
    creator: 1,
    functionKey: 'functionDiscord',
    opens: -150,
    campaign: 'CLOSED',
    promotion: 'CLOSED',
  },
  { creator: 2, functionKey: 'functionLive', opens: -110, campaign: 'CLOSED', promotion: 'CLOSED' },
  {
    creator: 0,
    functionKey: 'functionDiscord',
    opens: -48,
    campaign: 'CLOSED',
    promotion: 'RUNNING',
  },
  { creator: 3, functionKey: 'functionLive', opens: -40, campaign: 'CLOSED', promotion: 'RUNNING' },
  {
    creator: 1,
    functionKey: 'functionLive',
    opens: -12,
    campaign: 'INTERVIEWS',
    promotion: 'OPEN',
  },
  {
    creator: 2,
    functionKey: 'functionAnimator',
    opens: 6,
    campaign: 'ANNOUNCED',
    promotion: 'DRAFT',
  },
  {
    creator: 3,
    functionKey: 'functionDiscord',
    opens: null,
    campaign: 'DRAFT',
    promotion: 'DRAFT',
  },
]

/**
 * Stage a junior sits in after some days of PIM
 * @param {number} daysIn - Days since the promotion started
 * @return {Stage} - Stage
 */

const stageAfter = (daysIn: number): Stage =>
  STAGE_STARTS.reduce<Stage>(
    (current, [stage, start]) => (daysIn >= start ? stage : current),
    'PREPARATION'
  )

/**
 * Whether a stage is behind another one
 * @param {Stage} stage - Stage checked
 * @param {Stage} reached - Stage the junior is at
 * @return {boolean} - Already passed
 */

const isPast = (stage: Stage, reached: Stage): boolean =>
  STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(reached)

/**
 * Write every campaign, its promotion and the whole path of its juniors
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @return {Promise<{ juniorIds: string[], candidateCount: number }>} - What was written
 */

export const seedPipeline = async (reference: Reference, cast: Cast) => {
  const trainers = [...cast.responsables, ...cast.moderators].filter(
    (person) => person.functions.includes('functionTrainer') && person.status === 'ACTIVE'
  )
  const recruiters = [...cast.responsables, ...cast.moderators].filter(
    (person) => person.functions.includes('functionRecruiter') && person.status === 'ACTIVE'
  )
  const stepTemplates = await prisma.recruitmentStepTemplate.findMany({
    where: { archived: false, youtuberId: null, functionId: null },
    orderBy: [{ offset: 'asc' }, { position: 'asc' }],
  })
  const closingOffset = stepTemplates.reduce((last, template) => Math.max(last, template.offset), 0)
  const outcome = (name: string) => reference.outcomes.find((entry) => entry.name === name)!.id

  // Juniors of the running promotions are the moderators still in academy
  const inAcademy = cast.moderators.filter((person) => person.status === 'ACADEMY')
  const used = new Set<string>()
  const written = { juniorIds: [] as string[], candidateCount: 0 }
  let candidateIndex = 5000

  for (const [index, seed] of CAMPAIGNS.entries()) {
    const creator = reference.creators[seed.creator]
    const jobFunction = reference.functions[seed.functionKey]
    const opensAt = seed.opens === null ? null : day(seed.opens, 18)
    const startsAt = seed.opens === null ? day(45) : day(seed.opens + closingOffset, 19)
    const leads = cast.responsables.filter((person) => person.creators.includes(creator.id))
    const sessionTrainers = sample(trainers, Math.min(3, trainers.length))

    const promotion = await prisma.academySession.create({
      data: {
        id: fx('academy-session'),
        functionId: jobFunction.id,
        startsAt,
        endsAt:
          seed.promotion === 'CLOSED' || seed.promotion === 'ARCHIVED'
            ? day(seed.opens! + closingOffset + 40)
            : null,
        status: seed.promotion,
        summary: `Promotion ${jobFunction.name} · ${creator.name}`,
        createdAt: opensAt ?? day(-3),
        trainers: {
          create: sessionTrainers.map((person) => ({
            id: fx('academy-trainer'),
            accountId: person.id,
          })),
        },
      },
    })

    const campaign = await prisma.recruitmentSession.create({
      data: {
        id: fx('recruitment'),
        youtuberId: creator.id,
        functionId: jobFunction.id,
        academySessionId: promotion.id,
        name: `Recrutement ${jobFunction.name} ${index + 1}`,
        status: seed.campaign,
        summary: `On cherche des profils ${jobFunction.name.toLowerCase()} pour ${creator.name}.`,
        instructions:
          '## Déroulé de l’entretien\n\n1. Présentation\n2. Mises en situation\n3. Questions du candidat\n\nPrends des notes dans la fiche du candidat.',
        opensAt,
        closesAt: opensAt ? day(seed.opens! + 7, 23) : null,
        createdAt: opensAt ? day(seed.opens! - 5) : day(-2),
        responsables: {
          create: (leads.length > 0 ? leads : cast.admins).map((person) => ({
            id: fx('recruitment-lead'),
            accountId: person.id,
          })),
        },
        steps: {
          create: [
            ...stepTemplates.map((template, position) => {
              const scheduledAt = opensAt ? day(seed.opens! + template.offset, 20) : null

              return {
                id: fx('recruitment-step'),
                templateId: template.id,
                title: template.title,
                notes: template.description,
                owner: template.owner,
                offset: template.offset,
                scheduledAt,
                doneAt: scheduledAt && scheduledAt < new Date() ? scheduledAt : null,
                required: template.required,
                position: position * POSITION_STEP,
              }
            }),
            {
              id: fx('recruitment-step'),
              title: INTEGRATION_STEP.title,
              notes: INTEGRATION_STEP.description,
              owner: INTEGRATION_STEP.owner,
              offset: closingOffset,
              scheduledAt: opensAt ? day(seed.opens! + closingOffset, 21) : null,
              doneAt:
                opensAt && seed.opens! + closingOffset < 0
                  ? day(seed.opens! + closingOffset, 21)
                  : null,
              required: INTEGRATION_STEP.required,
              emitsInvite: true,
              position: stepTemplates.length * POSITION_STEP,
            },
          ],
        },
      },
    })

    // Who the promotion takes in, read from the campaign's age
    let juniors: Person[] = []
    if (seed.promotion === 'RUNNING') {
      const share = inAcademy.filter((person) => !used.has(person.id))
      juniors = share.slice(0, Math.ceil(inAcademy.length / 2))
    } else if (seed.promotion === 'CLOSED' || seed.promotion === 'ARCHIVED') {
      juniors = sample(
        cast.moderators.filter(
          (person) =>
            !used.has(person.id) &&
            person.status !== 'ACADEMY' &&
            person.status !== 'PENDING' &&
            person.joinedAt <= startsAt
        ),
        between(3, 6)
      )
    }
    juniors.forEach((person) => used.add(person.id))

    for (const person of juniors) {
      written.juniorIds.push(
        await writeJunior(
          reference,
          person,
          promotion.id,
          startsAt,
          seed.functionKey,
          seed.promotion,
          sessionTrainers
        )
      )
    }

    await writePrepSteps(reference, promotion.id, startsAt, sessionTrainers)

    // Candidates, the accepted ones being the juniors themselves
    const candidates = await writeCandidates({
      campaignId: campaign.id,
      campaign: seed.campaign,
      opens: seed.opens,
      juniors,
      recruiters: recruiters.length > 0 ? recruiters : leads,
      commenters: [...leads, ...recruiters],
      spectators: cast.moderators.filter(
        (person) => person.creators.includes(creator.id) && person.status === 'ACTIVE'
      ),
      outcome,
      nextIndex: () => candidateIndex++,
    })
    written.candidateCount += candidates.length

    // The integration link of a campaign in interviews, some candidates already through it
    if (seed.campaign === 'INTERVIEWS') {
      await prisma.integrationInvite.create({
        data: {
          id: fx('invite'),
          kind: 'ACCOUNT',
          token: token(32),
          youtuberId: creator.id,
          functionId: jobFunction.id,
          sessionId: promotion.id,
          recruitmentSessionId: campaign.id,
          expiresAt: day(20),
          maxUses: 10,
          uses: 3,
          createdById: leads[0]?.id ?? cast.root.id,
          claims: {
            create: candidates.slice(0, 4).map((discordId, position) => ({
              id: fx('claim'),
              discordId,
              discordUsername: `candidat${position + 1}`,
              claimedAt: day(-between(1, 6), 21),
              submittedAt: position < 3 ? day(-between(0, 1), 22) : null,
            })),
          },
        },
      })
    }

    // Kick-off of the promotion on the calendar
    if (seed.opens !== null) {
      await prisma.calendarEvent.create({
        data: {
          id: fx('event'),
          title: `Accueil de la promotion ${jobFunction.name}`,
          emoji: '🎓',
          kind: 'EVENT',
          ownerId: sessionTrainers[0]?.id ?? cast.root.id,
          youtuberId: creator.id,
          sessionId: promotion.id,
          startsAt: startsAt,
          endsAt: plusMinutes(startsAt, 90),
          visibility: 'EVERYONE',
        },
      })
    }
  }

  // Standing links: one to complete a profile, one to join the academy directly
  await prisma.integrationInvite.createMany({
    data: [
      {
        id: fx('invite'),
        kind: 'PROFILE',
        token: token(32),
        youtuberId: reference.creators[0].id,
        expiresAt: day(30),
        maxUses: null,
        uses: 7,
        createdById: cast.root.id,
      },
      {
        id: fx('invite'),
        kind: 'ACADEMY',
        token: token(32),
        youtuberId: reference.creators[2].id,
        functionId: reference.functions.functionLive.id,
        expiresAt: day(-3),
        maxUses: 5,
        uses: 5,
        createdById: cast.responsables[0].id,
      },
    ],
  })

  await seedStandaloneTrainings(reference, cast)

  return written
}

/**
 * Write one junior with their whole PIM: steps, reviews, skills, notes, objectives, trainings
 * @return {Promise<string>} - Junior identifier
 */

const writeJunior = async (
  reference: Reference,
  person: Person,
  sessionId: string,
  startsAt: Date,
  functionKey: FunctionKey,
  promotion: Promotion,
  trainers: Person[]
): Promise<string> => {
  const daysIn = Math.floor((Date.now() - startsAt.getTime()) / 86_400_000) - between(0, 6)
  const isOver = promotion === 'CLOSED' || promotion === 'ARCHIVED'
  const stopped = isOver && chance(0.2)
  const stage: Stage = isOver
    ? stopped
      ? pick<Stage>(['REVIEW_ONE', 'PRACTICE'])
      : pick<Stage>(['REVIEW_FINAL', 'BONUS'])
    : stageAfter(daysIn)
  const trainer = trainers.length > 0 ? pick(trainers) : null
  const liveCount = isOver ? between(6, 12) : Math.max(0, Math.floor(daysIn / 3))
  const validatedAt = isOver && !stopped ? plusMinutes(startsAt, between(30, 40) * 1440) : null
  const id = fx('junior')

  await prisma.academyJunior.create({
    data: {
      id,
      sessionId,
      accountId: person.id,
      trainerId: trainer?.id ?? null,
      dispositifId: pick(reference.dispositifs),
      status: isOver ? (stopped ? 'STOPPED' : 'VALIDATED') : 'ACTIVE',
      stage,
      startedAt: startsAt,
      validatedAt,
      liveCount,
      bonusLives: stage === 'BONUS' ? between(1, 3) : 0,
      summary: chance(0.6) ? 'Profil sérieux, progresse bien depuis le début.' : null,
    },
  })

  const validator = trainer ?? trainers[0] ?? null

  // Timeline, from the trame, done up to where the junior stands
  const templates = reference.pimTemplates.filter((template) => template.stage !== 'PREPARATION')
  await prisma.academyStep.createMany({
    data: templates.map((template) => {
      const scheduledAt =
        template.anchor === 'DAY'
          ? day(Math.round((startsAt.getTime() - Date.now()) / 86_400_000) + template.offset, 20)
          : null
      const done =
        isPast(template.stage as Stage, stage) ||
        (template.anchor === 'LIVE' && liveCount >= template.offset)

      return {
        id: fx('academy-step'),
        sessionId,
        juniorId: id,
        templateId: template.id,
        title: template.title,
        notes: `Étape « ${template.title} ».`,
        stage: template.stage as Stage,
        anchor: template.anchor as 'DAY' | 'LIVE',
        offset: template.offset,
        owner: template.owner as 'RESPONSABLE' | 'FORMATEURS' | 'BOTH' | 'JUNIOR',
        required: template.required,
        scheduledAt,
        doneAt: done ? (scheduledAt ?? plusMinutes(startsAt, template.offset * 1440)) : null,
        validatedById: done && template.required ? (validator?.id ?? null) : null,
        validatedAt:
          done && template.required
            ? (scheduledAt ?? plusMinutes(startsAt, template.offset * 1440))
            : null,
      }
    }),
  })

  // Voice check-ins of each review stage reached
  for (const reviewStage of ['REVIEW_ONE', 'REVIEW_FINAL'] as Stage[]) {
    const reached = isPast(reviewStage, stage)
    const current = reviewStage === stage
    if (!reached && !current) continue

    const heldAt = plusMinutes(startsAt, (reviewStage === 'REVIEW_ONE' ? 10 : 28) * 1440 + 20 * 60)
    const advice =
      stopped && reviewStage === stage
        ? 'STOP'
        : stage === 'BONUS' && reviewStage === 'REVIEW_FINAL'
          ? 'BONUS'
          : 'PASS'
    const status =
      reached || isOver
        ? 'VALIDATED'
        : weighted([
            ['SUBMITTED', 60],
            ['DRAFT', 40],
          ])

    await prisma.academyReview.create({
      data: {
        id: fx('academy-review'),
        juniorId: id,
        authorId: trainer?.id ?? null,
        stage: reviewStage,
        heldAt,
        durationMinutes: pick([20, 30, 45]),
        feeling: pick(REVIEW_FEELINGS),
        summary: pick(REVIEW_SUMMARIES),
        advice,
        status: status as 'DRAFT' | 'SUBMITTED' | 'VALIDATED',
        decidedById: status === 'VALIDATED' ? (validator?.id ?? null) : null,
        decidedAt: status === 'VALIDATED' ? plusMinutes(heldAt, 1440) : null,
        decisionNote:
          status === 'VALIDATED' && chance(0.5) ? 'Validé en réunion des formateurs.' : null,
      },
    })
  }

  // Grades on the skills of the trade, higher the further along
  const progress = STAGE_ORDER.indexOf(stage) / (STAGE_ORDER.length - 1)
  const functionId = reference.functions[functionKey].id
  const skills = reference.skills.filter(
    (skill) => skill.functionId === null || skill.functionId === functionId
  )
  await prisma.juniorSkill.createMany({
    data: skills
      .filter(() => progress > 0.15 || chance(0.4))
      .map((skill) => ({
        id: fx('junior-skill'),
        juniorId: id,
        skillId: skill.id,
        percent: Math.min(100, Math.max(0, Math.round(progress * 100) + between(-25, 10))),
        validatorId: validator?.id ?? null,
        note: chance(0.3) ? 'En net progrès depuis le dernier bilan.' : null,
      })),
  })

  // Traces kept on the FSI
  for (let count = between(1, 4); count > 0; count -= 1) {
    const positive = chance(0.7)
    await prisma.juniorNote.create({
      data: {
        id: fx('junior-note'),
        juniorId: id,
        authorId: pick(trainers.length > 0 ? trainers : [person]).id,
        stage: STAGE_ORDER[between(1, Math.max(1, STAGE_ORDER.indexOf(stage)))],
        kind: positive ? 'POSITIVE' : 'NEGATIVE',
        body: pick(positive ? JUNIOR_NOTES_POSITIVE : JUNIOR_NOTES_NEGATIVE),
        createdAt: plusMinutes(startsAt, between(1, Math.max(2, daysIn)) * 1440),
      },
    })
  }

  // Personal objectives, once practice is reached
  if (STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf('PRACTICE')) {
    for (const [position, [title, description]] of sample(
      JUNIOR_OBJECTIVES,
      between(1, 3)
    ).entries()) {
      await prisma.juniorObjective.create({
        data: {
          id: fx('junior-objective'),
          juniorId: id,
          authorId: trainer?.id ?? null,
          title,
          description,
          dueAt: plusMinutes(startsAt, (28 + position * 2) * 1440),
          status: isOver
            ? pick(['REACHED', 'REACHED', 'MISSED'] as const)
            : pick(['OPEN', 'OPEN', 'REACHED'] as const),
          position,
        },
      })
    }
  }

  // Trainings of the trade, cleared according to the stage
  const trainings = reference.trainings.filter(
    (training) => training.functionId === null || training.functionId === functionId
  )
  for (const [position, training] of trainings.entries()) {
    const status = isOver
      ? stopped && position > 1
        ? 'ABANDONED'
        : 'DONE'
      : progress > 0.5
        ? pick(['DONE', 'DONE', 'IN_PROGRESS'] as const)
        : progress > 0.2
          ? pick(['DONE', 'IN_PROGRESS', 'NOT_STARTED'] as const)
          : 'NOT_STARTED'
    const startedAt =
      status === 'NOT_STARTED' ? null : plusMinutes(startsAt, (position * 3 + 1) * 1440)

    await prisma.trainingRecord.create({
      data: {
        id: fx('training-record'),
        trainingId: training.id,
        accountId: person.id,
        juniorId: id,
        validatorId: status === 'DONE' ? (validator?.id ?? null) : null,
        status,
        attempts: status === 'NOT_STARTED' ? 0 : between(1, 2),
        startedAt,
        completedAt: status === 'DONE' && startedAt ? plusMinutes(startedAt, 2880) : null,
        abandonedAt: status === 'ABANDONED' && startedAt ? plusMinutes(startedAt, 4320) : null,
        note: status === 'DONE' && chance(0.4) ? 'Quiz réussi du premier coup.' : null,
      },
    })

    if (status === 'DONE') await writeAnswers(training.questions, person.id)
  }

  return id
}

/**
 * Answer the quiz questions of a cleared training, mostly right
 * @param {Reference['trainings'][number]['questions']} questions - Questions
 * @param {string} accountId - Who answered
 * @return {Promise<void>} - Written
 */

const writeAnswers = async (
  questions: Reference['trainings'][number]['questions'],
  accountId: string
): Promise<void> => {
  await prisma.juniorAnswer.createMany({
    data: questions.map((question) => {
      const right = chance(0.85)
      const choice = right
        ? question.choices.find((entry) => entry.correct)!
        : pick(
            question.choices.filter((entry) => !entry.correct).length > 0
              ? question.choices.filter((entry) => !entry.correct)
              : question.choices
          )

      return {
        id: fx('answer'),
        questionId: question.id,
        accountId,
        choiceIds: [choice.id],
        correct: right,
      }
    }),
    skipDuplicates: true,
  })
}

/**
 * Session-wide preparation steps and a few free moments on the session thread
 * @return {Promise<void>} - Written
 */

const writePrepSteps = async (
  reference: Reference,
  sessionId: string,
  startsAt: Date,
  trainers: Person[]
): Promise<void> => {
  const startOffset = Math.round((startsAt.getTime() - Date.now()) / 86_400_000)

  await prisma.academyStep.createMany({
    data: reference.pimTemplates
      .filter((template) => template.stage === 'PREPARATION')
      .map((template) => {
        const scheduledAt = day(startOffset + template.offset, 20)

        return {
          id: fx('academy-step'),
          sessionId,
          templateId: template.id,
          title: template.title,
          stage: 'PREPARATION' as const,
          anchor: template.anchor as 'DAY' | 'LIVE',
          offset: template.offset,
          owner: template.owner as 'RESPONSABLE' | 'FORMATEURS' | 'BOTH' | 'JUNIOR',
          required: template.required,
          scheduledAt,
          doneAt: scheduledAt < new Date() ? scheduledAt : null,
        }
      }),
  })

  if (startOffset > 0) return

  const kinds = [
    'FORMATION',
    'BILAN_VOCAL',
    'ENTREVUE',
    'POINT_RESPONSABLE',
    'SESSION_TRAVAIL',
  ] as const
  await prisma.academyStep.createMany({
    data: Array.from({ length: between(3, 6) }, () => {
      const kind = pick(kinds)
      const scheduledAt = day(startOffset + between(0, Math.min(35, -startOffset + 10)), 20)

      return {
        id: fx('academy-step'),
        sessionId,
        authorId: trainers.length > 0 ? pick(trainers).id : null,
        kind,
        title: {
          FORMATION: 'Formation collective',
          BILAN_VOCAL: 'Bilan vocal de groupe',
          ENTREVUE: 'Entrevue individuelle',
          POINT_RESPONSABLE: 'Point avec le responsable',
          SESSION_TRAVAIL: 'Session de travail sur les cas pratiques',
        }[kind],
        scheduledAt,
        doneAt: scheduledAt < new Date() ? scheduledAt : null,
        notes: 'Compte rendu partagé dans le salon des formateurs.',
      }
    }),
  })
}

/**
 * Write the candidates of one campaign
 * @return {Promise<string[]>} - Discord identifiers of the candidates
 */

const writeCandidates = async (input: {
  campaignId: string
  campaign: Campaign
  opens: number | null
  juniors: Person[]
  recruiters: Person[]
  commenters: Person[]
  spectators: Person[]
  outcome: (name: string) => string
  nextIndex: () => number
}): Promise<string[]> => {
  const { campaign, opens, juniors, recruiters, outcome } = input
  const extra = campaign === 'DRAFT' ? 0 : campaign === 'ANNOUNCED' ? between(1, 3) : between(6, 10)
  const discordIds = [
    ...juniors.map((person) => person.discordId),
    ...Array.from({ length: extra }, () => fxDiscordId(input.nextIndex())),
  ]

  for (const [position, discordId] of discordIds.entries()) {
    const isJunior = position < juniors.length
    const isClosed = campaign === 'CLOSED' || campaign === 'ARCHIVED'
    const name = isJunior
      ? 'Accepté'
      : isClosed
        ? weighted([
            ['Refusé', 70],
            ['Désisté', 30],
          ])
        : campaign === 'INTERVIEWS'
          ? weighted([
              ['À traiter', 25],
              ['Entretien posé', 35],
              ['En délibération', 25],
              ['Refusé', 10],
              ['Désisté', 5],
            ])
          : 'À traiter'
    const interviewed = name !== 'À traiter'
    const interviewAt =
      opens !== null && interviewed
        ? day(opens + between(8, 13), between(18, 22), pick([0, 30]))
        : null
    const recruiter = interviewed && recruiters.length > 0 ? pick(recruiters) : null

    await prisma.recruitmentCandidate.create({
      data: {
        id: fx('candidate'),
        sessionId: input.campaignId,
        discordId,
        formId: `FORM-${String(between(100, 999))}`,
        recruiterId: recruiter?.id ?? null,
        outcomeId: outcome(name),
        interviewAt,
        attended: interviewAt !== null && interviewAt < new Date() && name !== 'Désisté',
        review: interviewAt && interviewAt < new Date() ? pick(CANDIDATE_REVIEWS) : '',
        position: position * POSITION_STEP,
        spectators: {
          create: sample(input.spectators, interviewed ? between(0, 2) : 0).map((person) => ({
            accountId: person.id,
          })),
        },
        comments: {
          create: sample(CANDIDATE_COMMENTS, interviewed ? between(0, 3) : 0).map(
            (body, index) => ({
              id: fx('candidate-comment'),
              authorId: input.commenters.length > 0 ? pick(input.commenters).id : null,
              body,
              createdAt: interviewAt ? plusMinutes(interviewAt, 60 * (index + 1)) : day(-1),
            })
          ),
        },
      },
    })
  }

  return discordIds
}

/**
 * Trainings followed outside a promotion, so the formations page of veterans is filled too
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @return {Promise<void>} - Written
 */

const seedStandaloneTrainings = async (reference: Reference, cast: Cast): Promise<void> => {
  const veterans = cast.moderators.filter((person) => person.status === 'ACTIVE')

  for (const person of sample(veterans, 25)) {
    for (const training of sample(reference.trainings, between(1, 3))) {
      const known = await prisma.trainingRecord.findUnique({
        where: { trainingId_accountId: { trainingId: training.id, accountId: person.id } },
      })
      if (known) continue

      const status = weighted([
        ['DONE', 60],
        ['IN_PROGRESS', 25],
        ['NOT_STARTED', 10],
        ['ABANDONED', 5],
      ]) as 'DONE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'ABANDONED'
      const startedAt = status === 'NOT_STARTED' ? null : day(-between(10, 160), 20)

      await prisma.trainingRecord.create({
        data: {
          id: fx('training-record'),
          trainingId: training.id,
          accountId: person.id,
          validatorId: status === 'DONE' ? pick(cast.responsables).id : null,
          status,
          attempts: status === 'NOT_STARTED' ? 0 : between(1, 3),
          startedAt,
          completedAt: status === 'DONE' && startedAt ? plusMinutes(startedAt, 4320) : null,
          abandonedAt: status === 'ABANDONED' && startedAt ? plusMinutes(startedAt, 7200) : null,
        },
      })

      if (status === 'DONE') await writeAnswers(training.questions, person.id)
    }
  }
}
