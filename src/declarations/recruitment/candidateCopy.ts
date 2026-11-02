import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'

// Search parameter naming the tab to open
export const CANDIDATE_TAB_PARAM = 'onglet'

/**
 * Copy of the candidate file
 * @type {Record<string, string>}
 */

export const CANDIDATE_COPY = {
  timeline: 'Sa timeline',
  start: 'Commencer son entretien',
  back: 'Retour à la liste des candidats',
  resume: 'Reprendre l’entretien',
  review: 'Revoir l’entretien',
  informations: 'Informations',
  interview: 'Entretien',
  nextPart: 'Partie suivante : {part}',
  observe: 'Observer ce candidat',
  observing: 'Tu observes ce candidat !',
  observeStopTitle: 'Tu ne souhaites plus observer ce candidat ?',
  observeStopYes: 'Oui',
  observeStopNo: 'Non',
  anonymous: 'Candidat',
  tabOverview: 'Aperçu',
  tabBilan: 'Bilan',
  tabManagement: 'Gestion',
  tabExercises: 'Exercices',
  tabTimeline: 'Timeline',
  pinned: 'Commentaire épinglé',
  bilanWritten: 'Bilan écrit',
  bilanComments: 'Notes',
  bilanCommentsEmpty: 'Aucune note n’est posée pour le moment',
  discordId: 'Identifiant Discord',
  pseudonym: 'Pseudonyme',
  measures: 'Mesures',
  blacklist: 'Blacklist',
  blacklistedNotice: 'Ce candidat a été blacklisté et ne peut plus être pris en entretien.',
  observeLocked: 'Tu observes uniquement, rien ne se modifie ici.',
} as const

/**
 * Moments of a candidate, by key
 * @type {Record<CandidateStage, string>}
 */

export const CANDIDATE_STAGE_COPY: Record<CandidateStage, string> = {
  joined: 'A rejoint le Discord',
  availabilities: 'A donné ses disponibilités',
  waiting: 'En attente de son entretien',
  interviewing: 'En entretien',
  results: 'En attente de validation finale',
}
