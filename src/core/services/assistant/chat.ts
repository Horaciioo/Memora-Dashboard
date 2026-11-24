import { findTopic, isQuestion, isShort } from '@/core/lib/assistant/chat'
import { varied } from '@/core/lib/assistant/variants'
import { propose, speak } from '@/core/services/assistant/reply'
import { CHAT_FALLBACK } from '@/declarations/assistant/chat'
import { examplesFor } from '@/declarations/assistant/domains'
import { CHAT_SCORES } from '@/declarations/assistant/scoring'
import type { AssistantProposal } from '@/types/assistant'

// Lines of one answer travel as a single wording
const JOIN = '\n'

// First word of a display name
const firstName = (displayName: string): string => displayName.trim().split(/\s+/)[0] ?? ''

/**
 * Answer a sentence no intent claimed, a subject or a kind word
 * @param {string} text - What the member wrote
 * @param {string} pathname - Page on screen
 * @param {string} displayName - Name of the member
 * @return {AssistantProposal} - Talk, or the unknown reply with the page examples
 */

export const chatReply = (
  text: string,
  pathname: string,
  displayName: string
): AssistantProposal => {
  const values = { name: firstName(displayName) }
  const topic = findTopic(text)

  if (topic) {
    const lines = varied(
      `chat:${topic.id}`,
      topic.replies.map((wording) => wording.join(JOIN)),
      values
    ).split(JOIN)

    return speak({
      intent: null,
      lines: lines.map((line, index) => ({
        text: line,
        ...(topic.link && index === lines.length - 1 && { link: topic.link }),
      })),
      replies: (topic.next ?? examplesFor(pathname)).slice(0, CHAT_SCORES.nextShown),
    })
  }

  // Nothing fits: the line says why, the page examples show the way
  const kind = isShort(text) ? 'short' : isQuestion(text) ? 'outside' : 'lost'

  return propose(null, {
    status: 'unknown',
    reply: varied(`chat:${kind}`, CHAT_FALLBACK[kind], values),
    suggestions: examplesFor(pathname),
  })
}
