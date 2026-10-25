/**
 * Category catalogue of the Baccalaureat
 * @type {Record<string, { label: string }>}
 */

export const BACCALAUREAT_CATEGORIES = {
  firstName: { label: 'Prénom' },
  country: { label: 'Pays' },
  city: { label: 'Ville' },
  animal: { label: 'Animal' },
  job: { label: 'Métier' },
  fruitVegetable: { label: 'Fruit ou légume' },
  object: { label: 'Objet' },
  brand: { label: 'Marque' },
  celebrity: { label: 'Célébrité' },
  movieSeries: { label: 'Film ou série' },
  sport: { label: 'Sport' },
  dish: { label: 'Plat' },
  plant: { label: 'Fleur ou plante' },
  color: { label: 'Couleur' },
  instrument: { label: 'Instrument de musique' },
  bodyPart: { label: 'Partie du corps' },
  clothing: { label: 'Vêtement' },
  videoGame: { label: 'Jeu vidéo' },
  streamer: { label: 'Créateur de contenu' },
  emote: { label: 'Mot de chat Twitch' },
  hobby: { label: 'Loisir' },
  adjective: { label: 'Adjectif' },
  verb: { label: 'Verbe' },
  fictionalCharacter: { label: 'Personnage de fiction' },
} as const satisfies Record<string, { label: string }>

export type BaccalaureatCategoryKey = keyof typeof BACCALAUREAT_CATEGORIES

/**
 * Catalogue membership
 * @param {string} key - Candidate key
 * @return {boolean} - Known category
 */

export const isBaccalaureatCategory = (key: string): key is BaccalaureatCategoryKey =>
  Object.hasOwn(BACCALAUREAT_CATEGORIES, key)
