import { createRegistry } from '@/core/lib/registry'
import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Query keys a guided walkthrough travels on
 * @type {{ guide: string, tab: string }}
 */

export const GUIDE_PARAMS = {
  guide: 'guide',
  tab: 'onglet',
} as const

/**
 * Beacons the walkthroughs point at, one name per control
 * @type {Record<string, string>}
 */

export const GUIDE_BEACONS = {
  fsiTabs: 'fsi:tabs',
  fsiTimeline: 'fsi:timeline',
  fsiAdvance: 'fsi:advance',
  fsiReviewAdd: 'fsi:review-add',
  fsiNoteAdd: 'fsi:note-add',
  fsiObjectiveAdd: 'fsi:objective-add',
  fsiSkills: 'fsi:skills',
  fsiTrainings: 'fsi:trainings',
  fsiEdit: 'fsi:edit',
  sessionJuniors: 'session:juniors',
  sessionLaunch: 'session:launch',
  calendarAdd: 'calendar:add',
} as const

/**
 * One mark of a walkthrough, a bubble pinned on a control
 * @typedef {Object} GuideMark
 * @property {string} beacon - Control pointed at
 * @property {string} title - What to do
 * @property {string} body - How and why
 */

export interface GuideMark {
  beacon: string
  title: string
  body: string
}

/**
 * Page a walkthrough opens on
 * @typedef {'junior' | 'session' | 'calendar'} GuideSurface
 */

export type GuideSurface = 'junior' | 'session' | 'calendar'

/**
 * Where the owner of a PIM step acts, and the walkthrough that leads them there
 * @typedef {Object} PimDestination
 * @property {string} label - Destination name
 * @property {IconName} icon - Glyph
 * @property {GuideSurface} surface - Page opened
 * @property {string} [tab] - Tab of the follow-up file opened
 * @property {GuideMark[]} marks - Walkthrough, in order
 */

export interface PimDestination {
  label: string
  icon: IconName
  surface: GuideSurface
  tab?: string
  marks: GuideMark[]
}

// Tabs of the follow-up file a walkthrough may open
export const FSI_TABS = {
  timeline: 'timeline',
  informations: 'informations',
  trainings: 'trainings',
  skills: 'skills',
  notes: 'notes',
  objectives: 'objectives',
  reviews: 'reviews',
} as const

