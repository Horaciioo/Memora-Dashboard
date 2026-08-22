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
  'etats',
  'priorites',
  'evenements',
  'formations',
  'livecon',
] as const

/**
 * Reference collection key
 * @type {(typeof REFERENCE_KEYS)[number]}
 */

export type ReferenceKey = (typeof REFERENCE_KEYS)[number]

/**
 * Display metadata of a reference collection
 * @typedef {Object} ReferenceSection
 * @property {ReferenceKey} key - Collection key
 * @property {string} label - Plural label
 * @property {string} singular - Singular label
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
  label: string
  singular: string
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
    label: 'YouTubeurs',
    singular: 'YouTubeur',
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
    label: 'Divisions',
    singular: 'Division',
    description: 'Junior puis les trois squads, du rang le plus bas au plus haut.',
    icon: 'division',
    figure: 'academy',
    reorderable: false,
    emptyTitle: 'Aucune division',
    emptyDescription: 'Crée Junior, puis les squads, en montant par rang.',
  },
  {
    key: 'fonctions',
    label: 'Fonctions',
    singular: 'Fonction',
    description: 'Postes de modération principaux et postes secondaires à responsabilité.',
    icon: 'shield',
    figure: 'moderation',
    reorderable: true,
    emptyTitle: 'Aucune fonction',
    emptyDescription: 'Ajoute les postes de modération avant d’affecter un modérateur.',
  },
  {
    key: 'plateformes',
    label: 'Plateformes',
    singular: 'Plateforme',
    description: 'Là où l’action initiale d’un projet se déroule.',
    icon: 'platform',
    figure: 'settings',
    reorderable: true,
    emptyTitle: 'Aucune plateforme',
    emptyDescription: 'Ajoute Discord, YouTube, ou toute autre plateforme utilisée.',
  },
  {
    key: 'etats',
    label: 'États',
    singular: 'État',
    description: 'Colonnes des tableaux de projets, tâches et réunions.',
    icon: 'tasks',
    figure: 'projects',
    reorderable: true,
    emptyTitle: 'Aucun état',
    emptyDescription: 'Crée les colonnes de tes tableaux, une par étape du flux.',
  },
  {
    key: 'priorites',
    label: 'Priorités',
    singular: 'Priorité',
    description: 'Niveaux d’urgence partagés par les projets et les tâches.',
    icon: 'alert',
    figure: 'settings',
    reorderable: false,
    emptyTitle: 'Aucune priorité',
    emptyDescription: 'Ajoute tes niveaux d’urgence, du plus léger au plus lourd.',
  },
  {
    key: 'evenements',
    label: 'Types d’évènement',
    singular: 'Type d’évènement',
    description: 'Lives, réunions et rendez-vous que le calendrier accepte.',
    icon: 'meetings',
    figure: 'settings',
    reorderable: true,
    emptyTitle: 'Aucun type d’évènement',
    emptyDescription: 'Déclare tes lives et tes réunions avant de remplir le calendrier.',
  },
  {
    key: 'formations',
    label: 'Formations',
    singular: 'Formation',
    description: 'Cours de la Marsha Academy, par période et par fonction.',
    icon: 'academy',
    figure: 'academy',
    reorderable: true,
    emptyTitle: 'Aucune formation',
    emptyDescription: 'Déclare les formations obligatoires de la 1ʳᵉ période pour commencer.',
  },
  {
    key: 'livecon',
    label: 'Niveaux de livecon',
    singular: 'Niveau',
    description: 'Niveaux de vigilance et consignes associées.',
    icon: 'livecon',
    figure: 'livecon',
    reorderable: false,
    emptyTitle: 'Aucun niveau',
    emptyDescription: 'Crée les trois niveaux de vigilance et leurs consignes.',
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
