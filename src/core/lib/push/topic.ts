import { createHash } from 'node:crypto'

import { PUSH_TOPIC_LENGTH } from '@/declarations/pwa/push'

/**
 * Valid push topic
 * @param {string} tag - Push tag
 * @return {string} - Base64url topic
 */

export const pushTopicOf = (tag: string): string =>
  createHash('sha256').update(tag).digest('base64url').slice(0, PUSH_TOPIC_LENGTH)
