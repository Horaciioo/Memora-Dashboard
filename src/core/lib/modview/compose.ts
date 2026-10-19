import { CHAT_COMMANDS, findChatCommand } from '@/declarations/modview/commands'
import type { ChatCommandOption } from '@/declarations/modview/commands'
import type { ChatMessage, Chatter } from '@/types/modview'

// Names offered under the cursor
const MAX_MENTIONS = 8

/**
 * Who spoke last, newest first, each once
 * @param {ChatMessage[]} messages - Chat lines
 * @return {Chatter[]} - Chatters
 */

export const recentChatters = (messages: ChatMessage[]): Chatter[] => {
  const seen = new Set<string>()
  const chatters: Chatter[] = []

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const author = messages[index]?.author
    if (!author || seen.has(author.id)) continue
    seen.add(author.id)
    chatters.push(author)
  }

  return chatters
}

/**
 * Word being typed at the end of the line, when it is a name
 * @param {string} draft - Line typed
 * @return {{ start: number, query: string, isMention: boolean } | null} - Word and where it starts
 */

export const nameBeingTyped = (
  draft: string
): { start: number; query: string; isMention: boolean } | null => {
  const start = draft.search(/\S*$/)
  const word = draft.slice(start)

  if (word.startsWith('@')) return { start, query: word.slice(1), isMention: true }

  // The viewer of a command, right after its name
  const tokens = draft.trimStart().split(/\s+/)
  const command = tokens[0] ?? ''
  const option = command.startsWith('/') ? findChatCommand(command.slice(1)) : null
  const aimsAtViewer = option && ['warn', 'timeout', 'ban', 'unban'].includes(option.name)
  if (aimsAtViewer && tokens.length === 2 && !/\s$/.test(draft)) {
    return { start, query: word, isMention: false }
  }

  return null
}

/**
 * Chatters that fit a typed name, the latest speakers first
 * @param {Chatter[]} chatters - Chatters, latest speakers first
 * @param {string} query - Letters typed
 * @return {Chatter[]} - Matches
 */

export const matchChatters = (chatters: Chatter[], query: string): Chatter[] => {
  const wanted = query.toLowerCase()

  return chatters
    .filter(
      (chatter) => chatter.login.includes(wanted) || chatter.name.toLowerCase().startsWith(wanted)
    )
    .slice(0, MAX_MENTIONS)
}

/**
 * Put a chosen name where the word was typed
 * @param {string} draft - Line typed
 * @param {{ start: number, isMention: boolean }} word - Word replaced
 * @param {Chatter} chatter - Chosen chatter
 * @return {string} - New line
 */

export const insertName = (
  draft: string,
  word: { start: number; isMention: boolean },
  chatter: Chatter
): string => `${draft.slice(0, word.start)}${word.isMention ? '@' : ''}${chatter.login} `

/**
 * Commands that fit what follows the slash, while no space was typed
 * @param {string} draft - Line typed
 * @return {ChatCommandOption[] | null} - Commands, none when the line is no command start
 */

export const commandsTyped = (draft: string): ChatCommandOption[] | null => {
  if (!draft.startsWith('/') || /\s/.test(draft)) return null
  const wanted = draft.slice(1).toLowerCase()

  return CHAT_COMMANDS.filter(
    (entry) =>
      entry.name.startsWith(wanted) || entry.aliases.some((alias) => alias.startsWith(wanted))
  )
}
