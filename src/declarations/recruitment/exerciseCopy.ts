/**
 * Copy of the practical exercises
 * @type {Record<string, string>}
 */

export const EXERCISE_COPY = {
  pickTitle: 'Choisis l’exercice',
  pickLead:
    'Un seul exercice à la fois. Le candidat n’en voit rien tant que tu ne le démarres pas.',
  random: 'Prendre aléatoirement',
  revealKicker: 'Exercice',
  showQuestionnaire: 'Afficher le questionnaire',
  showContexts: 'Afficher les contextes',
  startExercise: 'Démarrer l’exercice',
  digTitle: 'Pour creuser',
  questionsTitle: 'Les questions',
  sayTitle: 'À dire',
  tipTitle: 'Repère',
  scenarioTitle: 'À lire ou à partager',
  nextStep: 'Question suivante',
  finishRun: 'Terminer',
  stopRun: 'Arrêter',
  runOver: 'Exercice terminé',
  secondsLeft: '{seconds} s',
  noTimer: 'Libre',
  stepOf: 'Question {number} sur {total}',
  linksTitle: 'Les liens du candidat',
  linksLead:
    'Choisis un contexte modéré et un contexte complexe. Chaque lien ne s’ouvre qu’avec le compte Discord du candidat.',
  moderateTitle: 'Contexte modéré',
  complexTitle: 'Contexte complexe',
  generate: 'Générer les liens',
  regenerate: 'Générer de nouveaux liens',
  expire: 'Expirer le lien',
  expired: 'Expiré',
  copy: 'Copier le lien',
  copied: 'Lien copié',
  opened: 'Ouvert',
  notOpened: 'Pas encore ouvert',
  plays: '{plays} sur {max} lectures',
  expiresAt: 'Expire à {time}',
  linkGenerated: 'Liens générés',
  linkExpired: 'Lien expiré',
  pickOne: 'Choisis un contexte de chaque niveau.',
  noLinks: 'Aucun lien pour ce candidat.',
  casesLead: 'Choisis le cas à présenter.',
} as const

/**
 * Copy of the public page the candidate opens
 * @type {Record<string, string>}
 */

export const EXERCISE_PUBLIC_COPY = {
  title: 'Contexte écrit',
  invalidTitle: 'Lien expiré',
  invalidDescription:
    'Ce lien n’est plus valable. Demande-en un nouveau à la personne qui te reçoit.',
  verifyTitle: 'Confirme ton identité',
  verifyLead:
    'Ce lien est personnel. Connecte-toi avec ton compte Discord pour qu’on vérifie qu’il est bien pour toi. Seul ton identifiant est lu.',
  verify: 'Me connecter avec Discord',
  wrongAccount: 'Ce lien est réservé à un autre compte Discord.',
  refused: 'La connexion Discord a échoué. Réessaie.',
  start: 'Lancer la mise en situation',
  replay: 'Revoir la situation',
  playsLeft: '{left} lecture(s) restante(s)',
  noPlaysLeft: 'Tu as vu la situation le nombre de fois autorisé.',
  yourTurn: 'À toi',
  yourTurnLead:
    'Explique à l’oral comment tu résoudrais la situation. S’il y a quelque chose à écrire, écris-le dans {privateTalk}, la personne qui te reçoit lit ton écran.',
  chatTitle: 'Chat du stream',
  chatInput: 'Envoyer un message',
  streamTitle: 'En direct',
  serverName: 'Serveur',
  playing: 'En cours',
  over: 'Terminé',
} as const
