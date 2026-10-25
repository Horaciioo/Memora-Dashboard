/**
 * Category catalogue of the Baccalaureat
 * @type {Record<string, { label: string, dictionary: boolean }>}
 */

export const BACCALAUREAT_CATEGORIES = {
  firstName: { label: 'Prénom', dictionary: false },
  country: { label: 'Pays', dictionary: false },
  city: { label: 'Ville', dictionary: false },
  animal: { label: 'Animal', dictionary: true },
  job: { label: 'Métier', dictionary: true },
  fruitVegetable: { label: 'Fruit ou légume', dictionary: true },
  object: { label: 'Objet', dictionary: true },
  brand: { label: 'Marque', dictionary: false },
  celebrity: { label: 'Célébrité', dictionary: false },
  movieSeries: { label: 'Film ou série', dictionary: false },
  sport: { label: 'Sport', dictionary: true },
  dish: { label: 'Plat', dictionary: true },
  plant: { label: 'Fleur ou plante', dictionary: true },
  color: { label: 'Couleur', dictionary: true },
  instrument: { label: 'Instrument de musique', dictionary: true },
  bodyPart: { label: 'Partie du corps', dictionary: true },
  clothing: { label: 'Vêtement', dictionary: true },
  videoGame: { label: 'Jeu vidéo', dictionary: false },
  streamer: { label: 'Créateur de contenu', dictionary: false },
  emote: { label: 'Mot de chat Twitch', dictionary: false },
  hobby: { label: 'Loisir', dictionary: true },
  adjective: { label: 'Adjectif', dictionary: true },
  verb: { label: 'Verbe', dictionary: true },
  fictionalCharacter: { label: 'Personnage de fiction', dictionary: false },
} as const satisfies Record<string, { label: string; dictionary: boolean }>

export type BaccalaureatCategoryKey = keyof typeof BACCALAUREAT_CATEGORIES

/**
 * Catalogue membership
 * @param {string} key - Candidate key
 * @return {boolean} - Known category
 */

export const isBaccalaureatCategory = (key: string): key is BaccalaureatCategoryKey =>
  Object.hasOwn(BACCALAUREAT_CATEGORIES, key)
