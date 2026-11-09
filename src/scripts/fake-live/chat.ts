import { banUser, deleteMessage, holdMessage, postMessage, warnUser } from './effects.ts'
import { goOffline, goOnline, openUnbanRequest, resolveHeld } from './channelEffects.ts'
import { isWatched } from './eventsub.ts'
import {
  BOT_LINES,
  CHAT_LINES,
  EMOTE_LINES,
  GREETING_LINES,
  SPAM_LINE,
  TEAM_REASONS,
  TOXIC_LINES,
  UNBAN_LINES,
} from './identities.ts'
import type { FakeUser } from './identities.ts'
import {
  allChannels,
  allViewers,
  isModerator,
  isSilenced,
  teamModerators,
  userByLogin,
} from './world.ts'
import type { Channel } from './world.ts'

/**
 * Pace of the fake chat
 * @typedef {Object} ChatPace
 */

export interface ChatPace {
  messageMs: number
  toxicRatio: number
  teamActionSeconds: number
  unbanRequestSeconds: number
  // Hype burst of emotes
  burstSeconds: number
  // A held line the team settles
  resolveSeconds: number
  // Spam wave
  raidSeconds: number
  // Lines written per beat
  linesPerBeat: number
  // Lines of a spam wave
  raidLines: number
}

// Lines of a usual spam wave
const RAID_LINES = 15

/**
 * Paces offered on the command line
 * @type {Record<string, ChatPace>}
 */

export const CHAT_PACES: Record<string, ChatPace> = {
  calme: {
    messageMs: 2200,
    toxicRatio: 0.04,
    teamActionSeconds: 60,
    unbanRequestSeconds: 300,
    burstSeconds: 150,
    resolveSeconds: 45,
    raidSeconds: 420,
    linesPerBeat: 1,
    raidLines: RAID_LINES,
  },
  normal: {
    messageMs: 900,
    toxicRatio: 0.07,
    teamActionSeconds: 25,
    unbanRequestSeconds: 150,
    burstSeconds: 75,
    resolveSeconds: 25,
    raidSeconds: 240,
    linesPerBeat: 1,
    raidLines: RAID_LINES,
  },
  chaos: {
    messageMs: 280,
    toxicRatio: 0.16,
    teamActionSeconds: 10,
    unbanRequestSeconds: 45,
    burstSeconds: 30,
    resolveSeconds: 12,
    raidSeconds: 90,
    linesPerBeat: 1,
    raidLines: RAID_LINES,
  },
  // Chat of a channel past 100K viewers
  deluge: {
    messageMs: 25,
    toxicRatio: 0.1,
    teamActionSeconds: 2,
    unbanRequestSeconds: 20,
    burstSeconds: 15,
    resolveSeconds: 3,
    raidSeconds: 20,
    linesPerBeat: 12,
    raidLines: 400,
  },
}

/**
 * Moods the chat moves through, each slows or speeds the beat
 * @type {{ factor: number, minSeconds: number, maxSeconds: number }[]}
 */

const MOODS = [
  { factor: 1.8, minSeconds: 30, maxSeconds: 80 },
  { factor: 1, minSeconds: 50, maxSeconds: 140 },
  { factor: 0.35, minSeconds: 12, maxSeconds: 35 },
]

// Regulars speak most of the time
const REGULARS = 60
const REGULAR_SHARE = 0.7

// Pick one element
const pick = <T>(list: T[]): T | undefined => list[Math.floor(Math.random() * list.length)]

// Chance helper
const chance = (ratio: number): boolean => Math.random() < ratio

// Random between two bounds
const between = (min: number, max: number): number => min + Math.random() * (max - min)

// Chatters already heard on a channel
const heard = new Set<string>()

/**
 * Viewer allowed to speak now, regulars first
 * @param {Channel} channel - Channel
 * @return {FakeUser | null} - Viewer
 */

const speaker = (channel: Channel): FakeUser | null => {
  const everyone = allViewers().filter(
    (viewer) =>
      !isSilenced(channel, viewer.id) &&
      (!channel.settings.subscribers || viewer.badges.includes('subscriber'))
  )
  const regulars = everyone.slice(0, REGULARS)

  return (chance(REGULAR_SHARE) ? pick(regulars) : pick(everyone)) ?? pick(everyone) ?? null
}

/**
 * Text a viewer writes
 * @param {Channel} channel - Channel
 * @param {FakeUser} author - Author
 * @return {string} - Text
 */

