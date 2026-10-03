/**
 * Copy of the Legacy track
 * @type {Record<string, string | ((value: number) => string)>}
 */

export const LEGACY_COPY = {
  title: 'Legacy',
  ownTitle: 'Mon Legacy',
  lead: 'Le parcours des futurs Responsables : des modules à suivre, une note de l’évaluateur, un verdict.',
  ownLead: 'Tes modules, ta progression et ton verdict.',
  openTitle: 'Ouvrir un parcours',
  emptyTitle: 'Aucun parcours Legacy',
  emptyDescription: 'Ouvre le parcours d’un modérateur pour le préparer au rôle de Responsable.',
  ownEmptyTitle: 'Aucun parcours en cours',
  ownEmptyDescription: 'Ton parcours Legacy apparaîtra ici quand l’Administration l’aura ouvert.',
  groupRunning: 'En cours',
  groupFinished: 'Terminés',
  noneRunning: 'Aucun parcours en cours.',
  period: 'Période',
  trade: 'Fonction',
  modules: 'Modules',
  points: 'Points',
  outcomeTitle: 'Verdict',
  outcomeModules: 'Modules réussis',
  outcomeMissing: 'Il manque encore des points ou des modules.',
  outcomePoints: 'Total',
  gradeTitle: 'Note de l’évaluateur',
  gradeEmpty: 'Pas encore notée',
  gradeHint: 'Sur 100 : management et maîtrise de l’outil.',
  auto: 'Exercices',
  evaluator: 'Évaluateur',
  total: 'Total',
  passed: 'Réussi',
  notPassed: 'Pas encore',
  start: 'Commencer',
  resume: 'Reprendre',
  review: 'Revoir',
  cleared: 'exercices réussis',
  decidePass: 'Valider le parcours',
  decideFail: 'Clore sans succès',
  decideCancel: 'Annuler le parcours',
  decideTitle: 'Trancher le parcours ?',
  decidePassDescription: 'Le modérateur passe Responsable, ce changement est immédiat.',
  decideFailDescription: 'Le parcours se termine sans succès et le modérateur reste modérateur.',
  decideCancelDescription: 'Le parcours est annulé, la dispense d’évènements s’arrête.',
  opened: 'Parcours ouvert',
  graded: 'Note enregistrée',
  decided: 'Parcours tranché',
  missingPoints: 'Points qui manquent',
  modulesNeeded: '{done} sur {needed} requis',
  endsOn: 'Fin du parcours',
  passMark: 'Réussi dès {points}',
  pointsUnit: 'points',
  exercisesDone: 'Exercices {cleared} sur {total}',
  evaluatorNote: 'Évaluateur',
  weeksRange: (weeks: number) => `${weeks} semaines`,
  back: 'Tous les parcours',
} as const

/**
 * Labels of the Legacy form fields
 * @type {Record<string, string>}
 */

export const LEGACY_FIELD_COPY = {
  member: 'Modérateur',
  memberInfo: 'Un modérateur sans parcours en cours.',
  trade: 'Fonction à diriger',
  tradeInfo: 'Elle décide du dernier module suivi.',
  startsAt: 'Début',
  endsAt: 'Fin',
  endsInfo: 'Entre 3 semaines et 2 mois après le début.',
  tooShort: 'Un parcours dure au moins {min} semaines.',
  tooLong: 'Un parcours dure au plus {max} semaines.',
  alreadyRunning: 'Ce modérateur a déjà un parcours en cours.',
  notFound: 'Ce parcours n’existe pas.',
  mustBeModerator: 'Seul un modérateur peut ouvrir un parcours.',
  gradeRange: 'La note va de 0 à {max}.',
} as const
