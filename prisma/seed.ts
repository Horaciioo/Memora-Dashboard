import { PrismaPg } from '@prisma/adapter-pg'
import {
  AcademyStage,
  FunctionKind,
  MemberRole,
  MemberStatus,
  PrismaClient,
  StepAnchor,
  StepOwner,
} from '@prisma/client'

// Prisma 7 no longer loads .env on its own
try {
  process.loadEnvFile()
} catch {
  // No .env file, variables come from the environment
}

const discordId = process.env.ADMIN_DISCORD_ID?.trim() ?? ''
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() ?? ''

const MISSING_IDENTIFIER = 'ADMIN_DISCORD_ID is required to seed the root account'
const MISSING_NAME = 'ADMIN_DISPLAY_NAME is required to seed the root account'

// Category every seeded skill sits under, matched by name
const SKILL_CATEGORIES = [
  { name: 'Savoir-être', accent: 'info' },
  { name: 'Technique', accent: 'brand' },
  { name: 'Rédaction', accent: 'warning' },
] as const

type SkillCategoryName = (typeof SKILL_CATEGORIES)[number]['name']

// Platform a skill or step template is scoped to, matched by function name
const SKILL_FUNCTIONS = [
  { name: 'Twitch', accent: 'brand' },
  { name: 'Discord', accent: 'info' },
] as const

type SkillFunctionName = (typeof SKILL_FUNCTIONS)[number]['name']

// Dispositif a skill is scoped to, matched by name (created by the track-to-dispositif migration)
type SkillDispositifName = 'ATRIA' | 'PULSE'

interface SkillSeed {
  name: string
  category: SkillCategoryName
  function: SkillFunctionName
  dispositif: SkillDispositifName
}