const lineFor = (channel: Channel, author: FakeUser): string => {
  if (channel.settings.emotes) return pick(EMOTE_LINES) ?? 'GG'

  // A newcomer says hello first
  if (!heard.has(`${channel.broadcaster.id}:${author.id}`)) return pick(GREETING_LINES) ?? 'salut'

  return (chance(0.2) ? pick(EMOTE_LINES) : pick(CHAT_LINES)) ?? 'GG'
}

/**
 * Blocked term found in a text
 * @param {Channel} channel - Channel
 * @param {string} text - Text
 * @return {[string, string] | null} - Term identifier and text
 */

const blockedTermIn = (channel: Channel, text: string): [string, string] | null =>
  [...channel.terms].find(([, term]) => text.toLowerCase().includes(term)) ?? null

/**
 * Write one line, AutoMod first
 * @param {Channel} channel - Channel
 * @param {FakeUser} author - Author
 * @param {string} text - Text
 * @return {void}
 */

export const speak = (channel: Channel, author: FakeUser, text: string): void => {
  const term = blockedTermIn(channel, text)
  if (term) {
    holdMessage(channel, author, { text, category: 'blocked_term', flagged: term[1] }, term[0])
    return
  }

  heard.add(`${channel.broadcaster.id}:${author.id}`)
  postMessage(channel, author, text)
}

/**
 * One beat of a channel's chat
 * @param {Channel} channel - Channel
 * @param {ChatPace} pace - Pace
 * @return {void}
 */

const chatBeat = (channel: Channel, pace: ChatPace): void => {
  const author = speaker(channel)
  if (!author) return

  const toxic = chance(pace.toxicRatio) ? pick(TOXIC_LINES) : undefined
  if (toxic) holdMessage(channel, author, toxic)
  else speak(channel, author, lineFor(channel, author))

  // Audience drifts
  channel.viewers = Math.max(50, channel.viewers + Math.round((Math.random() - 0.46) * 24))
}

/**
 * A wave of emotes the chat sends together
 * @param {Channel} channel - Channel
 * @return {void}
 */

export const hypeBurst = (channel: Channel): void => {
  const count = Math.round(between(10, 22))
  let delay = 0
  for (let index = 0; index < count; index += 1) {
    delay += between(80, 380)
    setTimeout(() => {
      const author = speaker(channel)
      if (author && channel.stream) speak(channel, author, pick(EMOTE_LINES) ?? 'KEKW')
    }, delay)
  }
}

/**
 * The channel bot posts a reminder
 * @param {Channel} channel - Channel
 * @return {void}
 */

const botLine = (channel: Channel): void => {
  const bot = userByLogin('nightbot')
  postMessage(channel, bot, pick(BOT_LINES) ?? '')
}

/**
 * A teammate settles the oldest held line
 * @param {Channel} channel - Channel
 * @return {string | null} - What happened
 */

export const settleHeld = (channel: Channel): string | null => {
  const moderator = pick(teamModerators())
  const held = [...channel.held.values()].sort((left, right) => left.at - right.at)[0]
  if (!moderator || !held) return null

  const approve = chance(0.3)
  resolveHeld(channel, moderator, { messageId: held.id, approve })

  return `${moderator.name} ${approve ? 'autorise' : 'refuse'} le message de ${held.author.name}`
}

/**
 * A teammate acts on the chat
 * @param {Channel} channel - Channel
 * @return {string | null} - What happened
 */

export const teamAction = (channel: Channel): string | null => {
  const moderator = pick(teamModerators())
  const recent = channel.messages.filter((message) => !isModerator(message.author.id)).slice(-30)
  const message = pick(recent)
  if (!moderator || !message) return null

  const reason = pick(TEAM_REASONS) ?? 'Spam'
  const roll = Math.random()

  // Mostly deletes and timeouts, now and then a warning or a ban
  if (roll < 0.35) {
    deleteMessage(channel, moderator, message.id)

    return `${moderator.name} supprime un message de ${message.author.name}`
  }
  if (roll < 0.7) {
    const seconds = pick([60, 300, 600, 1800]) ?? 60
    banUser(channel, moderator, message.author, { seconds, reason })

    return `${moderator.name} met ${message.author.name} en timeout ${seconds} s`
  }
  if (roll < 0.9) {
    warnUser(channel, moderator, message.author, reason)

    return `${moderator.name} avertit ${message.author.name}`
  }
  banUser(channel, moderator, message.author, { seconds: null, reason })

  return `${moderator.name} bannit ${message.author.name}`
}

