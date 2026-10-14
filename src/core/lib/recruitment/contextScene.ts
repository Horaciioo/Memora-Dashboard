import { nameColour } from '@/declarations/academy/chat'
import type { ChatLine } from '@/declarations/academy/curriculum/types'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { author, discordStage, message, say, timeline } from '@/declarations/replicas/discordKit'
import type { Beat } from '@/declarations/replicas/discordKit'
import type { ContextLine, WrittenContext } from '@/declarations/recruitment/questionnaire'
import type { DiscordAuthor, DiscordReplicaState, DiscordSceneStep } from '@/types/replicas'

// Share of a line spent typing
const TYPING_SHARE = 0.6

// Clock of the first message
const FIRST_MINUTE = 21 * 60 + 30

// Channel the scene plays in
const CHANNEL = 'général'

// Server categories around it
const CATEGORY = 'Textuel'

/**
 * Clock text of a message
 * @param {number} index - Position in the scene
 * @return {string} - HH:MM
 */

const clockOf = (index: number): string => {
  const minutes = FIRST_MINUTE + index
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

/**
 * Chat lines of a context for a Twitch chat
 * @param {WrittenContext} context - Context played
 * @return {ChatLine[]} - Lines in order
 */

export const twitchLines = (context: WrittenContext): ChatLine[] =>
  context.lines.map((line) => ({ author: line.author, text: line.text, role: line.role }))

/**
 * Discord scene of a context, every line typed then posted
 * @param {WrittenContext} context - Context played
 * @param {string} server - Server name shown
 * @return {{ initial: DiscordReplicaState, steps: DiscordSceneStep[] }} - Scene
 */

export const discordScene = (
  context: WrittenContext,
  server: string
): { initial: DiscordReplicaState; steps: DiscordSceneStep[] } => {
  const authors = new Map<string, DiscordAuthor>(
    context.lines.map((line: ContextLine) => [
      line.author,
      author(line.author, { name: line.author, colour: nameColour(line.author) }),
    ])
  )
  const typing = Math.round(EXERCISE_SETTINGS.sceneLineMs * TYPING_SHARE)
  const before = EXERCISE_SETTINGS.sceneLineMs - typing

  const beats: Beat[] = context.lines.flatMap((line, index) =>
    say(message(`${context.key}-${index}`, authors.get(line.author)!, clockOf(index), line.text), {
      before,
      typing,
    })
  )

  const initial = discordStage({
    server,
    channel: CHANNEL,
    categories: [
      {
        name: CATEGORY,
        channels: [
          { name: CHANNEL, kind: 'text' },
          { name: 'règlement', kind: 'rules' },
        ],
      },
    ],
    memberGroups: [{ role: 'Membres', members: [...authors.values()] }],
  })

  return { initial, steps: timeline(beats) }
}
