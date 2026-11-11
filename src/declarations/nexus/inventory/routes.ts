/**
 * Route families open to any signed-in member, by reason
 * @type {Record<string, string>}
 */

export const OPEN_ROUTE_REASONS: Record<string, string> = {
  assistant: 'Assistant du membre connecté',
  preferences: 'Réglages du membre connecté',
  participations: 'Données du membre connecté',
  'unread-comments': 'Lectures du membre connecté',
  mentions: 'Mentions du membre connecté',
  mentionable: 'Annuaire des mentions',
  'work-comments': 'Commentaires bornés par la ressource',
  search: 'Recherche bornée par les permissions',
  realtime: 'Ticket du membre connecté',
  push: 'Appareils du membre connecté',
  logs: 'Flux borné par les permissions du service',
  access: 'Flux de droits du membre connecté',
  members: 'Réseaux du membre connecté',
  socials: 'Réseaux du membre connecté',
  trainings: 'Parcours du membre connecté',
  pages: 'Pages bornées par leurs partages',
  notifications: 'Notifications du membre connecté',
  dev: 'Outillage local, jamais commité',
}
