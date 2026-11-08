import { seeded } from '@/core/bots/play/random'

/**
 * Habits of one bot
 * @typedef {Object} BotPersona
 */

export interface BotPersona {
  // Share of the writing time, early or late
  pace: number
  // Multiplier on typos
  sloppy: number
  // Holes added or removed
  bold: number
  // Chance to accept a doubtful word
  leniency: number
  // Spread across the list of words
  taste: number
}

/**
 * Stable habits drawn from the bot id
 * @param {string} botId - Bot
 * @return {BotPersona} - Persona
 */

export const personaOf = (botId: string): BotPersona => ({
  pace: 0.7 + seeded(`${botId}:pace`) * 0.6,
  sloppy: 0.4 + seeded(`${botId}:sloppy`) * 1.6,
  bold: (seeded(`${botId}:bold`) - 0.5) * 0.3,
  leniency: seeded(`${botId}:leniency`),
  taste: seeded(`${botId}:taste`),
})

/**
 * Word with a slip, first letter kept
 * @param {string} word - Clean word
 * @return {string} - Typo version
 */

export const withTypo = (word: string): string => {
  if (word.length < 4) return word
  const at = 1 + Math.floor(Math.random() * (word.length - 2))
  const slips = [
    // Dropped letter
    () => word.slice(0, at) + word.slice(at + 1),
    // Doubled letter
    () => word.slice(0, at) + word[at] + word.slice(at),
    // Swapped pair
    () => word.slice(0, at) + word[at + 1] + word[at] + word.slice(at + 2),
  ]

  return slips[Math.floor(Math.random() * slips.length)]()
}
