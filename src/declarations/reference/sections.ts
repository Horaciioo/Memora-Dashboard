import type { IconName } from '@/declarations/ui/icons'
import type { IllustrationName } from '@/declarations/ui/illustrations'

/**
 * Every reference collection managed from the admin console
 * @type {readonly string[]}
 */

export const REFERENCE_KEYS = [
  'youtubeurs',
  'divisions',
  'fonctions',
  'plateformes',
  'reseaux-sociaux',
  'etats',
  'priorites',
  'evenements',
  'formations',
  'livecon',
  'dispositifs',
  'categories-competences',
  'competences',
  'etapes-pim',
  'sanctions',
  'questions-recrutement',
  'etapes-recrutement',
  'issues-recrutement',
] as const

/**
 * Reference collection key
 * @type {(typeof REFERENCE_KEYS)[number]}
 */

export type ReferenceKey = (typeof REFERENCE_KEYS)[number]

/**
 * Console groups gathering related collections
 * @type {readonly string[]}
 */

export const REFERENCE_GROUP_KEYS = [
  'organisation',
  'pilotage',
  'moderation',
  'academy',
  'recrutement',
] as const

/**
 * Console group key
 * @type {(typeof REFERENCE_GROUP_KEYS)[number]}
 */

export type ReferenceGroupKey = (typeof REFERENCE_GROUP_KEYS)[number]

/**
 * Console group heading
 * @typedef {Object} ReferenceGroup
 * @property {ReferenceGroupKey} key - Group key
 * @property {string} label - Section heading
 */

export interface ReferenceGroup {
  key: ReferenceGroupKey
  label: string
}

/**
 * Console groups in display order
 * @type {ReferenceGroup[]}
 */

export const REFERENCE_GROUPS: ReferenceGroup[] = [
  { key: 'organisation', label: 'Structure & équipe' },
  { key: 'pilotage', label: 'Projets & calendrier' },
  { key: 'moderation', label: 'Modération' },
  { key: 'academy', label: 'Marsha Academy' },
  { key: 'recrutement', label: 'Recrutement' },
]

/**
 * Display metadata of a reference collection
 * @typedef {Object} ReferenceSection
 * @property {ReferenceKey} key - Collection key
 * @property {ReferenceGroupKey} group - Console group
 * @property {string} label - Plural label
 * @property {string} singular - Singular label
 * @property {'masculine' | 'feminine'} gender - Grammatical gender of the singular label
 * @property {string} description - What the collection drives
 * @property {IconName} icon - Icon key
 * @property {IllustrationName} figure - Empty state figure
 * @property {boolean} reorderable - Rows can be dragged into order
 * @property {boolean} [openable] - Rows open a file of their own
 * @property {string} emptyTitle - Empty state headline
 * @property {string} emptyDescription - Empty state supporting line
 */

export interface ReferenceSection {
  key: ReferenceKey
  group: ReferenceGroupKey
  label: string
  singular: string
  gender: 'masculine' | 'feminine'
  description: string
  icon: IconName
  figure: IllustrationName
  reorderable: boolean
  openable?: boolean
  emptyTitle: string
  emptyDescription: string
}

