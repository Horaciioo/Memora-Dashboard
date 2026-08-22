/**
 * Copy of the academy surfaces
 * @type {Record<string, string>}
 */

export const ACADEMY_COPY = {
  title: 'Marsha Academy',
  lead: 'Les juniors en formation, période par période. Aucun engagement de leur côté, ils peuvent partir quand ils veulent.',
  emptyTitle: 'Aucun junior',
  emptyDescription: 'Ajoute un modérateur en statut Academy pour le suivre ici.',
  noTrainingsTitle: 'Aucune formation',
  noTrainingsDescription: 'Déclare les formations obligatoires dans la configuration.',
  configure: 'Ouvrir la configuration',
  validate: 'Valider la formation',
  revoke: 'Retirer la validation',
  advance: 'Passer à la période suivante',
  graduate: 'Sortir de l’Academy',
  advanceTitle: 'Faire avancer ce junior ?',
  advanceDescription: 'Il passe à la période suivante. Ses formations validées restent acquises.',
  graduateDescription: 'Il quitte l’Academy et passe en modérateur actif.',
  mandatory: 'Obligatoire',
  progress: 'formations validées',
  blocked: 'Formations obligatoires en attente',
  ready: 'Prêt à passer',
  periodless: 'Sans période',
} as const
