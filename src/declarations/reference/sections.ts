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
  'dispositifs',
  'categories-competences',
  'competences',
  'etapes-pim',
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
    key: 'etats',
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
    label: 'Types d’évènement',
    singular: 'Type d’évènement',
    gender: 'masculine',
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
    key: 'dispositifs',
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
