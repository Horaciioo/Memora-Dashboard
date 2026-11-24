/**
 * Sanction kinds with a colour of their own
 * @type {readonly string[]}
 */

export const SANCTION_COLOUR_KINDS = ['DELETE', 'WARN', 'TIMEOUT', 'BAN'] as const

export type SanctionColourKind = (typeof SANCTION_COLOUR_KINDS)[number]

/**
 * Token each kind paints
 * @type {Record<SanctionColourKind, string>}
 */

export const SANCTION_COLOUR_TOKENS: Record<SanctionColourKind, string> = {
  DELETE: '--color-sanction-delete',
  WARN: '--color-sanction-warn',
  TIMEOUT: '--color-sanction-timeout',
  BAN: '--color-sanction-ban',
}

/**
 * Copy of the sanction colours setting
 * @type {Record<string, string>}
 */

export const SANCTION_COLOUR_COPY = {
  title: 'Couleurs des sanctions',
  lead: 'Choisis la couleur de chaque sanction : fiche d’un viewer, Mod View et Actions de Mod. suivent.',
  none: 'Par défaut',
  note: 'Ces couleurs restent dans ce navigateur.',
} as const
