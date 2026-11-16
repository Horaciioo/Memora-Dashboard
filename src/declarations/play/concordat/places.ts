import { ConcordatTerrains } from '@/utils/constants/concordat'
import type { ConcordatTerrainId } from '@/utils/constants/concordat'

/**
 * Province nouns by dominant terrain
 * @type {Record<ConcordatTerrainId, readonly string[]>}
 */

export const CONCORDAT_PLACE_NOUNS: Record<ConcordatTerrainId, readonly string[]> = {
  [ConcordatTerrains.Sea]: ['Rade'],
  [ConcordatTerrains.Coast]: ['Rade', 'Anse', 'Cap', 'Grève', 'Havre'],
  [ConcordatTerrains.Plain]: ['Plaine', 'Val', 'Marche', 'Lande', 'Champ'],
  [ConcordatTerrains.Forest]: ['Bois', 'Sylve', 'Orée', 'Taillis'],
  [ConcordatTerrains.Hill]: ['Colline', 'Butte', 'Coteau', 'Tertre'],
  [ConcordatTerrains.Mountain]: ['Cime', 'Pic', 'Crête', 'Brèche', 'Massif'],
  [ConcordatTerrains.River]: ['Gué', 'Rive', 'Berge', 'Confluent'],
  [ConcordatTerrains.Desert]: ['Dunes', 'Erg', 'Désert', 'Reg'],
}

/**
 * Province name parts
 * @type {readonly string[]}
 */

export const CONCORDAT_PLACE_NAMES: readonly string[] = [
  'Orme',
  'Cendre',
  'Brume',
  'Aubier',
  'Corbeau',
  'Sablon',
  'Ambre',
  'Givre',
  'Épine',
  'Lierre',
  'Ardoise',
  'Safran',
  'Vigie',
  'Mûre',
  'Écume',
  'Fougère',
  'Tourbe',
  'Argent',
  'Houx',
  'Cuivre',
  'Aurore',
  'Hêtre',
  'Sel',
  'Miel',
  'Braise',
  'Argile',
  'Lune',
  'Loup',
  'Pierre',
  'Rosée',
  'Chardon',
  'Sureau',
  'Granit',
  'Mistral',
  'Ivoire',
  'Frêne',
  'Cerf',
  'Marais',
  'Saule',
  'Zénith',
]