/**
 * Burst of the same spam line
 * @param {Channel} channel - Channel
 * @return {void}
 */

export const spamRaid = (channel: Channel, lines: number = RAID_LINES): void => {
  const spammers = allViewers().slice(-5)
  for (let index = 0; index < lines; index += 1) {
    const author = spammers[index % spammers.length]
    if (author && !isSilenced(channel, author.id)) speak(channel, author, SPAM_LINE)
  }
}

/**
 * A banned viewer asks to come back
 * @param {Channel} channel - Channel
 * @return {string | null} - Who asked
 */

export const unbanRequest = (channel: Channel): string | null => {
  const banned = allViewers().filter((viewer) => channel.bans.get(viewer.id) === null)
  const author = pick(banned)
  if (!author) return null

  openUnbanRequest(channel, author, pick(UNBAN_LINES) ?? 'débannissez moi')

  return author.name
}

/**
 * Start the fake activity
 * @param {Object} input - Settings
 * @param {ChatPace} input.pace - Pace
 * @param {number} input.durationMinutes - Air time before the end, zero never ends
 * @param {(line: string) => void} input.onLog - Log line
 * @return {() => void} - Stop function
 */

export const startChat = (input: {
  pace: ChatPace
  durationMinutes: number
  onLog: (line: string) => void
}): (() => void) => {
  const onAir = () =>
    allChannels().filter((channel) => channel.stream && isWatched(channel.broadcaster.id))
  const safely = (run: () => void) => {
    try {
      run()
    } catch (error) {
      input.onLog(`refusé : ${error instanceof Error ? error.message : 'erreur'}`)
    }
  }
  const every = (seconds: number, run: (channel: Channel) => string | null | void) =>
    setInterval(
      () =>
        onAir().forEach((channel) =>
          safely(() => {
            const line = run(channel)
            if (line) input.onLog(line)
          })
        ),
      seconds * 1000
    )

  // The chat beats at a living pace, mood by mood
  let isStopped = false
  let mood = MOODS[1]!
  let moodUntil = 0
  let beatTimer: ReturnType<typeof setTimeout> | null = null

  const beat = () => {
    if (isStopped) return
    if (Date.now() > moodUntil) {
      mood = pick(MOODS) ?? MOODS[1]!
      moodUntil = Date.now() + between(mood.minSeconds, mood.maxSeconds) * 1000
    }
    onAir().forEach((channel) => {
      for (let line = 0; line < input.pace.linesPerBeat; line += 1) {
        safely(() => chatBeat(channel, input.pace))
      }
      if (chance(0.25)) safely(() => chatBeat(channel, input.pace))
    })
    beatTimer = setTimeout(beat, input.pace.messageMs * mood.factor * between(0.4, 1.6))
  }
  beat()

  const timers = [
    every(input.pace.teamActionSeconds, (channel) => teamAction(channel)),
    every(input.pace.resolveSeconds, (channel) => settleHeld(channel)),
    every(input.pace.unbanRequestSeconds, (channel) => {
      const who = unbanRequest(channel)

      return who ? `demande de débannissement de ${who}` : null
    }),
    every(input.pace.burstSeconds, (channel) => {
      hypeBurst(channel)

      return 'vague d’emotes dans le chat'
    }),
    every(input.pace.raidSeconds, (channel) => {
      spamRaid(channel, input.pace.raidLines)

      return 'vague de spam'
    }),
    every(95, (channel) => {
      botLine(channel)
    }),
    // Automatic end of the stream
    setInterval(() => {
      // Zero never ends it
      if (input.durationMinutes <= 0) return
      for (const channel of onAir()) {
        const startedAt = Date.parse(channel.stream?.startedAt ?? '')
        if (Date.now() - startedAt < input.durationMinutes * 60_000) continue
        if (goOffline(channel))
          input.onLog(`fin automatique du stream de ${channel.broadcaster.name}`)
      }
    }, 5000),
  ]

  return () => {
    isStopped = true
    if (beatTimer) clearTimeout(beatTimer)
    timers.forEach(clearInterval)
  }
}

/**
 * Put a watched channel on air after a delay
 * @param {Channel} channel - Channel
 * @param {number} delaySeconds - Delay
 * @param {(line: string) => void} onLog - Log line
 * @return {void}
 */

export const scheduleOnline = (
  channel: Channel,
  delaySeconds: number,
  onLog: (line: string) => void
): void => {
  setTimeout(() => {
    if (goOnline(channel)) onLog(`${channel.broadcaster.name} passe en direct`)
  }, delaySeconds * 1000)
}
