/**
 * Symbols of the Echo deck, the position is the symbol id
 * @type {{ key: string, label: string }[]}
 */

export const ECHO_SYMBOLS = [
  { key: 'hammer', label: 'Marteau' },
  { key: 'shield', label: 'Bouclier' },
  { key: 'crown', label: 'Couronne' },
  { key: 'megaphone', label: 'Mégaphone' },
  { key: 'heart', label: 'Cœur' },
  { key: 'star', label: 'Étoile' },
  { key: 'clock', label: 'Horloge' },
  { key: 'flag', label: 'Drapeau' },
  { key: 'bell', label: 'Cloche' },
  { key: 'key', label: 'Clé' },
  { key: 'lock', label: 'Cadenas' },
  { key: 'eye', label: 'Œil' },
  { key: 'chat', label: 'Bulle' },
  { key: 'ghost', label: 'Fantôme' },
  { key: 'skull', label: 'Crâne' },
  { key: 'bolt', label: 'Éclair' },
  { key: 'flame', label: 'Flamme' },
  { key: 'moon', label: 'Lune' },
  { key: 'sun', label: 'Soleil' },
  { key: 'cloud', label: 'Nuage' },
  { key: 'gem', label: 'Gemme' },
  { key: 'magnifier', label: 'Loupe' },
  { key: 'trophy', label: 'Trophée' },
  { key: 'gamepad', label: 'Manette' },
  { key: 'play', label: 'Lecture' },
  { key: 'headset', label: 'Casque' },
  { key: 'ban', label: 'Interdit' },
  { key: 'warning', label: 'Alerte' },
  { key: 'check', label: 'Validé' },
  { key: 'coffee', label: 'Café' },
  { key: 'calendar', label: 'Agenda' },
] as const

export type EchoSymbolKey = (typeof ECHO_SYMBOLS)[number]['key']
