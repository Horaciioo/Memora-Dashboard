/**
 * Timings of the fake live control
 * @type {Record<string, number>}
 */

export const FAKE_LIVE_SETTINGS = {
  // Longest wait on the fake Twitch
  timeoutMs: 1500,
  // Checks after a start, one every pollMs
  startAttempts: 30,
  startPollMs: 500,
  // Status refresh on the page
  refreshMs: 3000,
} as const

/**
 * Chat paces of the fake live
 * @type {{ id: string, label: string }[]}
 */

export const FAKE_LIVE_PACES = [
  { id: 'calme', label: 'Calme' },
  { id: 'normal', label: 'Normal' },
  { id: 'chaos', label: 'Chaos' },
  { id: 'deluge', label: 'Déluge' },
] as const

/**
 * Console keys of the fake live, as buttons
 * @type {{ key: string, label: string }[]}
 */

export const FAKE_LIVE_KEYS = [
  { key: 'o', label: 'Passer en direct' },
  { key: 'f', label: 'Finir le stream' },
  { key: 's', label: 'Raid de spam' },
  { key: 't', label: 'Message toxique' },
  { key: 'm', label: 'Geste d’un autre modérateur' },
  { key: 'u', label: 'Demande de débannissement' },
] as const

/**
 * Copy of the fake live panel
 * @type {Record<string, string>}
 */

export const FAKE_LIVE_COPY = {
  title: 'Faux live',
  lead: 'Simule un live Twitch complet, rien ne part chez Twitch.',
  idle: 'Aucun faux live ne tourne.',
  running: 'Faux live en cours, rythme {pace}.',
  onAir: 'Le stream est en direct.',
  offAir: 'Le stream n’est pas encore en direct.',
  start: 'Lancer un faux live',
  starting: 'Lancement…',
  stop: 'Arrêter le faux live',
  clear: 'Nettoyer les faux lives',
  cleared: 'Faux lives nettoyés',
  started: 'Faux live lancé',
  stopped: 'Faux live arrêté',
  paceLabel: 'Rythme du chat',
} as const
