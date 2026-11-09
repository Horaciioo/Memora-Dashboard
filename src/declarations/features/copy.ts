import type { IconName } from '@/declarations/ui/icons'
import type {
  FeatureGroup,
  FeatureKind,
  FeatureModeName,
  FeatureSection,
} from '@/declarations/features/types'

/**
 * Copy of the features console and of a closed feature
 * @type {Record<string, string>}
 */

export const FEATURE_COPY = {
  title: 'Fonctionnalités',
  lead: 'Active ou coupe n’importe quelle page, jeu ou système de Memora, sans redéployer.',
  heroDescription: 'Chaque page, chaque jeu, chaque système : un interrupteur.',
  searchPlaceholder: 'Chercher une page, un jeu, un système',
  filterAll: 'Tout',
  filterOff: 'Coupé',
  filterAdmins: 'Admins',
  filterOn: 'Actif',
  expand: 'Déplier',
  collapse: 'Replier',
  locked: 'Toujours actif, pour ne pas t’enfermer dehors',
  inherited: 'Coupé par « {source} »',
  noteLabel: 'Message pour les membres',
  notePlaceholder: 'Ex. De retour lundi, on termine une mise à jour',
  noteSave: 'Enregistrer le message',
  noteHint: 'Affiché à la place de la page.',
  withChildren: 'Appliquer aussi à tout ce qu’elle contient',
  allOn: 'Tout rallumer',
  sectionOff: 'Tout couper',
  sectionOn: 'Tout activer',
  sectionsNav: 'Catégories',
  sectionCut: 'Coupures',
  nowTitle: 'En ce moment',
  nowLead: 'Ce qui n’est pas ouvert à tout le monde.',
  resume: 'Rallumer',
  paused: 'En pause',
  pausedHint: 'Endormi dans le code, aucun interrupteur ne le réveille',
  allOnConfirmTitle: 'Tout rallumer ?',
  allOnConfirmDescription: 'Chaque interrupteur revient à sa position d’origine.',
  offCount: '{count} coupé(s)',
  adminsCount: '{count} réservé(s) aux admins',
  emptyTitle: 'Rien ne correspond',
  emptyDescription: 'Essaie un autre mot ou un autre filtre.',
  unknown: 'Fonctionnalité inconnue',
  saved: 'Interrupteur enregistré',
  reset: 'Tout est rallumé',
  closedTitle: 'Cette fonctionnalité est coupée',
  closedLead: 'Elle revient dès que l’équipe la rallume.',
  closedAdminsTitle: 'Cette fonctionnalité est réservée aux admins',
  closedHome: 'Retour à l’accueil',
  closedEnable: 'La rallumer',
  adminPreview: 'Tu la vois parce que tu es admin',
  apiClosed: 'Cette fonctionnalité est coupée pour le moment.',
} as const

/**
 * Switch positions as the console words them
 * @type {Record<FeatureModeName, { label: string, hint: string }>}
 */

export const FEATURE_MODE_COPY: Record<FeatureModeName, { label: string; hint: string }> = {
  ON: { label: 'Actif', hint: 'Ouvert à tous' },
  ADMINS: { label: 'Admins', hint: 'Visible des seuls admins, pour tester' },
  OFF: { label: 'Coupé', hint: 'Fermé pour tout le monde' },
}

/**
 * Kinds as the console words them
 * @type {Record<FeatureKind, string>}
 */

export const FEATURE_KIND_COPY: Record<FeatureKind, string> = {
  page: 'Page',
  subpage: 'Sous-page',
  game: 'Jeu',
  system: 'Système',
}

/**
 * Console sections, in display order
 * @type {{ key: FeatureSection, title: string, lead: string, icon: IconName }[]}
 */

export const FEATURE_SECTIONS: {
  key: FeatureSection
  title: string
  lead: string
  icon: IconName
}[] = [
  {
    key: 'everyday',
    title: 'Au quotidien',
    lead: 'Ce que chaque membre ouvre tous les jours.',
    icon: 'dashboard',
  },
  {
    key: 'team',
    title: 'Équipe',
    lead: 'Les membres, leur planning et ce qu’on leur annonce.',
    icon: 'teams',
  },
  {
    key: 'work',
    title: 'Travail',
    lead: 'Les projets, les tâches et les pages écrites.',
    icon: 'briefcase',
  },
  {
    key: 'twitch',
    title: 'Modération Twitch',
    lead: 'Les lives, leur espace de travail et les sanctions.',
    icon: 'twitch',
  },
  {
    key: 'discord',
    title: 'Modération Discord',
    lead: 'Les sanctions Discord et les bots de Marsha.',
    icon: 'discordLogo',
  },
  {
    key: 'training',
    title: 'Recrutement et formation',
    lead: 'De la candidature au parcours Legacy.',
    icon: 'academy',
  },
  {
    key: 'play',
    title: 'Memora Play',
    lead: 'Les jeux, les parties et tout ce qui les entoure.',
    icon: 'playPawn',
  },
  {
    key: 'tools',
    title: 'Outils partagés',
    lead: 'Ce qui vit autour des pages, partout dans l’application.',
    icon: 'spark',
  },
  {
    key: 'administration',
    title: 'Administration',
    lead: 'La configuration et la console Système.',
    icon: 'shield',
  },
]

/**
 * Families as the console words them
 * @type {Record<FeatureGroup, string>}
 */

export const FEATURE_GROUP_COPY: Record<FeatureGroup, string> = {
  games: 'Jeux',
  tables: 'Parties',
  social: 'Vie sociale',
  progress: 'Progression',
}
