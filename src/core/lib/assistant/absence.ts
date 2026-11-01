import { isSimilar } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import { ASSISTANT_ABSENCE_MODES } from '@/declarations/assistant/lexicon'
import type { AssistantAbsenceMode } from '@/types/assistant'

// Modes in the order they win
const ORDER = ['delete', 'edit', 'list'] as const

/**
 * Way into the absence talk a sentence asks for
 * @param {AssistantToken[]} tokens - Sentence words
 * @return {AssistantAbsenceMode} - Mode, creation by default
 */

export const readAbsenceMode = (tokens: AssistantToken[]): AssistantAbsenceMode => {
  const found = ORDER.find((mode) =>
    tokens.some((token) =>
      ASSISTANT_ABSENCE_MODES[mode].some((word) => isSimilar(token.folded, word))
    )
  )

  return found ?? 'create'
}