const PIM_DESTINATION_MAP = {
  fsiTimeline: {
    label: 'Timeline de la fiche de suivi',
    icon: 'clock',
    surface: 'junior',
    tab: FSI_TABS.timeline,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiTimeline,
        title: 'Lis l’étape en couleur',
        body: 'C’est celle en cours. Son glyph et son texte disent exactement ce qui doit se passer maintenant.',
      },
      {
        beacon: GUIDE_BEACONS.fsiAdvance,
        title: 'Passe à l’étape supérieure une fois faite',
        body: 'Seul un Responsable voit ce bouton. Il valide l’étape en cours et colore la suivante.',
      },
    ],
  },
  fsiReviews: {
    label: 'Bilans vocaux',
    icon: 'confirm',
    surface: 'junior',
    tab: FSI_TABS.reviews,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiTabs,
        title: 'Tu es sur l’onglet Bilans',
        body: 'Chaque bilan vocal tenu avec le junior s’écrit ici, période par période.',
      },
      {
        beacon: GUIDE_BEACONS.fsiReviewAdd,
        title: 'Rédige le bilan juste après l’appel',
        body: 'Durée, ressenti du junior, synthèse et ton avis : suite, période bonus ou arrêt. Enregistre en brouillon, puis soumets-le au Responsable.',
      },
    ],
  },
  fsiNotes: {
    label: 'Notes de suivi',
    icon: 'note',
    surface: 'junior',
    tab: FSI_TABS.notes,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiNoteAdd,
        title: 'Garde une trace factuelle',
        body: 'Une note positive ou négative, datée, sur un fait observé pendant un live ou un ticket. Pas de jugement sur la personne, seulement ce qui s’est passé.',
      },
    ],
  },
  fsiObjectives: {
    label: 'Objectifs personnels',
    icon: 'objective',
    surface: 'junior',
    tab: FSI_TABS.objectives,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiObjectiveAdd,
        title: 'Fixe des objectifs mesurables',
        body: 'Un objectif se vérifie en fin de période : « intervenir sur trois spams sans aide » plutôt que « être plus à l’aise ».',
      },
    ],
  },
  fsiSkills: {
    label: 'Compétences',
    icon: 'skill',
    surface: 'junior',
    tab: FSI_TABS.skills,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiSkills,
        title: 'Ajuste chaque compétence',
        body: 'Monte ou descend le pourcentage d’après ce que tu as vu, pas d’après l’impression générale.',
      },
    ],
  },
  fsiTrainings: {
    label: 'Formations',
    icon: 'academy',
    surface: 'junior',
    tab: FSI_TABS.trainings,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiTrainings,
        title: 'Vérifie les formations terminées',
        body: 'Le junior les suit seul. Celles qu’il a terminées se cochent toutes seules avec leur date.',
      },
    ],
  },
  fsiTrainer: {
    label: 'Formateur du junior',
    icon: 'functionTrainer',
    surface: 'junior',
    tab: FSI_TABS.informations,
    marks: [
      {
        beacon: GUIDE_BEACONS.fsiEdit,
        title: 'Attribue un Formateur',
        body: 'Ouvre la fiche, choisis le Formateur dans la liste et enregistre. Il retrouvera ses tâches sur son Accueil.',
      },
    ],
  },
  sessionLaunch: {
    label: 'Lancement de la PIM',
    icon: 'academy',
    surface: 'session',
    marks: [
      {
        beacon: GUIDE_BEACONS.sessionJuniors,
        title: 'Chaque junior a son Formateur ?',
        body: 'La PIM ne se lance qu’une fois un Formateur attribué à chaque junior confirmé.',
      },
      {
        beacon: GUIDE_BEACONS.sessionLaunch,
        title: 'Lance la PIM',
        body: 'Le bouton passe la session En cours : la timeline de chaque junior démarre aujourd’hui, et chaque Formateur reçoit sa première tâche.',
      },
    ],
  },
  calendarEntry: {
    label: 'Calendrier',
    icon: 'meetings',
    surface: 'calendar',
    marks: [
      {
        beacon: GUIDE_BEACONS.calendarAdd,
        title: 'Pose le rendez-vous',
        body: 'Crée l’évènement avec le junior, à une heure où vous êtes tous les deux disponibles.',
      },
    ],
  },
} satisfies Record<string, PimDestination>

export type PimDestinationName = keyof typeof PIM_DESTINATION_MAP

export const PIM_DESTINATION_REGISTRY = createRegistry<PimDestinationName, PimDestination>(
  PIM_DESTINATION_MAP
)

/**
 * Glyph a PIM step may wear, with the name it is picked by
 * @typedef {Object} PimStepGlyph
 * @property {IconName} icon - Glyph key
 * @property {string} label - What it stands for
 */

export interface PimStepGlyph {
  icon: IconName
  label: string
}

/**
 * Glyphs a PIM step may wear on the timeline
 * @type {readonly PimStepGlyph[]}
 */

export const PIM_STEP_GLYPHS: readonly PimStepGlyph[] = [
  { icon: 'academy', label: 'Formation' },
  { icon: 'functionTrainer', label: 'Formateur' },
  { icon: 'meetings', label: 'Rendez-vous' },
  { icon: 'confirm', label: 'Bilan' },
  { icon: 'note', label: 'Note' },
  { icon: 'objective', label: 'Objectif' },
  { icon: 'skill', label: 'Compétence' },
  { icon: 'livecon', label: 'Live' },
  { icon: 'discord', label: 'Discord' },
  { icon: 'sanctions', label: 'Sanctions' },
  { icon: 'members', label: 'Équipe' },
  { icon: 'star', label: 'Validation' },
  { icon: 'clock', label: 'Échéance' },
]

/**
 * Build the address a walkthrough opens on
 * @param {PimDestinationName} name - Destination
 * @param {{ sessionId: string, juniorId: string | null }} target - Promotion and junior
 * @return {string} - Path with its query
 */

export const destinationHref = (
  name: PimDestinationName,
  target: { sessionId: string; juniorId: string | null }
): string => {
  const destination = PIM_DESTINATION_REGISTRY.get(name)
  const query = new URLSearchParams({ [GUIDE_PARAMS.guide]: name })
  if (destination.tab) query.set(GUIDE_PARAMS.tab, destination.tab)

  const path =
    destination.surface === 'calendar'
      ? ROUTES.calendar
      : destination.surface === 'junior' && target.juniorId
        ? ROUTES.junior(target.sessionId, target.juniorId)
        : ROUTES.session(target.sessionId)

  return `${path}?${query.toString()}`
}
