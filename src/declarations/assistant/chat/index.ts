import { CARE_TOPICS } from '@/declarations/assistant/chat/care'
import { FUN_TOPICS } from '@/declarations/assistant/chat/fun'
import { PERSONA_TOPICS } from '@/declarations/assistant/chat/persona'
import { SCOPE_TOPICS } from '@/declarations/assistant/chat/scope'
import { SOCIAL_TOPICS } from '@/declarations/assistant/chat/social'
import type { ChatTopic } from '@/declarations/assistant/chat/types'

/**
 * Every subject, a tie goes to the first
 * @type {ChatTopic[]}
 */

export const CHAT_TOPICS: readonly ChatTopic[] = [
  ...CARE_TOPICS,
  ...PERSONA_TOPICS,
  ...FUN_TOPICS,
  ...SCOPE_TOPICS,
  ...SOCIAL_TOPICS,
]

export { CHAT_FALLBACK } from '@/declarations/assistant/chat/fallback'
export type { ChatTopic } from '@/declarations/assistant/chat/types'
