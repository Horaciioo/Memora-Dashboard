import { defineDomain } from '@/declarations/assistant/domains/types'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Logs
 * @type {DomainDef}
 */

export const LOGS = defineDomain({
  label: 'Logs',
  summary: 'Je filtre les logs par niveau, période ou auteur.',
  intents: {
    filterLogs: {
      label: 'Filtrer les logs',
      kind: 'read',
      nouns: ['log', 'logs', 'journal', 'journaux', 'erreur', 'erreurs'],
      needs: 'noun',
      permission: Permissions.AccessManage,
      examples: ['Erreurs d’hier dans les logs', 'Logs de la semaine'],
    },
  },
})
