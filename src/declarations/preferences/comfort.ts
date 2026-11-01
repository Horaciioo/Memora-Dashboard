import type { IconName } from '@/declarations/ui/icons'

/**
 * One interface setting kept in this browser
 * @typedef {Object} ComfortSetting
 * @property {string} label - Name of the setting
 * @property {string} description - Line under its name
 * @property {IconName} icon - Glyph of the setting
 * @property {string} default - Value that leaves the page untouched
 * @property {Record<string, string>} options - Label of each value
 */

interface ComfortSetting {
  label: string
  description: string
  icon: IconName
  default: string
  options: Record<string, string>
}

/**
 * Interface settings, each projected on the page as a data attribute
 * @type {Record<string, ComfortSetting>}
 */

export const COMFORT_SETTINGS = {
  frame: {
    label: 'Fond du cadre',
    description: 'Le dégradé qui entoure l’application, ou un fond uni plus calme.',
    icon: 'spark',
    default: 'aurora',
    options: { aurora: 'Aurore', calm: 'Calme' },
  },
  glass: {
    label: 'Cartes',
    description: 'Du verre épais qui laisse passer le fond, ou des cartes pleines.',
    icon: 'sheet',
    default: 'glass',
    options: { glass: 'Verre', solid: 'Pleines' },
  },
  radius: {
    label: 'Arrondis',
    description: 'La rondeur des cartes, des champs et des volets.',
    icon: 'platform',
    default: 'soft',
    options: { sharp: 'Nets', soft: 'Doux', round: 'Ronds' },
  },
  leading: {
    label: 'Interligne',
    description: 'L’espace entre les lignes des textes longs.',
    icon: 'paragraph',
    default: 'normal',
    options: { normal: 'Normal', relaxed: 'Aéré' },
  },
  links: {
    label: 'Liens soulignés',
    description: 'Souligne les liens dans les textes pour les repérer sans la couleur.',
    icon: 'link',
    default: 'plain',
    options: { plain: 'Discrets', underlined: 'Soulignés' },
  },
  motion: {
    label: 'Animations',
    description: 'Réduis les mouvements si les transitions te fatiguent.',
    icon: 'flash',
    default: 'full',
    options: { full: 'Complètes', reduced: 'Réduites' },
  },
  focus: {
    label: 'Repère du clavier',
    description: 'Un anneau plus épais autour de l’élément sélectionné au clavier.',
    icon: 'visible',
    default: 'standard',
    options: { standard: 'Standard', strong: 'Renforcé' },
  },
} as const satisfies Record<string, ComfortSetting>

export type ComfortKey = keyof typeof COMFORT_SETTINGS

export type ComfortValues = {
  [Key in ComfortKey]: keyof (typeof COMFORT_SETTINGS)[Key]['options']
}

/**
 * Settings of each group of the tabs
 * @type {Record<string, ComfortKey[]>}
 */

export const COMFORT_GROUPS = {
  appearance: ['frame', 'glass', 'radius'],
  reading: ['leading', 'links'],
  accessibility: ['motion', 'focus'],
} as const satisfies Record<string, readonly ComfortKey[]>

/**
 * Value of every setting before the member chooses
 * @type {ComfortValues}
 */

export const COMFORT_DEFAULTS = Object.fromEntries(
  Object.entries(COMFORT_SETTINGS).map(([key, setting]) => [key, setting.default])
) as ComfortValues

/**
 * Keep a stored value only when its setting still declares it
 * @param {ComfortKey} key - Setting
 * @param {unknown} value - Stored value
 * @return {boolean} - Declared value
 */

export const isComfortValue = (key: ComfortKey, value: unknown): boolean =>
  typeof value === 'string' && value in COMFORT_SETTINGS[key].options
