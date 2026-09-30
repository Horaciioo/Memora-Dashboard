import { SANCTION_TEMPLATES, forCreator } from '@/declarations/sanctions/template'
import { prisma, fx } from '../lib/client.ts'
import { chance, pick } from '../lib/random.ts'
import { CREATORS, type FunctionKey } from '../data/roster.ts'
import {
  DISPOSITIFS,
  EVENT_TEMPLATES,
  PIM_STEPS,
  PLATFORMS,
  RECRUITMENT_QUESTIONS,
  SKILLS,
  SOCIAL_NETWORKS,
  TRAININGS,
} from '../data/texts.ts'
import { storeImage, creatorPortrait, creatorBanner } from './images.ts'

/**
 * Reference rows every later step points at
 * @typedef {Object} Reference
 */

export interface Reference {
  creators: { id: string; name: string }[]
  functions: Record<FunctionKey, { id: string; name: string; kind: string }>
  divisions: { id: string; rank: number }[]
  states: Record<'PROJECT' | 'TASK' | 'MEETING', Record<'TODO' | 'DOING' | 'DONE', string>>
  priorities: string[]
  platforms: { id: string; name: string }[]
  networks: { id: string; name: string; urlPrefix: string; accent: string | null }[]
  templates: { id: string; name: string; kind: string; accent: string | null }[]
  dispositifs: string[]
  skills: { id: string; functionId: string | null }[]
  pimTemplates: {
    id: string
    title: string
    stage: string
    anchor: string
    offset: number
    owner: string
    required: boolean
  }[]
  trainings: {
    id: string
    functionId: string | null
    questions: { id: string; choices: { id: string; correct: boolean }[] }[]
  }[]
  outcomes: { id: string; name: string; isTerminal: boolean; isDefault: boolean }[]
  levels: { id: string; level: number }[]
}

// Extra permissions each trade opens, on top of the role
const FUNCTION_GRANTS: Record<FunctionKey, string[]> = {
  functionDiscord: ['sanction:read', 'calendar:read'],
  functionLive: ['livecon:read', 'livecon:update', 'sanction:read'],
  functionAnimator: ['calendar:read', 'calendar:manage', 'communication:write'],
  functionRecruiter: ['recruitment:read', 'recruitment:candidate:write'],
  functionTrainer: [
    'academy:read',
    'academy:review:read',
    'academy:review:write',
    'academy:skill:write',
    'academy:note:read',
    'academy:note:write',
  ],
}

/**
 * Reuse a creator by name, or open it with a generated portrait and banner
 * @return {Promise<Reference['creators']>} - Creators, in display order
 */

const seedCreators = async (): Promise<Reference['creators']> => {
  const creators: Reference['creators'] = []

  for (const [position, seed] of CREATORS.entries()) {
    const known = await prisma.youtuber.findUnique({ where: { name: seed.name } })

    if (known) {
      creators.push({ id: known.id, name: known.name })
      continue
    }

    const avatarUrl = await storeImage('avatars', creatorPortrait(seed.name, seed.palette))
    const bannerUrl = await storeImage('banners', creatorBanner(seed.name, seed.palette))
    const row = await prisma.youtuber.create({
      data: {
        id: fx('youtuber'),
        name: seed.name,
        handle: seed.handle,
        accent: seed.accent,
        avatarUrl,
        bannerUrl,
        position,
      },
    })

    creators.push({ id: row.id, name: row.name })
  }

  return creators
}

/**
 * Write a named reference row only when no row carries that name yet
 * @template TRow - Row shape
 * @param {() => Promise<TRow | null>} find - Lookup by name
 * @param {() => Promise<TRow>} create - Creation
 * @return {Promise<TRow>} - Existing or created row
 */

const ensure = async <TRow>(
  find: () => Promise<TRow | null>,
  create: () => Promise<TRow>
): Promise<TRow> => (await find()) ?? create()

/**
 * Write every reference collection the fixtures need, reusing what already exists
 * @return {Promise<Reference>} - Reference rows
 */

