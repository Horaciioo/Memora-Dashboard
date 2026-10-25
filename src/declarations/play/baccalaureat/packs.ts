import type { BaccalaureatCategoryKey } from '@/declarations/play/baccalaureat/categories'

/**
 * Category packs offered to the host
 * @type {Record<string, { label: string, categories: BaccalaureatCategoryKey[] }>}
 */

export const BACCALAUREAT_PACKS = {
  classic: {
    label: 'Classique',
    categories: ['firstName', 'country', 'city', 'animal', 'job', 'fruitVegetable'],
  },
  popCulture: {
    label: 'Pop culture',
    categories: ['celebrity', 'movieSeries', 'videoGame', 'brand', 'fictionalCharacter', 'sport'],
  },
  twitch: {
    label: 'Twitch',
    categories: ['streamer', 'emote', 'videoGame', 'hobby', 'adjective', 'verb'],
  },
  flash: {
    label: 'Éclair',
    categories: ['firstName', 'animal', 'city'],
  },
} as const satisfies Record<string, { label: string; categories: BaccalaureatCategoryKey[] }>