/**
 * Reference collections in display order
 * @type {ReferenceSection[]}
 */

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  {
    key: 'youtubeurs',
    group: 'organisation',
    label: 'YouTubeurs',
    singular: 'YouTubeur',
    gender: 'masculine',
    description: 'Les créateurs sur lesquels l’équipe intervient.',
    icon: 'youtuber',
    figure: 'settings',
    reorderable: true,
    openable: true,
    emptyTitle: 'Aucun YouTubeur',
    emptyDescription: 'Ajoute un premier créateur pour pouvoir y rattacher projets et modérateurs.',
  },
  {
    key: 'divisions',
    group: 'organisation',
    label: 'Divisions',
    singular: 'Division',
    gender: 'feminine',
    description: 'Junior puis les trois squads, du rang le plus bas au plus haut.',
    icon: 'division',
    figure: 'academy',
    reorderable: false,
    emptyTitle: 'Aucune division',
    emptyDescription: 'Crée Junior, puis les squads, en montant par rang.',
  },
  {
    key: 'fonctions',
    group: 'organisation',
    label: 'Fonctions',
    singular: 'Fonction',
    gender: 'feminine',
    description: 'Postes de modération principaux et postes secondaires à responsabilité.',
    icon: 'shield',
    figure: 'moderation',
    reorderable: true,
    emptyTitle: 'Aucune fonction',
    emptyDescription: 'Ajoute les postes de modération avant d’affecter un modérateur.',
  },
  {
    key: 'plateformes',
    group: 'pilotage',
    label: 'Plateformes',
    singular: 'Plateforme',
    gender: 'feminine',
    description: 'Là où l’action initiale d’un projet se déroule.',
    icon: 'platform',
    figure: 'settings',
    reorderable: true,
    emptyTitle: 'Aucune plateforme',
    emptyDescription: 'Ajoute Discord, YouTube, ou toute autre plateforme utilisée.',
  },
  {
    key: 'reseaux-sociaux',
    group: 'organisation',
    label: 'Réseaux sociaux',
    singular: 'Réseau social',
    gender: 'masculine',
    description: 'Les réseaux qu’un modérateur renseigne, préfixe d’URL comprise.',
    icon: 'link',
    figure: 'settings',
    reorderable: true,
    emptyTitle: 'Aucun réseau social',
    emptyDescription: 'Ajoute Instagram, Twitch ou YouTube pour les proposer à l’intégration.',
  },
  {
    key: 'etats',
    group: 'pilotage',
    label: 'États',
    singular: 'État',
    gender: 'masculine',
    description: 'Colonnes des tableaux de projets, tâches et réunions.',
    icon: 'tasks',
    figure: 'projects',
    reorderable: true,
    emptyTitle: 'Aucun état',
    emptyDescription: 'Crée les colonnes de tes tableaux, une par étape du flux.',
  },
  {
    key: 'priorites',
    group: 'pilotage',
    label: 'Priorités',
    singular: 'Priorité',
    gender: 'feminine',
    description: 'Niveaux d’urgence partagés par les projets et les tâches.',
    icon: 'alert',
    figure: 'settings',
    reorderable: false,
    emptyTitle: 'Aucune priorité',
    emptyDescription: 'Ajoute tes niveaux d’urgence, du plus léger au plus lourd.',
  },
  {
    key: 'evenements',
    group: 'pilotage',
    label: 'Modèles d’évènement',
    singular: 'Modèle d’évènement',
    gender: 'masculine',
    description: 'Lives, réunions et rendez-vous pré-conçus, prêts à poser sur le calendrier.',
    icon: 'meetings',
    figure: 'settings',
    reorderable: true,
    emptyTitle: 'Aucun modèle d’évènement',
    emptyDescription: 'Prépare tes lives et tes réunions récurrents pour les poser en un clic.',
  },
  {
    key: 'formations',
    group: 'academy',
    label: 'Formations',
    singular: 'Formation',
    gender: 'feminine',
    description: 'Cours de la Marsha Academy, par période et par fonction.',
    icon: 'academy',
    figure: 'academy',
    reorderable: true,
    openable: true,
    emptyTitle: 'Aucune formation',
    emptyDescription: 'Déclare les formations obligatoires de la 1ʳᵉ période pour commencer.',
  },
  {
    key: 'livecon',
    group: 'moderation',
    label: 'Niveaux de livecon',
    singular: 'Niveau',
    gender: 'masculine',
    description: 'Niveaux de vigilance et consignes associées.',
    icon: 'livecon',
    figure: 'livecon',
    reorderable: false,
    emptyTitle: 'Aucun niveau',
    emptyDescription: 'Crée les trois niveaux de vigilance et leurs consignes.',
  },
  {
    key: 'sanctions',
    group: 'moderation',
    label: 'Mesures de sanction',
    singular: 'Mesure',
    gender: 'feminine',
    description: 'Barème des sanctions applicables, de la suppression au bannissement.',
    icon: 'sanctions',
    figure: 'moderation',
    reorderable: true,
    emptyTitle: 'Aucune mesure',
    emptyDescription: 'Déclare les mesures avant de bâtir un panel de sanctions.',
  },
  {
    key: 'dispositifs',
    group: 'academy',
    label: 'Dispositifs',
    singular: 'Dispositif',
    gender: 'masculine',
    description: 'ATRIA, PULSE, et tout autre dispositif d’intégration.',
    icon: 'dispositif',
    figure: 'academy',
    reorderable: true,
    emptyTitle: 'Aucun dispositif',
    emptyDescription: 'Crée ATRIA et PULSE pour pouvoir y intégrer des juniors.',
  },
  {
    key: 'categories-competences',
    group: 'academy',
    label: 'Catégories de compétences',
    singular: 'Catégorie de compétence',
    gender: 'feminine',
    description: 'Regroupements des compétences évaluées en FSI.',
    icon: 'skill',
    figure: 'academy',
    reorderable: true,
    emptyTitle: 'Aucune catégorie',
    emptyDescription: 'Crée Savoir-être, Technique, Rédaction, avant d’y ranger des compétences.',
  },
  {
    key: 'competences',
    group: 'academy',
    label: 'Compétences',
    singular: 'Compétence',
    gender: 'feminine',
    description: 'Ce qu’un junior est évalué sur, par fonction et par dispositif.',
    icon: 'skill',
    figure: 'academy',
    reorderable: true,
    emptyTitle: 'Aucune compétence',
    emptyDescription: 'Déclare les premières compétences d’une catégorie.',
  },
  {
    key: 'etapes-pim',
    group: 'academy',
    label: 'Étapes de PIM',
    singular: 'Étape de PIM',
    gender: 'feminine',
    description: 'La trame de timeline instanciée à la création d’une session.',
    icon: 'clock',
    figure: 'academy',
    reorderable: true,
    emptyTitle: 'Aucune étape',
    emptyDescription: 'Déclare la trame de PIM avant d’ouvrir une session.',
  },
  {
    key: 'questions-recrutement',
    group: 'recrutement',
    label: 'Questions de recrutement',
    singular: 'Question de recrutement',
    gender: 'feminine',
    description: 'La trame d’entretien, par YouTubeur et par fonction.',
    icon: 'recruitment',
    figure: 'members',
    reorderable: true,
    emptyTitle: 'Aucune question',
    emptyDescription: 'Écris la trame d’entretien avant d’ouvrir une session de recrutement.',
  },
  {
    key: 'etapes-recrutement',
    group: 'recrutement',
    label: 'Étapes de recrutement',
    singular: 'Étape de recrutement',
    gender: 'feminine',
    description: 'La trame de timeline instanciée à l’ouverture d’une session de recrutement.',
    icon: 'clock',
    figure: 'members',
    reorderable: true,
    emptyTitle: 'Aucune étape',
    emptyDescription: 'Déclare la trame avant d’ouvrir une session de recrutement.',
  },
  {
    key: 'issues-recrutement',
    group: 'recrutement',
    label: 'Issues de recrutement',
    singular: 'Issue de recrutement',
    gender: 'feminine',
    description: 'Colonnes du tableau de résultats : accepté, refusé, désisté, et le reste.',
    icon: 'recruitment',
    figure: 'members',
    reorderable: true,
    emptyTitle: 'Aucune issue',
    emptyDescription: 'Déclare les issues pour ouvrir le tableau de résultats.',
  },
]

/**
 * Reference sections by key
 * @type {Map<ReferenceKey, ReferenceSection>}
 */

const SECTION_INDEX = new Map(REFERENCE_SECTIONS.map((section) => [section.key, section]))

/**
 * Read a reference section
 * @param {string} key - Collection key
 * @return {ReferenceSection | undefined} - Section metadata
 */

export const referenceSection = (key: string): ReferenceSection | undefined =>
  SECTION_INDEX.get(key as ReferenceKey)

/**
 * Check a known collection key
 * @param {string} key - Candidate key
 * @return {boolean} - Known collection
 */

export const isReferenceKey = (key: string): key is ReferenceKey =>
  SECTION_INDEX.has(key as ReferenceKey)

/**
 * Collections of one console group
 * @param {ReferenceGroupKey} key - Group key
 * @return {ReferenceSection[]} - Sections in display order
 */

export const referenceSectionsOfGroup = (key: ReferenceGroupKey): ReferenceSection[] =>
  REFERENCE_SECTIONS.filter((section) => section.group === key)
