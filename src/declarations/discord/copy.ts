/**
 * Copy of the Discord identifier base
 * @type {Record<string, string>}
 */

export const DISCORD_ID_COPY = {
  discordId: 'Identifiant Discord',
  discordIdHint:
    'Le numéro à 17-20 chiffres, clic droit sur Discord puis « Copier l’identifiant ».',
  kind: 'Type',
  name: 'Nom',
  creator: 'YouTubeur',
  creatorHint: 'Pour un rôle ou un salon propre à un créateur.',
  invalid: 'Un identifiant Discord compte 17 à 20 chiffres.',
  creatorBadge: 'Créateur',
  search: 'Chercher un nom ou un numéro…',
  all: 'Tout',
  filterLabel: 'Type d’identifiant',
  noMatch: 'Aucun identifiant ne correspond à ta recherche.',
} as const

/**
 * Longest and shortest snowflake
 * @type {{ min: number, max: number }}
 */

export const SNOWFLAKE_LENGTH = { min: 17, max: 20 } as const
