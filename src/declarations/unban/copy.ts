/**
 * Staff side of Déban., spoken to a teammate
 * @type {Record<string, string>}
 */

export const UNBAN_COPY = {
  title: 'Déban.',
  requestsTab: 'Demandes',
  linksTab: 'Liens',
  formTab: 'Formulaire',
  searchPlaceholder: 'Chercher un pseudonyme ou un identifiant Discord…',
  emptyRequests: 'Aucune demande de déban pour le moment.',
  emptyLinks: 'Aucun lien généré pour le moment.',
  takeAction: 'Prendre en charge',
  releaseAction: 'Relâcher',
  acceptAction: 'Accepter',
  refuseAction: 'Refuser',
  reopenAction: 'Rouvrir',
  assigneeNone: 'Aucun',
  answerToRequester: 'Réponse au demandeur',
  reopenReason: 'Motif de la réouverture',
  internalNotes: 'Visible par l’équipe seulement',
  toLiftOnDiscord: 'À débannir sur Discord',
  liftedOnDiscord: 'Débanni sur Discord',
  linkCreate: 'Générer un lien',
  linkCopy: 'Copier le lien',
  linkShownOnce: 'Ce lien ne sera plus affiché. Copie-le maintenant.',
  linkExtend: 'Prolonger',
  linkRevoke: 'Révoquer',
  linkRenew: 'Renouveler',
  expectedDiscordId: 'Identifiant Discord attendu',
  expectedDiscordIdHint: 'Facultatif. Seul ce compte Discord pourra ouvrir le lien.',
  expiry: 'Valable',
  formVersion: 'Version {number}',
  formVersionTag: 'Formulaire v{number}',
  emptyAnswer: 'Pas de réponse',
  formNewer: 'Une version plus récente existe.',
  formDraft: 'Brouillon non publié',
  formPublish: 'Publier le formulaire',
  formDiscard: 'Abandonner le brouillon',
  conflict: 'Ce dossier vient d’être modifié par {name}.',
  alreadyTaken: 'Déjà pris en charge par {name}.',
} as const

/**
 * Public side of Déban., spoken to a stranger
 * @type {Record<string, string>}
 */

export const UNBAN_PUBLIC_COPY = {
  title: 'Demande de déban',
  closed: 'Les demandes de déban sont fermées pour le moment.',
  signIn: 'Se connecter avec Discord',
  signInHint: 'Nous vérifions ainsi que la demande vient bien du compte banni.',
  wrongAccount: 'Ce lien est réservé à un autre compte Discord.',
  linkExpired: 'Ce lien a expiré. Demandez-en un nouveau à l’équipe de modération.',
  linkRevoked: 'Ce lien a été révoqué. Demandez-en un nouveau à l’équipe de modération.',
  linkUnknown: 'Ce lien n’existe pas.',
  alreadyOpen: 'Une demande est déjà en cours pour ce compte.',
  confirm: 'Je confirme que ces informations sont exactes.',
  submit: 'Envoyer ma demande',
  retry: 'Réessayer',
  keepLink: 'Gardez ce lien pour suivre votre demande.',
  reference: 'Référence',
  lastUpdate: 'Dernière mise à jour',
  decision: 'Décision',
  answer: 'Réponse de l’équipe',
  tooFast: 'Merci de prendre le temps de relire votre demande avant de l’envoyer.',
} as const

/**
 * Reasons a form is refused
 * @type {Record<string, string>}
 */

export const UNBAN_FORM_COPY = {
  notAForm: 'Le formulaire est illisible.',
  noQuestion: 'Ajoute au moins une question.',
  tooManyQuestions: 'Il y a trop de questions.',
  duplicateQuestion: 'Deux questions portent le même identifiant.',
  unknownType: 'Ce type de question n’existe pas.',
  labelRequired: 'Chaque question a besoin d’un intitulé.',
  labelTooLong: 'Cet intitulé est trop long.',
  optionsRequired: 'Une question à choix propose au moins deux options.',
  tooManyOptions: 'Il y a trop d’options.',
  duplicateOption: 'Deux options portent le même identifiant.',
  optionLabelRequired: 'Chaque option a besoin d’un libellé.',
  optionsNotAllowed: 'Ce type de question ne propose pas d’options.',
  badScale: 'Les bornes de l’échelle sont incorrectes.',
  scaleMissing: 'Une échelle a besoin de ses bornes.',
  badLength: 'La longueur maximale est incorrecte.',
  nothingChanged: 'Rien n’a changé.',
  noDraft: 'Il n’y a pas de brouillon.',
  unknownAnswer: 'Cette réponse ne correspond à aucune question.',
} as const

/**
 * Reasons a link action is refused
 * @type {Record<string, string>}
 */

export const UNBAN_ERRORS = {
  intakeClosed: 'Les demandes publiques sont fermées pour le moment.',
  badExpiry: 'Cette durée de validité n’est pas proposée.',
  badDiscordId: 'Cet identifiant Discord est incorrect.',
  labelTooLong: 'Cette note est trop longue.',
  linkUsed: 'Ce lien a déjà servi, son dossier garde son lien.',
  linkRevoked: 'Ce lien est révoqué, génère-en un nouveau.',
  badPage: 'Cette page n’existe pas.',
} as const