// The 42 competencies of pim-explain.md, Twitch/Discord × ATRIA/PULSE
const SKILLS: SkillSeed[] = [
  // Twitch ATRIA
  { name: 'Travail en équipe', category: 'Savoir-être', function: 'Twitch', dispositif: 'ATRIA' },
  { name: 'Communication', category: 'Savoir-être', function: 'Twitch', dispositif: 'ATRIA' },
  { name: 'Réactivité', category: 'Savoir-être', function: 'Twitch', dispositif: 'ATRIA' },
  { name: 'Investissement', category: 'Savoir-être', function: 'Twitch', dispositif: 'ATRIA' },
  {
    name: 'Assiduité et présence',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'ATRIA',
  },
  {
    name: 'Respect de la hiérarchie',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'ATRIA',
  },
  { name: 'Connaissance du panel', category: 'Technique', function: 'Twitch', dispositif: 'ATRIA' },
  {
    name: 'Capacité rédactionnelle',
    category: 'Rédaction',
    function: 'Twitch',
    dispositif: 'ATRIA',
  },
  { name: 'Vitesse de modération', category: 'Technique', function: 'Twitch', dispositif: 'ATRIA' },
  // Twitch PULSE
  {
    name: 'Collaboration avancée',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Communication professionnelle',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Réactivité opérationnelle',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  { name: 'Prise d’initiative', category: 'Savoir-être', function: 'Twitch', dispositif: 'PULSE' },
  {
    name: 'Fiabilité et engagement',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Respect des procédures',
    category: 'Savoir-être',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Maîtrise complète du panel',
    category: 'Technique',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Qualité rédactionnelle',
    category: 'Rédaction',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  {
    name: 'Efficacité de modération',
    category: 'Technique',
    function: 'Twitch',
    dispositif: 'PULSE',
  },
  // Discord ATRIA
  { name: 'Maîtrise de Discord', category: 'Technique', function: 'Discord', dispositif: 'ATRIA' },
  { name: 'Maîtrise de Marsha', category: 'Technique', function: 'Discord', dispositif: 'ATRIA' },
  {
    name: 'Capacité rédactionnelle',
    category: 'Rédaction',
    function: 'Discord',
    dispositif: 'ATRIA',
  },
  { name: 'Travail en équipe', category: 'Savoir-être', function: 'Discord', dispositif: 'ATRIA' },
  { name: 'Communication', category: 'Savoir-être', function: 'Discord', dispositif: 'ATRIA' },
  {
    name: 'Graduation des sanctions',
    category: 'Technique',
    function: 'Discord',
    dispositif: 'ATRIA',
  },
  { name: 'Gestion des tickets', category: 'Technique', function: 'Discord', dispositif: 'ATRIA' },
  { name: 'Gestion des preuves', category: 'Technique', function: 'Discord', dispositif: 'ATRIA' },
  {
    name: 'Rédaction professionnelle des sanctions',
    category: 'Rédaction',
    function: 'Discord',
    dispositif: 'ATRIA',
  },
  {
    name: 'Sang-froid et impartialité',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'ATRIA',
  },
  { name: 'Diplomatie', category: 'Savoir-être', function: 'Discord', dispositif: 'ATRIA' },
  {
    name: 'Prise de décision rapide',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'ATRIA',
  },
  // Discord PULSE
  { name: 'Expertise Discord', category: 'Technique', function: 'Discord', dispositif: 'PULSE' },
  {
    name: 'Maîtrise de l’écosystème Marsha',
    category: 'Technique',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Communication professionnelle',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Collaboration avancée',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Gestion autonome des tickets',
    category: 'Technique',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Justification professionnelle des sanctions',
    category: 'Rédaction',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Gestion rigoureuse des preuves',
    category: 'Technique',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Graduation pertinente des sanctions',
    category: 'Technique',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  {
    name: 'Prise de décision rapide',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'PULSE',
  },
  { name: 'Diplomatie avancée', category: 'Savoir-être', function: 'Discord', dispositif: 'PULSE' },
  { name: 'Impartialité', category: 'Savoir-être', function: 'Discord', dispositif: 'PULSE' },
  {
    name: 'Gestion des situations complexes',
    category: 'Savoir-être',
    function: 'Discord',
    dispositif: 'PULSE',
  },
]

interface StepTemplateSeed {
  title: string
  description?: string
  stage: AcademyStage
  anchor: StepAnchor
  offset: number
  owner: StepOwner
  required: boolean
}

// The PIMT (Twitch) trame of pim-explain.md, scoped to the Twitch function only
const PIMT_STEPS: StepTemplateSeed[] = [
  {
    title: 'Création de la Session',
    stage: AcademyStage.PREPARATION,
    anchor: StepAnchor.DAY,
    offset: -4,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Briefing avec les Formateurs',
    stage: AcademyStage.PREPARATION,
    anchor: StepAnchor.DAY,
    offset: -3,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Revue des attentes',
    stage: AcademyStage.PREPARATION,
    anchor: StepAnchor.DAY,
    offset: -2,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Répartition des Juniors',
    description: 'Répartition des Juniors, création des rôles et des salons d’équipe.',
    stage: AcademyStage.PREPARATION,
    anchor: StepAnchor.DAY,
    offset: -1,
    owner: StepOwner.BOTH,
    required: true,
  },
  {
    title: 'Partage du formulaire d’admission',
    stage: AcademyStage.PREPARATION,
    anchor: StepAnchor.DAY,
    offset: 0,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Vocal individuel de bienvenue',
    description: 'Présentation, vérification des informations, attribution de la Team.',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 0,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Message de bienvenue des Formateurs',
    description: 'Organisation d’un premier vocal.',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 0,
    owner: StepOwner.FORMATEURS,
    required: true,
  },
  {
    title: 'Vérification des présents et des Teams',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 0,
    owner: StepOwner.BOTH,
    required: true,
  },
  {
    title: 'Ouverture des formations autonomes',
    description: 'Ouverture des formations autonomes sur Memora.',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 3,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Période de formation',
    description:
      'Le Junior commence ses formations, les Formateurs répondent et suivent l’avancement.',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 5,
    owner: StepOwner.JUNIOR,
    required: true,
  },
  {
    title: 'Découverte et accompagnement',
    description: 'Observation, accompagnement, mise en pratique jusqu’au 6ᵉ live.',
    stage: AcademyStage.DISCOVERY,
    anchor: StepAnchor.DAY,
    offset: 17,
    owner: StepOwner.BOTH,
    required: true,
  },
  {
    title: 'Bilan vocal et écrit',
    description: 'Bilan vocal, bilan Memora, avis proposé par le Formateur.',
    stage: AcademyStage.REVIEW_ONE,
    anchor: StepAnchor.LIVE,
    offset: 6,
    owner: StepOwner.FORMATEURS,
    required: true,
  },
  {
    title: 'Décision du Responsable',
    stage: AcademyStage.REVIEW_ONE,
    anchor: StepAnchor.LIVE,
    offset: 6,
    owner: StepOwner.RESPONSABLE,
    required: true,
  },
  {
    title: 'Annonce des refus',
    description: 'Annonce en vocal ou à l’écrit, seulement si des refus sont décidés.',
    stage: AcademyStage.REVIEW_ONE,
    anchor: StepAnchor.LIVE,
    offset: 6,
    owner: StepOwner.RESPONSABLE,
    required: false,
  },
  {
    title: 'Bilan intermédiaire',
    description: 'Rappel des objectifs, identification des difficultés.',
    stage: AcademyStage.PRACTICE,
    anchor: StepAnchor.LIVE,
    offset: 7,
    owner: StepOwner.FORMATEURS,
    required: true,
  },
  {
    title: 'Travail sur les objectifs et compétences',
    description: 'Objectifs, compétences restantes, observation renforcée jusqu’au 13ᵉ live.',
    stage: AcademyStage.PRACTICE,
    anchor: StepAnchor.LIVE,
    offset: 7,
    owner: StepOwner.JUNIOR,
    required: true,
  },
  {
    title: 'Vocal final et bilans',
    description: 'Vocal final, rédaction des bilans, échange avec le Responsable.',
    stage: AcademyStage.REVIEW_FINAL,
    anchor: StepAnchor.LIVE,
    offset: 13,
    owner: StepOwner.FORMATEURS,
    required: true,
  },
  {
    title: 'Ouverture de la période bonus',
    description: 'Jusqu’à 4 lives supplémentaires, sur décision du Responsable et du Formateur.',
    stage: AcademyStage.BONUS,
    anchor: StepAnchor.LIVE,
    offset: 13,
    owner: StepOwner.BOTH,
    required: false,
  },
]

/**
 * Write the root administrator into the database, its name never living in the repository
 * @return {Promise<void>} - Seeded
 */

const seed = async (): Promise<void> => {
  if (discordId.length === 0) throw new Error(MISSING_IDENTIFIER)
  if (displayName.length === 0) throw new Error(MISSING_NAME)

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  // The name is refreshed on every seed, the identifier stays the key
  await prisma.account.upsert({
    where: { discordId },
    update: {
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      leftAt: null,
    },
    create: {
      discordId,
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
    },
  })

  // Prerequisite functions scoping the academy skills and the PIMT trame
  const functionIds = new Map<SkillFunctionName, string>()
  for (const [index, fn] of SKILL_FUNCTIONS.entries()) {
    const row = await prisma.jobFunction.upsert({
      where: { name: fn.name },
      update: {},
      create: { name: fn.name, kind: FunctionKind.PRIMARY, accent: fn.accent, position: index },
    })
    functionIds.set(fn.name, row.id)
  }

  // Dispositifs already exist, created by the track-to-dispositif migration
  const dispositifIds = new Map<SkillDispositifName, string>()
  for (const name of ['ATRIA', 'PULSE'] as const) {
    const row = await prisma.dispositif.findUniqueOrThrow({ where: { name } })
    dispositifIds.set(name, row.id)
  }

  const categoryIds = new Map<SkillCategoryName, string>()
  for (const [index, category] of SKILL_CATEGORIES.entries()) {
    const row = await prisma.skillCategory.upsert({
      where: { name: category.name },
      update: { accent: category.accent },
      create: { name: category.name, accent: category.accent, position: index },
    })
    categoryIds.set(category.name, row.id)
  }

  for (const [index, skill] of SKILLS.entries()) {
    const functionId = functionIds.get(skill.function)!
    const dispositifId = dispositifIds.get(skill.dispositif)!
    const categoryId = categoryIds.get(skill.category)!

    await prisma.skill.upsert({
      where: { name_functionId_dispositifId: { name: skill.name, functionId, dispositifId } },
      update: { categoryId, position: index },
      create: { name: skill.name, categoryId, functionId, dispositifId, position: index },
    })
  }

  // The compound unique index rejects a null dispositifId, matched by hand instead
  const twitchFunctionId = functionIds.get('Twitch')!
  for (const [index, step] of PIMT_STEPS.entries()) {
    const existing = await prisma.pimStepTemplate.findFirst({
      where: { title: step.title, functionId: twitchFunctionId, dispositifId: null },
    })

    const data = {
      description: step.description,
      stage: step.stage,
      anchor: step.anchor,
      offset: step.offset,
      owner: step.owner,
      required: step.required,
      position: index,
    }

    if (existing) {
      await prisma.pimStepTemplate.update({ where: { id: existing.id }, data })
    } else {
      await prisma.pimStepTemplate.create({
        data: { title: step.title, functionId: twitchFunctionId, ...data },
      })
    }
  }

  await prisma.$disconnect()
}

void seed()