export const seedReference = async (): Promise<Reference> => {
  const creators = await seedCreators()

  const functionRows = await prisma.jobFunction.findMany()
  const functions = Object.fromEntries(
    functionRows
      .filter((row) => row.icon)
      .map((row) => [row.icon, { id: row.id, name: row.name, kind: row.kind }])
  ) as Reference['functions']

  if (Object.keys(functions).length < 5) {
    throw new Error('Fonctions fixes absentes, lance d’abord yarn db:seed')
  }

  const divisions = await prisma.division.findMany({ select: { id: true, rank: true } })
  const priorities = (await prisma.priority.findMany({ orderBy: { weight: 'asc' } })).map(
    (row) => row.id
  )

  const stateRows = await prisma.workflowState.findMany({ orderBy: { position: 'asc' } })
  const states = { PROJECT: {}, TASK: {}, MEETING: {} } as Reference['states']
  for (const row of stateRows) states[row.scope][row.phase] ??= row.id

  const platforms = []
  for (const [position, [name, accent]] of PLATFORMS.entries()) {
    platforms.push(
      await ensure(
        () => prisma.platform.findUnique({ where: { name } }),
        () => prisma.platform.create({ data: { id: fx('platform'), name, accent, position } })
      )
    )
  }

  const networks = []
  for (const [position, [name, urlPrefix, accent]] of SOCIAL_NETWORKS.entries()) {
    networks.push(
      await ensure(
        () => prisma.socialNetwork.findUnique({ where: { name } }),
        () =>
          prisma.socialNetwork.create({
            data: {
              id: fx('network'),
              name,
              urlPrefix,
              accent,
              position,
              required: position === 0,
            },
          })
      )
    )
  }

  const templates = []
  for (const [position, template] of EVENT_TEMPLATES.entries()) {
    templates.push(
      await ensure(
        () => prisma.eventTemplate.findUnique({ where: { name: template.name } }),
        () =>
          prisma.eventTemplate.create({
            data: { id: fx('template'), ...template, body: template.summary, position },
          })
      )
    )
  }

  const dispositifs = []
  for (const [position, [name, summary, accent]] of DISPOSITIFS.entries()) {
    const row = await ensure(
      () => prisma.dispositif.findUnique({ where: { name } }),
      () =>
        prisma.dispositif.create({
          data: { id: fx('dispositif'), name, summary, accent, position },
        })
    )
    dispositifs.push(row.id)
  }

  // Skills, the technical ones narrowed to the live trade
  const skills: Reference['skills'] = []
  for (const [position, [name, accent, entries]] of SKILLS.entries()) {
    const category = await ensure(
      () => prisma.skillCategory.findUnique({ where: { name } }),
      () =>
        prisma.skillCategory.create({ data: { id: fx('skill-category'), name, accent, position } })
    )

    for (const [index, skillName] of entries.entries()) {
      const functionId = name === 'Technique' ? functions.functionLive.id : null
      const skill = await ensure(
        () =>
          prisma.skill.findFirst({ where: { name: skillName, functionId, dispositifId: null } }),
        () =>
          prisma.skill.create({
            data: {
              id: fx('skill'),
              name: skillName,
              description: `Ce qu’on attend sur « ${skillName.toLowerCase()} ».`,
              position: index,
              categoryId: category.id,
              functionId,
            },
          })
      )
      skills.push({ id: skill.id, functionId: skill.functionId })
    }
  }

  const pimTemplates: Reference['pimTemplates'] = []
  for (const [position, step] of PIM_STEPS.entries()) {
    const row = await ensure(
      () =>
        prisma.pimStepTemplate.findFirst({
          where: { title: step.title, functionId: null, dispositifId: null },
        }),
      () =>
        prisma.pimStepTemplate.create({
          data: {
            id: fx('pim-template'),
            ...step,
            description: `Étape « ${step.title} ».`,
            position,
          },
        })
    )
    pimTemplates.push(row)
  }

  const trainings: Reference['trainings'] = []
  for (const [position, seed] of TRAININGS.entries()) {
    const functionId = seed.functionKey ? functions[seed.functionKey as FunctionKey].id : null
    let training = await prisma.training.findUnique({
      where: { name: seed.name },
      include: {
        chapters: {
          include: { blocks: { include: { questions: { include: { choices: true } } } } },
        },
      },
    })

    if (!training) {
      await prisma.training.create({
        data: {
          id: fx('training'),
          name: seed.name,
          summary: seed.summary,
          period: seed.period,
          mandatory: seed.mandatory,
          functionId,
          dispositifId: seed.mandatory ? null : pick(dispositifs),
          position,
          chapters: {
            create: seed.chapters.map((chapter, chapterIndex) => ({
              id: fx('chapter'),
              title: chapter.title,
              position: chapterIndex,
              blocks: {
                create: [
                  { id: fx('block'), kind: 'TEXT', body: chapter.text, position: 0 },
                  {
                    id: fx('block'),
                    kind: 'QUIZ',
                    position: 1,
                    questions: {
                      create: chapter.quiz.map(([prompt, labels, correct], questionIndex) => ({
                        id: fx('question'),
                        prompt,
                        position: questionIndex,
                        choices: {
                          create: labels.map((label, choiceIndex) => ({
                            id: fx('choice'),
                            label,
                            correct: choiceIndex === correct,
                            position: choiceIndex,
                          })),
                        },
                      })),
                    },
                  },
                ],
              },
            })),
          },
        },
      })

      training = await prisma.training.findUnique({
        where: { name: seed.name },
        include: {
          chapters: {
            include: { blocks: { include: { questions: { include: { choices: true } } } } },
          },
        },
      })
    }

    trainings.push({
      id: training!.id,
      functionId: training!.functionId,
      questions: training!.chapters.flatMap((chapter) =>
        chapter.blocks.flatMap((block) =>
          block.questions.map((question) => ({ id: question.id, choices: question.choices }))
        )
      ),
    })
  }

  // Interview script, a few questions narrowed to one creator or trade
  const questionCount = await prisma.recruitmentQuestion.count()
  if (questionCount === 0) {
    for (const [position, [prompt, hint]] of RECRUITMENT_QUESTIONS.entries()) {
      await prisma.recruitmentQuestion.create({
        data: {
          id: fx('rec-question'),
          prompt,
          hint,
          position,
          youtuberId: position === 4 ? creators[0].id : null,
          functionId: position === 2 ? functions.functionLive.id : null,
        },
      })
    }
  }

  // Each creator opens the trades it recruits for
  for (const creator of creators) {
    for (const [position, key] of (Object.keys(functions) as FunctionKey[]).entries()) {
      if (key === 'functionAnimator' && !chance(0.5)) continue

      const known = await prisma.youtuberFunction.findUnique({
        where: { youtuberId_functionId: { youtuberId: creator.id, functionId: functions[key].id } },
      })
      if (!known) {
        await prisma.youtuberFunction.create({
          data: {
            id: fx('creator-function'),
            youtuberId: creator.id,
            functionId: functions[key].id,
            position,
          },
        })
      }
    }
  }

  // What each trade opens, set once and left alone afterwards
  for (const [key, permissions] of Object.entries(FUNCTION_GRANTS) as [FunctionKey, string[]][]) {
    const held = await prisma.functionPermission.count({ where: { functionId: functions[key].id } })
    if (held > 0) continue

    await prisma.functionPermission.createMany({
      data: permissions.map((permission) => ({
        id: fx('function-grant'),
        functionId: functions[key].id,
        permission,
      })),
    })
  }

  const levels = await prisma.liveconLevel.findMany({ select: { id: true, level: true } })
  await seedSanctionPanels(creators, levels)

  const outcomes = await prisma.recruitmentOutcome.findMany({ orderBy: { position: 'asc' } })

  return {
    creators,
    functions,
    divisions,
    states,
    priorities,
    platforms,
    networks,
    templates,
    dispositifs,
    skills,
    pimTemplates,
    trainings,
    outcomes,
    levels,
  }
}

