import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'

/**
 * Copy of the candidate file
 * @type {Record<string, string>}
 */

export const CANDIDATE_COPY = {
  timeline: 'Sa timeline',
  pass: 'Passer son entretien',
  resume: 'Reprendre l’entretien',
  review: 'Revoir l’entretien',
  informations: 'Informations',
  interview: 'Entretien',
  nextPart: 'Partie suivante : {part}',
  observe: 'Observer cet entretien',
  anonymous: 'Candidat',
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
  passed: 'A passé son entretien',
  results: 'Attend les résultats',
}
