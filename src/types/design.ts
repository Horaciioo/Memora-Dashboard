import type { BannerSlotName } from '@/declarations/reference/design'

/**
 * Banner kept in the bank of a creator
 * @typedef {Object} DesignBanner
 * @property {string} id - Banner identifier
 * @property {string} url - Stored picture route
 * @property {BannerSlotName | null} slot - Place using it
 */

export interface DesignBanner {
  id: string
  url: string
  slot: BannerSlotName | null
}

/**
 * Pictures of one creator
 * @typedef {Object} CreatorDesign
 * @property {DesignBanner[]} banners - Bank of banners, first one leading
 * @property {string | null} avatarUrl - Round portrait
 * @property {string | null} logoUrl - Small mark
 */

export interface CreatorDesign {
  banners: DesignBanner[]
  avatarUrl: string | null
  logoUrl: string | null
}
