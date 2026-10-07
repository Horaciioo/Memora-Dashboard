import type { ConversationRole, CourseTone } from '@/declarations/academy/curriculum/types'

/**
 * Name and colour of each speaker
 * @type {Record<ConversationRole, { label: string, tone: CourseTone }>}
 */

export const CONVERSATION_ROLES: Record<ConversationRole, { label: string; tone: CourseTone }> = {
  coordinator: { label: 'Coordinateur', tone: 'info' },
  responsable: { label: 'Responsable', tone: 'caution' },
  admin: { label: 'Jérémy', tone: 'danger' },
  moderator: { label: 'Modérateurs', tone: 'success' },
}