/**
 * Clone the reference sanction panels onto every creator that has none yet
 * @param {Reference['creators']} creators - Creators
 * @param {Reference['levels']} levels - Livecon levels
 * @return {Promise<void>} - Written
 */

const seedSanctionPanels = async (
  creators: Reference['creators'],
  levels: Reference['levels']
): Promise<void> => {
  const measures = new Map(
    (await prisma.sanctionMeasure.findMany()).map((measure) => [measure.name, measure.id])
  )

  for (const creator of creators) {
    const held = await prisma.sanctionOffense.count({ where: { youtuberId: creator.id } })
    if (held > 0) continue

    for (const [panel, seeds] of Object.entries(SANCTION_TEMPLATES)) {
      for (const [position, offense] of seeds.entries()) {
        const text = (value: string) => forCreator(value, creator.name)

        await prisma.sanctionOffense.create({
          data: {
            id: fx('offense'),
            youtuberId: creator.id,
            panel: panel as keyof typeof SANCTION_TEMPLATES,
            name: text(offense.name),
            summary: text(offense.summary),
            example: offense.examples.map(text).join('\n') || null,
            toleratedExample: offense.tolerated.map(text).join('\n') || null,
            warningExample: offense.warningExample ? text(offense.warningExample) : null,
            position,
            levels: {
              create: levels.flatMap((level) => {
                const handling = offense.levels[level.level]

                return handling ? [{ levelId: level.id, gravity: handling.gravity }] : []
              }),
            },
            tiers: {
              create: levels.flatMap((level) =>
                (offense.levels[level.level]?.ladder ?? []).map((rung, step) => ({
                  id: fx('tier'),
                  levelId: level.id,
                  step,
                  note: rung.condition,
                  measures: {
                    create: rung.measures.flatMap((name, at) => {
                      const measureId = measures.get(name)

                      return measureId ? [{ measureId, position: at }] : []
                    }),
                  },
                }))
              ),
            },
          },
        })
      }
    }
  }
}
