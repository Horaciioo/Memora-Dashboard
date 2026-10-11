import type { ChatStage } from '@/declarations/tour/chat'

/**
 * Words of the first visit that are not Memora's script
 * @type {Record<string, string>}
 */

export const TOUR_COPY = {
  chatLabel: 'Discussion avec Memora',
  memora: 'Memora',
  tabTitle: 'Informations',
  typing: 'Memora écrit…',
  inputPlaceholder: 'Écris à Memora…',
  inputWaiting: 'La suite arrive…',
  inputLabel: 'Ton message à Memora',
  inputSend: 'Envoyer le message',
  send: 'Envoyer',
  yes: 'Yep, je veux bien',
  no: 'Non, je ne préfère pas.',
  skip: 'Passer',
  skipBirthday: 'Je préfère ne pas la donner',
  birthdayLabel: 'Ma date de naissance',
  languagesLabel: 'Mes langues',
  languagesEmpty: 'Choisir mes langues',
  colorBlindYes: 'Yep',
  colorBlindNo: 'Nope',
  colorNone: 'Aucune de ces propositions ne me convient',
  colorVisionLabel: 'Mon daltonisme',
  socialsLabel: 'Mes réseaux',
  socialAdd: 'Ajouter ce réseau',
  socialDone: 'Continuer',
  socialNone: 'Je n’ai rien à partager',
  hurdleYes: 'Oui, j’en ai',
  hurdleNo: 'Non, c’est tout bon.',
  hurdleDetailYes: 'Oui',
  hurdleDetailNo: 'Non',
  hurdleExamples: 'D’abord, montre-moi des exemples s’il te plaît',
  hurdleKeepQuiet: 'Je préfère ne rien dire',
  hurdleLabel: 'Ce qui pourrait freiner ma modération',
  inputHurdlePlaceholder: 'Écris ce que tu as besoin d’écrire pour tes particularités…',
  privacyKicker: 'Confidentialité',
  privacy:
    'Je précise que ces informations seront entièrement confidentielles et internes à l’Administration qui est en charge du YouTubeur pour qui tu as postulé.',
  sample: 'Aa',
  ready: 'C’est parti',
  timelineLabel: 'Étapes de la discussion',
  loading: 'Je prépare ta visite…',
  loaded: 'Tout est prêt.',
  stepNext: 'Suivant',
  stepPrevious: 'Précédent',
  stepFinish: 'Terminer',
  skipTour: 'Passer la visite',
  pointerTitle: 'Page suivante : {label}',
  pointerBody: 'Clique sur « {label} » dans le menu.',
  pointerBackBody: 'Reviens d’abord à l’accueil, puis clique sur « {label} » dans le menu.',
  doneTitle: 'Tu as fait le tour de Memora',
  doneCourse: 'Retrouve cette formation, achevée, dans tes Formations.',
  doneOpen: 'Voir mes formations',
  doneClose: 'Fermer',
  progress: 'Avancée de la visite',
} as const

/**
 * The one network a member must give, the others are optional
 * @type {string}
 */

export const TOUR_REQUIRED_NETWORK = 'Instagram'

/**
 * Steps of the welcome conversation, in order
 * @type {readonly { key: ChatStage, label: string }[]}
 */

export const TOUR_STAGES: readonly { key: ChatStage; label: string }[] = [
  { key: 'presentation', label: 'Présentation de Memora' },
  { key: 'information', label: 'Prise d’informations' },
  { key: 'preferences', label: 'Préférences' },
]
