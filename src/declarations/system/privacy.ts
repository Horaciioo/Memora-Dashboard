import { createRegistry } from '@/core/lib/registry'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Who answers for the processing, the only part no code can infer
 * @type {{ name: string, contact: string }}
 */

export const DATA_CONTROLLER = {
  name: 'Jérémy',
  contact: 'Par message direct sur le serveur Discord',
}

/**
 * Age below which the organisation does not recruit. Sitting above the French
 * threshold for digital consent, a member always agrees for themselves
 * @type {{ minimum: number, consentThreshold: number }}
 */

export const AGE_POLICY = {
  minimum: 16,
  consentThreshold: 15,
}

/**
 * Turn a day count into the sentence the notice shows
 * @param {number} days - Retention length
 * @return {string} - Display sentence
 */

const inDays = (days: number): string => {
  if (days % 365 === 0) return `${days / 365} an${days > 365 ? 's' : ''}`
  if (days % 30 === 0) return `${days / 30} mois`

  return `${days} jours`
}

/**
 * How long each family of data is kept, the single source the purge also reads
 * @type {Record<string, number>}
 */

export const RETENTION_POLICIES = {
  expiredSessions: RETENTION_SETTINGS.expiredSessionDays,
  readNotifications: RETENTION_SETTINGS.readNotificationDays,
  activityLogs: RETENTION_SETTINGS.activityLogDays,
  rejectedCandidates: RETENTION_SETTINGS.rejectedCandidateDays,
}

/**
 * One record of the processing register
 * @typedef {Object} ProcessingRecord
 * @property {string} label - Purpose
 * @property {string} categories - Data categories
 * @property {string} legalBasis - Why it is lawful
 * @property {string} retention - How long it is kept
 */

export interface ProcessingRecord {
  label: string
  categories: string
  legalBasis: string
  retention: string
}

const PROCESSING_MAP = {
  identity: {
    label: 'Identifier les membres de l’équipe',
    categories: 'Identifiant Discord, pseudo, portrait, date d’arrivée',
    legalBasis: 'Intérêt légitime à organiser la modération',
    retention: 'Conservé, ces éléments étant publics sur Discord',
  },
  contact: {
    label: 'Joindre un membre',
    categories: 'Adresse e-mail, téléphone, réseaux, fuseau, langues',
    legalBasis: 'Consentement, chaque champ étant facultatif',
    retention: 'Effacé au départ, ou à tout moment sur simple demande du membre',
  },
  birthday: {
    label: 'Souhaiter les anniversaires',
    categories: 'Date de naissance',
    legalBasis: 'Consentement, révocable depuis les paramètres',
    retention: 'Effacé au départ, ou à tout moment sur simple demande du membre',
  },
  organisation: {
    label: 'Répartir le travail et les équipes',
    categories: 'Rôle, fonctions, division, créateurs suivis, équipes, projets, tâches',
    legalBasis: 'Intérêt légitime à organiser la modération',
    retention: 'Conservé pour l’historique d’équipe',
  },
  absences: {
    label: 'Traiter les demandes d’absence',
    categories: 'Dates, motif choisi dans une liste fermée, décision',
    legalBasis: 'Intérêt légitime à planifier les présences',
    retention: 'Conservé avec l’historique d’équipe',
  },
  assessment: {
    label: 'Accompagner la formation et le suivi',
    categories: 'Notes de suivi, bilans, compétences, objectifs, sanctions',
    legalBasis: 'Intérêt légitime à encadrer et faire progresser une équipe',
    retention: 'Conservé pour la continuité de l’accompagnement',
  },
  activity: {
    label: 'Tracer les actions faites dans l’outil',
    categories: 'Auteur, action, cible, horodatage',
    legalBasis: 'Intérêt légitime à la sécurité et à la traçabilité',
    retention: inDays(RETENTION_POLICIES.activityLogs),
  },
  sessions: {
    label: 'Maintenir la connexion',
    categories: 'Jeton de session, navigateur, adresse, dates',
    legalBasis: 'Nécessaire au fonctionnement du service',
    retention: inDays(RETENTION_POLICIES.expiredSessions),
  },
  constraints: {
    label: 'Tenir compte des contraintes déclarées',
    categories: 'Contraintes pathologiques, maladies, contraintes privées',
    legalBasis: 'Consentement explicite, chaque champ étant facultatif',
    retention: 'Chiffré au repos, effacé au départ ou à tout moment par le membre',
  },
  recruitment: {
    label: 'Instruire les candidatures',
    categories: 'Identifiant Discord, commentaires d’entretien, décision',
    legalBasis: 'Intérêt légitime à recruter',
    retention: inDays(RETENTION_POLICIES.rejectedCandidates),
  },
  notifications: {
    label: 'Alerter sur ce qui te concerne',
    categories: 'Destinataire, auteur, cible, date de lecture',
    legalBasis: 'Nécessaire au fonctionnement du service',
    retention: inDays(RETENTION_POLICIES.readNotifications),
  },
} satisfies Record<string, ProcessingRecord>

/**
 * Register of processing, read by the public notice and by the retention job
 * @type {Registry<ProcessingName, ProcessingRecord>}
 */

export const PROCESSING_REGISTRY = createRegistry<keyof typeof PROCESSING_MAP, ProcessingRecord>(
  PROCESSING_MAP
)

export type ProcessingName = keyof typeof PROCESSING_MAP

/**
 * What a member is asked to agree to, and how that agreement is versioned
 * @type {{ version: number, title: string, body: string[], label: string }}
 */

export const HISTORY_CONSENT = {
  version: RETENTION_SETTINGS.consentVersion,
  title: 'Ce qui reste, et ce qui part',
  body: [
    'Memora garde la trace de qui a fait quoi : projets menés, réunions tenues, juniors formés, décisions prises. Cet historique n’a de sens que si on peut encore lire un nom dessus.',
    'Ton identifiant Discord, ton pseudo et ton portrait sont conservés. Ce sont des informations déjà publiques sur Discord, et ce sont elles qui rendent l’historique lisible.',
    'Si tu quittes l’équipe, on efface les informations que tu nous as toi-même communiquées : ton adresse e-mail, ton téléphone, ta date de naissance et tes réseaux.',
    'Les notes de suivi écrites pendant ton parcours sont conservées. Ce ne sont pas des jugements : elles servent à accompagner et à faire progresser, et elles gardent leur sens dans la durée.',
    'Ces informations privées t’appartiennent. Tu peux les supprimer toi-même, quand tu veux, depuis tes paramètres, sans avoir à te justifier.',
  ],
  label: 'J’ai lu et j’accepte',
}

/**
 * What leaving does to one account, field by field. Only what the member
 * volunteered is removed — what Discord already makes public stays
 * @typedef {Object} AnonymisationPlan
 * @property {string[]} cleared - Fields emptied
 * @property {string[]} kept - Fields deliberately preserved
 * @property {string[]} purged - Relations dropped entirely
 */

export interface AnonymisationPlan {
  cleared: string[]
  kept: string[]
  purged: string[]
}

/**
 * The plan the anonymisation executes, so the rule lives in one place
 * @type {AnonymisationPlan}
 */

export const ANONYMISATION_PLAN: AnonymisationPlan = {
  cleared: ['email', 'phone', 'birthday'],
  kept: ['discordId', 'displayName', 'avatarUrl'],
  purged: ['socialLinks', 'discordToken', 'sessions'],
}
