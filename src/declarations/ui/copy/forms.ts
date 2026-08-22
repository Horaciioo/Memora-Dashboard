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
