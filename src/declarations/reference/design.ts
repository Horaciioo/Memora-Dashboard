import type { StorageBucket } from '@/types/storage'

/**
 * Picture kinds of a creator
 * @type {Record<string, string>}
 */

export const DesignKinds = {
  Banner: 'banner',
  Avatar: 'avatar',
  Logo: 'logo',
} as const

export type DesignKindName = (typeof DesignKinds)[keyof typeof DesignKinds]

/**
 * Places a banner can serve
 * @type {Record<string, string>}
 */

export const BannerSlots = {
  Main: 'main',
  StageTwo: 'stage2',
  StageThree: 'stage3',
  StageFour: 'stage4',
  Fade: 'fade',
} as const

export type BannerSlotName = (typeof BannerSlots)[keyof typeof BannerSlots]

/**
 * Banner of each interview part that has its own
 * @type {Record<number, BannerSlotName>}
 */

export const PART_BANNER_SLOTS: Record<number, BannerSlotName> = {
  2: BannerSlots.StageTwo,
  3: BannerSlots.StageThree,
  4: BannerSlots.StageFour,
}

/**
 * Bucket receiving each kind
 * @type {Record<DesignKindName, StorageBucket>}
 */

export const DESIGN_BUCKETS: Record<DesignKindName, StorageBucket> = {
  [DesignKinds.Banner]: 'banners',
  [DesignKinds.Avatar]: 'avatars',
  [DesignKinds.Logo]: 'logos',
}

/**
 * Labels of the Design tab
 * @type {Record<string, string>}
 */

export const DESIGN_COPY = {
  tab: 'Design',
  bannersTitle: 'Galerie d’images',
  avatarTitle: 'Avatar',
  logoTitle: 'Logo',
  addBanner: 'Ajouter une bannière',
  addAvatar: 'Ajouter un avatar',
  addLogo: 'Ajouter un logo',
  replace: 'Modifier',
  remove: 'Supprimer',
  unassign: 'Ne plus l’utiliser',
  unused: 'Non utilisée',
  assignedTo: (place: string) => `Utilisée : ${place}`,
  assignTo: (place: string) => `Utiliser pour ${place}`,
  assigned: 'Utilisation enregistrée.',
  unknownSlot: 'Cet emplacement n’existe pas.',
  slots: {
    [BannerSlots.Main]: 'bannière principale',
    [BannerSlots.StageTwo]: 'partie 2',
    [BannerSlots.StageThree]: 'partie 3',
    [BannerSlots.StageFour]: 'partie 4',
    [BannerSlots.Fade]: 'bannière fondue',
  },
  saved: 'Design enregistré.',
  removed: 'Image retirée.',
  unknownKind: 'Ce type d’image n’existe pas.',
} as const
