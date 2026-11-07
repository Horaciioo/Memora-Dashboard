/**
 * Category families
 * @type {Record<string, string>}
 */

export const BACCALAUREAT_CATEGORY_KINDS = {
  normal: 'Normales',
  odd: 'Insolites',
} as const

export type BaccalaureatCategoryKind = keyof typeof BACCALAUREAT_CATEGORY_KINDS

/**
 * Category catalogue of the Baccalaureat
 * @type {Record<string, { label: string, dictionary: boolean, kind: BaccalaureatCategoryKind }>}
 */

export const BACCALAUREAT_CATEGORIES = {
  firstName: { label: 'Prénom', dictionary: false, kind: 'normal' },
  country: { label: 'Pays', dictionary: false, kind: 'normal' },
  city: { label: 'Ville', dictionary: false, kind: 'normal' },
  animal: { label: 'Animal', dictionary: true, kind: 'normal' },
  job: { label: 'Métier', dictionary: true, kind: 'normal' },
  fruitVegetable: { label: 'Fruit ou légume', dictionary: true, kind: 'normal' },
  object: { label: 'Objet', dictionary: true, kind: 'normal' },
  brand: { label: 'Marque', dictionary: false, kind: 'normal' },
  celebrity: { label: 'Célébrité', dictionary: false, kind: 'normal' },
  movieSeries: { label: 'Film ou série', dictionary: false, kind: 'normal' },
  sport: { label: 'Sport', dictionary: true, kind: 'normal' },
  dish: { label: 'Plat', dictionary: true, kind: 'normal' },
  plant: { label: 'Fleur ou plante', dictionary: true, kind: 'normal' },
  color: { label: 'Couleur', dictionary: true, kind: 'normal' },
  instrument: { label: 'Instrument de musique', dictionary: true, kind: 'normal' },
  bodyPart: { label: 'Partie du corps', dictionary: true, kind: 'normal' },
  clothing: { label: 'Vêtement', dictionary: true, kind: 'normal' },
  videoGame: { label: 'Jeu vidéo', dictionary: false, kind: 'normal' },
  streamer: { label: 'Créateur de contenu', dictionary: false, kind: 'normal' },
  emote: { label: 'Mot de chat Twitch', dictionary: false, kind: 'normal' },
  hobby: { label: 'Loisir', dictionary: true, kind: 'normal' },
  adjective: { label: 'Adjectif', dictionary: true, kind: 'normal' },
  verb: { label: 'Verbe', dictionary: true, kind: 'normal' },
  fictionalCharacter: { label: 'Personnage de fiction', dictionary: false, kind: 'normal' },
  drink: { label: 'Boisson', dictionary: true, kind: 'normal' },
  transport: { label: 'Moyen de transport', dictionary: true, kind: 'normal' },
  medicine: { label: 'Médecine', dictionary: false, kind: 'normal' },
  language: { label: 'Langue', dictionary: false, kind: 'normal' },
  uselessPower: { label: 'Super-pouvoir inutile', dictionary: false, kind: 'odd' },
  lateExcuse: { label: 'Excuse pour être en retard', dictionary: false, kind: 'odd' },
  islandItem: { label: 'Chose à emporter sur une île déserte', dictionary: false, kind: 'odd' },
  spaceshipItem: { label: 'Objet d’un vaisseau spatial', dictionary: false, kind: 'odd' },
  imaginaryJob: { label: 'Métier imaginaire', dictionary: false, kind: 'odd' },
  alienPuzzle: {
    label: 'Chose qu’un extraterrestre ne comprendrait pas',
    dictionary: false,
    kind: 'odd',
  },
  oddGreeting: { label: 'Manière insolite de dire bonjour', dictionary: false, kind: 'odd' },
  uselessInvention: { label: 'Invention inutile', dictionary: false, kind: 'odd' },
  absurdMovie: { label: 'Titre de film improbable', dictionary: false, kind: 'odd' },
} as const satisfies Record<
  string,
  { label: string; dictionary: boolean; kind: BaccalaureatCategoryKind }
>

export type BaccalaureatCategoryKey = keyof typeof BACCALAUREAT_CATEGORIES

/**
 * Catalogue membership
 * @param {string} key - Candidate key
 * @return {boolean} - Known category
 */

export const isBaccalaureatCategory = (key: string): key is BaccalaureatCategoryKey =>
  Object.hasOwn(BACCALAUREAT_CATEGORIES, key)

/**
 * Catalogue keys of a family
 * @param {BaccalaureatCategoryKind} kind - Family
 * @return {BaccalaureatCategoryKey[]} - Keys
 */

export const categoriesOfKind = (kind: BaccalaureatCategoryKind): BaccalaureatCategoryKey[] =>
  (Object.keys(BACCALAUREAT_CATEGORIES) as BaccalaureatCategoryKey[]).filter(
    (key) => BACCALAUREAT_CATEGORIES[key].kind === kind
  )
