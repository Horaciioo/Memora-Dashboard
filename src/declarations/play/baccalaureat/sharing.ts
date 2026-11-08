/**
 * Points rule for a word written twice
 * @type {Record<string, { label: string, note: string, share: number }>}
 */

export const BACCALAUREAT_SHARING = {
  half: { label: 'Moitié', note: 'Les points sont divisés par deux.', share: 0.5 },
  full: { label: 'Pleins points', note: 'Chacun garde tous les points.', share: 1 },
  none: { label: 'Aucun point', note: 'Un mot copié ne rapporte rien.', share: 0 },
} as const

export type BaccalaureatSharingKey = keyof typeof BACCALAUREAT_SHARING

/**
 * Sharing rule membership
 * @param {string} key - Candidate key
 * @return {boolean} - Known rule
 */

export const isSharingKey = (key: unknown): key is BaccalaureatSharingKey =>
  typeof key === 'string' && Object.hasOwn(BACCALAUREAT_SHARING, key)
