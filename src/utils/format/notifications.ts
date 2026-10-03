import type { NotificationKindOption } from '@/declarations/notifications/registries'

/**
 * One notification sentence, cut where its emphasis falls
 * @typedef {Object} NotificationSentence
 * @property {string} before - Words ahead of the emphasised verb
 * @property {string} verb - Emphasised words
 * @property {string} after - Words after it, the full stop included
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
 * @param {string} actor - Who acted, or the stand-in for the system
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
