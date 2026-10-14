import { measureSeed } from '@/declarations/sanctions/measures'
import type { SanctionOffenseSeed, SanctionRungSeed } from '@/declarations/sanctions/template'
import type { SanctionGravityName } from '@/utils/constants/moderation'

// Where the offence is committed
const SCOPES = {
  global: 'Tous les salons',
  text: 'Salons textuels',
  voice: 'Salons vocaux',
  direct: 'Messages privés',
} as const

type Scope = keyof typeof SCOPES

// Short codes of the measures
const MEASURES = {
  note: 'Commentaire',
  warn: 'Avertissement',
  mute30m: 'Mute : 30 minutes',
  mute2h: 'Mute : 2 heures',
  mute4h: 'Mute : 4 heures',
  mute12h: 'Mute : 12 heures',
  mute7d: 'Mute : 7 jours',
  kick: 'Expulsion',
  ban7d: 'Ban : 7 jours',
  ban30d: 'Ban : 30 jours',
  ban1y: 'Ban : 1 an',
  ban: 'Bannissement définitif',
} as const

type Code = keyof typeof MEASURES

// Weight past which a first measure is no longer light
const MEDIUM_FROM = 55

// Weight past which it is heavy
const HIGH_FROM = 92

/**
 * One row of the Discord panel
 * @typedef {Object} DiscordRow
 * @property {string} name - Offence
 * @property {Scope} scope - Where it happens
 * @property {boolean} reminder - A reminder comes first
 * @property {Code} first - First measure
 * @property {Code | null} relapse - Measure on relapse
 */

type DiscordRow = [name: string, scope: Scope, reminder: boolean, first: Code, relapse: Code | null]

// Reference table of the server rules
const ROWS: readonly DiscordRow[] = [
  ['Profil inapproprié', 'global', true, 'ban30d', 'ban1y'],
  ['Spam de connexion/déconnexion', 'voice', false, 'ban7d', 'ban30d'],
  ['Pornographie, drogue, pédophilie', 'direct', false, 'note', 'ban30d'],
  ['Enregistrement vocal à son insu', 'voice', true, 'ban1y', 'ban'],
  ['Modificateur de voix', 'voice', true, 'mute12h', 'mute7d'],
  ['Spoil', 'global', true, 'warn', 'mute12h'],
  ['Propos inappropriés', 'global', true, 'warn', 'mute4h'],
  ['Mauvais usage de salon', 'text', true, 'mute30m', 'mute4h'],
  ['Spam', 'text', true, 'mute2h', 'mute12h'],
  ['Troll en groupe', 'global', true, 'ban30d', 'ban'],
  ['Ticket inutile', 'text', true, 'ban7d', 'ban30d'],
  ['Ghost mentions', 'text', true, 'mute12h', 'ban7d'],
  ['Diffamation', 'global', false, 'ban30d', 'ban1y'],
  ['Fake news', 'global', true, 'warn', 'mute12h'],
  ['Démarchage', 'global', true, 'warn', 'mute12h'],
  ['Soundboard', 'voice', true, 'mute12h', 'mute7d'],
  ['Cris / Bruits nuisibles', 'voice', true, 'mute12h', 'mute7d'],
  ['Pédophilie', 'global', false, 'ban', null],
  ['Raid', 'text', false, 'ban', null],
  ['Blagues déplacées', 'global', true, 'ban30d', 'ban'],
  ['Menaces', 'global', false, 'mute7d', 'ban30d'],
  ['Flood', 'text', true, 'warn', 'mute2h'],
  ['Dox', 'direct', false, 'note', 'ban30d'],
  ['Scam (non volontaire)', 'text', false, 'kick', 'ban30d'],
  ['Contenus NSFW', 'global', false, 'ban1y', 'ban'],
  ['Divulgation d’informations sensibles', 'global', false, 'ban', null],
  ['Troll', 'global', true, 'mute12h', 'ban30d'],
  ['Scam (volontaire)', 'global', false, 'ban30d', 'ban'],
  ['Publicité en message privé', 'direct', false, 'note', 'note'],
  ['Underage, client modifié, selfbot, gif crash', 'text', false, 'ban30d', 'ban30d'],
  ['Revente de nitro', 'global', false, 'ban1y', 'ban'],
  ['Contournement de sanctions', 'global', false, 'ban30d', 'ban'],
  ['Contestation de sanction', 'text', true, 'ban7d', 'ban30d'],
  ['Spam mentions', 'text', true, 'mute12h', 'mute7d'],
  ['Usurpation d’identité', 'global', false, 'kick', 'ban30d'],
  ['Racisme, homophobie, sexisme, nazisme, misogynie', 'global', false, 'ban1y', 'ban'],
  ['Lien dangereux (volontaire)', 'direct', false, 'note', 'ban30d'],
]

/**
 * Gravity read from the first measure
 * @param {Code} first - First measure
 * @return {SanctionGravityName} - Gravity
 */

const gravityOf = (first: Code): SanctionGravityName => {
  const weight = measureSeed(MEASURES[first])?.weight ?? 0

  if (weight >= HIGH_FROM) return 'HIGH'

  return weight >= MEDIUM_FROM ? 'MEDIUM' : 'LOW'
}

/**
 * Offence of the server panel
 * @param {DiscordRow} row - Table row
 * @return {SanctionOffenseSeed} - Offence
 */

const toOffense = ([name, scope, reminder, first, relapse]: DiscordRow): SanctionOffenseSeed => {
  const ladder: SanctionRungSeed[] = [
    {
      condition: reminder ? 'Après rappel à l’ordre' : 'Dès constaté',
      measures: [MEASURES[first]],
    },
    ...(relapse ? [{ condition: 'Si récidive', measures: [MEASURES[relapse]] }] : []),
  ]
  const level = { gravity: gravityOf(first), ladder }

  return {
    name,
    summary: `${SCOPES[scope]}.${reminder ? ' Un rappel à l’ordre précède toute sanction.' : ''}`,
    examples: [],
    tolerated: [],
    warningExample: null,
    // The server has no livecon, one ladder serves every level
    levels: { 1: level, 2: level, 3: level },
  }
}

/**
 * Reference Discord panel
 * @type {readonly SanctionOffenseSeed[]}
 */

export const DISCORD_PANEL: readonly SanctionOffenseSeed[] = ROWS.map(toOffense)
