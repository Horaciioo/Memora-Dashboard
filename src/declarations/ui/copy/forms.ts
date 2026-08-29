/**
 * Field validation messages
 * @type {Record<string, string>}
 */

export const FORM_COPY = {
  required: 'Ce champ est obligatoire.',
  tooLong: 'C’est trop long.',
  tooShort: 'C’est trop court.',
  tooSmall: 'La valeur est trop basse.',
  tooLarge: 'La valeur est trop haute.',
  tooManyItems: 'Il y a trop d’entrées.',
  notANumber: 'Entre un nombre.',
  notADate: 'Entre une date valable.',
  notAnEmail: 'Cette adresse mail n’a pas l’air correcte.',
  notAUrl: 'Ce lien n’a pas l’air correct.',
  notADiscordId: 'Un identifiant Discord ne contient que des chiffres.',
  notAnOption: 'Cette valeur n’est pas proposée.',
  notAColour: 'Entre une couleur hexadécimale.',
  endBeforeStart: 'La fin arrive avant le début.',
  categories: 'Catégories du formulaire',
} as const

/**
 * Markdown editor labels
 * @type {Record<string, string>}
 */

export const EDITOR_COPY = {
  write: 'Rédaction',
  preview: 'Aperçu',
  empty: 'Rien à prévisualiser pour l’instant.',
  bold: 'Gras',
  italic: 'Italique',
  underline: 'Souligné',
  strike: 'Barré',
  heading: 'Titre',
  quote: 'Citation',
  list: 'Liste',
  orderedList: 'Liste numérotée',
  code: 'Code',
  codeBlock: 'Bloc de code',
  link: 'Lien',
  spoiler: 'Spoiler',
  counter: 'caractères',
} as const

/**
 * File field labels and rejections
 * @type {Record<string, string>}
 */

export const FILE_COPY = {
  choose: 'Choisir une image',
  replace: 'Remplacer l’image',
  remove: 'Retirer l’image',
  uploading: 'Envoi en cours…',
  tooLarge: 'Ce fichier est trop lourd.',
  wrongType: 'Ce format d’image n’est pas accepté.',
  unknownBucket: 'Cette destination de fichier n’existe pas.',
  missing: 'Aucun fichier reçu.',
} as const

/**
 * Labels of the drawn select menu and date picker
 * @type {Record<string, string>}
 */

export const PICKER_COPY = {
  choose: 'Choisir…',
  searchOption: 'Filtrer les options…',
  noOption: 'Aucune option pour le moment.',
  openMenu: 'Dérouler la liste',
  chooseDay: 'Choisir une date',
  chooseRange: 'Choisir des dates',
  rangeHint: 'Glisse pour couvrir plusieurs jours',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  today: 'Aujourd’hui',
  clear: 'Effacer',
  time: 'Heure',
} as const

/**
 * Copy of the colour wheel
 * @type {Record<string, string>}
 */

export const COLOUR_COPY = {
  wheel: 'Roue des couleurs',
  hue: 'Teinte',
  brightness: 'Luminosité',
  hex: 'Hexadécimal',
  swatches: 'Couleurs suggérées',
  preview: 'Aperçu de la couleur',
  invalid: 'Code hexadécimal invalide.',
  none: 'Aucune couleur',
  pick: 'Choisir une couleur',
} as const

/**
 * Copy of the emoji picker
 * @type {Record<string, string>}
 */

export const EMOJI_COPY = {
  choose: 'Choisir un émoji',
  change: 'Changer d’émoji',
  none: 'Aucun émoji',
  clear: 'Retirer',
  title: 'Émojis',
  lead: 'Compatibles avec tous les systèmes',
  search: 'Rechercher un émoji',
  searchPlaceholder: 'Nom français ou anglais…',
  results: 'Résultats',
  noMatch: 'Aucun émoji ne porte ce nom.',
  suggestions: 'Fréquents',
} as const

/**
 * Glyph drawn beside a priority option
 * @type {string}
 */

export const PRIORITY_GLYPH = '!!'

/**
 * Category labels a form declaration groups its fields under
 * @type {Record<string, string>}
 */

export const FORM_GROUPS = {
  essentials: 'Général',
  assignment: 'Attribution',
  planning: 'Dates',
  details: 'Compléments',
  identity: 'Identité',
  contact: 'Contact',
  visibility: 'Visibilité',
} as const
