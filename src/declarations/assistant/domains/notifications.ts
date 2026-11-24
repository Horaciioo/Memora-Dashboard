import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'

/**
 * Notifications
 * @type {DomainDef}
 */

export const NOTIFICATIONS = defineDomain({
  label: 'Notifications',
  summary: 'Je marque toutes tes notifications comme lues.',
  intents: {
    readNotifications: {
      label: 'Marquer les notifications lues',
      kind: 'act',
      verbs: ['marque', 'marquer', 'passe', 'vide', 'nettoie', 'lis'],
      nouns: ['notification', 'notifications', 'notif', 'notifs'],
      needs: 'both',
      pages: [ROUTES.notifications],
      examples: ['Marque mes notifications comme lues', 'Vide mes notifs'],
    },
  },
})
