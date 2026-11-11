/**
 * Console wording
 * @type {Record<string, string>}
 */

export const NEXUS_COPY = {
  masked: '[protégé]',
  locked: 'Nexus verrouillé',
  passwordPrompt: 'Mot de passe',
  wrongPassword: 'Mot de passe refusé',
  discordRefused: 'Identité Discord refusée',
  locking: 'Trop d’essais, réessaie plus tard',
  unlocked: 'Session ouverte',
  closed: 'Session fermée',
  writeOff: 'Mode écriture non armé',
  dangerOff: 'Mode danger non armé',
  reauthNeeded: 'Mot de passe à confirmer',
  confirmNeeded: 'Confirmation requise',
  unknownCommand: 'Commande introuvable',
  tooLong: 'Commande trop longue',
  tooManyArguments: 'Trop d’arguments',
  busy: 'Une commande est déjà en cours',
  timedOut: 'Délai dépassé',
  confirmWrong: 'Confirmation refusée',
  forbiddenEnvironment: 'Commande interdite dans cet environnement',
} as const
