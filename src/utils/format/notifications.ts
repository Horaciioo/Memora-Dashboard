import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import type { NotificationKindOption } from '@/declarations/notifications/registries'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import type { NotificationEntry } from '@/types/notifications'

/**
 * One notification sentence
 * @typedef {Object} NotificationSentence
 * @property {string} before - Words ahead of the emphasised verb
 * @property {string} verb - Emphasised words
 * @property {string} after - Words after it
 */

export interface NotificationSentence {
  before: string
  verb: string
  after: string
}

/**
 * Read a notification as a sentence: "<actor> <lead> <verb> <trail>", or, for a kind addressed
 * to the member, its lead alone with the subject worked in
 * @param {NotificationKindOption} kind - Registry entry of the kind
 * @param {string} actor - Who acted
 * @param {string | null} subject - What the act was about
 * @return {NotificationSentence} - Sentence in three parts
 */

export const notificationSentence = (
  kind: NotificationKindOption,
  actor: string,
  subject: string | null
): NotificationSentence => {
  const after = kind.trail ? ` ${kind.trail}.` : '.'

  if (kind.addressed) {
    return { before: `${kind.lead.replace('{subject}', subject ?? '')} `, verb: kind.verb, after }
  }

  return { before: `${actor} ${kind.lead} `, verb: kind.verb, after }
}

/**
 * Read a notification as one plain sentence
 * @param {NotificationEntry} entry - Notification
 * @return {string | null} - Sentence or nothing for an unknown kind
 */

export const notificationText = (entry: NotificationEntry): string | null => {
  const kind = entry.kind ? NOTIFICATION_KIND_REGISTRY.get(entry.kind) : null
  if (!kind) return null

  const { before, verb, after } = notificationSentence(
    kind,
    entry.actorName ?? NOTIFICATION_COPY.system,
    entry.subject
  )

  return `${before}${verb}${after}`
}

/**
 * Page a notification leads to
 * @param {Pick<NotificationEntry, 'target' | 'targetId'>} entry - Notification
 * @return {string | null} - Destination or nothing
 */

export const notificationHref = (
  entry: Pick<NotificationEntry, 'target' | 'targetId'>
): string | null =>
  entry.target ? (NOTIFICATION_TARGETS.get(entry.target).route(entry.targetId) ?? null) : null
