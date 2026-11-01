import { readAbsenceMode } from '@/core/lib/assistant/absence'
import { extractDue } from '@/core/lib/assistant/dates'
import { detectIntent, findPage } from '@/core/lib/assistant/intents'
import { isSimilar, tokenize } from '@/core/lib/assistant/normalize'
import type { AssistantToken } from '@/core/lib/assistant/normalize'
import {
  asksCurrent,
  asksLatest,
  extractActor,
  extractLevel,
  extractOwner,
  extractPeriod,
  extractReference,
  isFiller,
  wordsAfter,
} from '@/core/lib/assistant/slots'
import type { OwnerMatch } from '@/core/lib/assistant/slots'
import {
  ASSISTANT_CURRENT,
  ASSISTANT_INTENTS,
  ASSISTANT_LATEST,
} from '@/declarations/assistant/lexicon'
import type { AssistantIntentName, AssistantPage } from '@/declarations/assistant/lexicon'
import type { JournalPeriod } from '@/declarations/system/monitoring/journal'
import type { AssistantAbsenceMode } from '@/types/assistant'
import type { LogLevelName } from '@/utils/constants/events'

/**
 * Sentence read into parts
 * @typedef {Object} ParsedCommand
 * @property {AssistantIntentName | null} intent - Recognised intent
 * @property {AssistantPage | null} page - Named page
 * @property {string} subject - Resource name typed
 * @property {OwnerMatch | null} owner - Assignee
 * @property {string} project - Project name typed
 * @property {string} title - Task title
 * @property {string} looseTitle - Title keeping a weak assignee
 * @property {string | null} due - ISO day
 * @property {LogLevelName | null} level - Log severity
 * @property {JournalPeriod | null} period - Log window
 * @property {string | null} actor - Log actor typed
 * @property {'member' | 'demonstrative' | null} reference - Pointing word
 * @property {boolean} latest - Latest asked
 * @property {boolean} current - Running asked
 * @property {AssistantAbsenceMode | null} absenceMode - Way into the absence talk
 */

export interface ParsedCommand {
  intent: AssistantIntentName | null
  page: AssistantPage | null
  subject: string
  owner: OwnerMatch | null
  project: string
  title: string
  looseTitle: string
  due: string | null
  level: LogLevelName | null
  period: JournalPeriod | null
  actor: string | null
  reference: 'member' | 'demonstrative' | null
  latest: boolean
  current: boolean
  absenceMode: AssistantAbsenceMode | null
}

// Leading words a title sheds
const TITLE_LEADS = new Set(['de', 'd', 'pour', 'qui', 'afin', 'a', 'que', 'doit', 'avec'])

/**
 * Raw text of kept words
 * @param {string} text - Raw sentence
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {number[]} kept - Positions kept
 * @return {string} - Rebuilt text
 */

const rebuild = (text: string, tokens: AssistantToken[], kept: number[]): string => {
  const runs: string[] = []

  // Neighbours keep their punctuation
  kept.forEach((index, order) => {
    const isJoined = order > 0 && kept[order - 1] === index - 1
    const piece = text.slice(
      isJoined ? tokens[index - 1].end : tokens[index].start,
      tokens[index].end
    )
    if (isJoined) runs[runs.length - 1] += piece
    else runs.push(piece)
  })

  return runs.join(' ').trim()
}

/**
 * Words left for a title
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {Set<number>} used - Words taken
 * @param {number} colon - Offset of a colon
 * @return {number[]} - Title positions
 */

const titleWords = (tokens: AssistantToken[], used: Set<number>, colon: number): number[] => {
  const free = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token, index }) => !used.has(index) && (colon < 0 || token.start > colon))
    .map(({ index }) => index)

  // Joiners at the edges drop
  while (free.length > 0 && TITLE_LEADS.has(tokens[free[0]].folded)) free.shift()
  while (free.length > 0 && isFiller(tokens[free.at(-1)!].folded)) free.pop()

  return free
}

/**
 * Task parts
 * @param {string} text - Raw sentence
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {Set<number>} used - Words taken
 * @param {string} today - ISO day
 * @return {Pick<ParsedCommand, 'owner' | 'project' | 'title' | 'looseTitle' | 'due'>} - Task parts
 */

const readTask = (text: string, tokens: AssistantToken[], used: Set<number>, today: string) => {
  // Opening words stay out of the title
  const lead = Math.max(...used)
  for (let index = 0; index < lead; index += 1) used.add(index)

  const due = extractDue(tokens, today)
  due?.indices.forEach((index) => used.add(index))

  const owner = extractOwner(tokens, used)
  owner?.indices.forEach((index) => used.add(index))

  // A project named after its keyword
  const colon = text.indexOf(':')
  const keyword = tokens.findIndex(
    (token, index) => !used.has(index) && isSimilar(token.folded, 'projet')
  )
  const projectWords = keyword >= 0 ? wordsAfter(tokens, keyword, used, colon) : []
  if (keyword >= 0) [keyword, ...projectWords].forEach((index) => used.add(index))

  const title = rebuild(text, tokens, titleWords(tokens, used, colon))

  // Weak assignee given back
  const loose = new Set(used)
  if (owner && !owner.strong) owner.indices.forEach((index) => loose.delete(index))

  return {
    owner,
    project: rebuild(text, tokens, projectWords),
    title,
    looseTitle:
      owner && !owner.strong ? rebuild(text, tokens, titleWords(tokens, loose, colon)) : title,
    due: due?.value ?? null,
  }
}

// Words a live subject sheds
const LIVE_NOISE = [...ASSISTANT_INTENTS.openLive.nouns, ...ASSISTANT_CURRENT.flat()]

/**
 * Words never part of a subject
 * @param {AssistantIntentName | undefined} intent - Recognised intent
 * @return {string[]} - Noise words
 */

const noiseOf = (intent: AssistantIntentName | undefined): string[] => {
  const rule = intent ? ASSISTANT_INTENTS[intent] : null
  const nouns = rule && 'nouns' in rule ? [...rule.nouns] : []
  const isLive = intent === 'openLive' || intent === 'liveReport'

  return [...nouns, ...ASSISTANT_LATEST, ...(isLive ? LIVE_NOISE : [])]
}

/**
 * Name typed after keywords
 * @param {string} text - Raw sentence
 * @param {AssistantToken[]} tokens - Sentence words
 * @param {Set<number>} used - Words taken
 * @param {string[]} noise - Words to skip
 * @return {string} - Subject
 */

const readSubject = (
  text: string,
  tokens: AssistantToken[],
  used: Set<number>,
  noise: string[]
): string => {
  const kept = tokens
    .map((token, index) => ({ token, index }))
    .filter(
      ({ token, index }) =>
        !used.has(index) &&
        !isFiller(token.folded) &&
        !noise.some((word) => isSimilar(token.folded, word))
    )
    .map(({ index }) => index)

  return rebuild(text, tokens, kept)
}

/**
 * Read a sentence
 * @param {string} text - Raw sentence
 * @param {string} today - ISO day
 * @return {ParsedCommand} - Parts found
 */

export const parseCommand = (text: string, today: string): ParsedCommand => {
  const tokens = tokenize(text)
  const match = detectIntent(tokens)
  const used = new Set(match?.indices ?? [])
  const isTask = match?.intent === 'createTask'
  const task = isTask ? readTask(text, tokens, used, today) : null

  return {
    intent: match?.intent ?? null,
    page: match?.page ?? findPage(tokens)?.page ?? null,
    subject: isTask ? '' : readSubject(text, tokens, used, noiseOf(match?.intent)),
    owner: task?.owner ?? null,
    project: task?.project ?? '',
    title: task?.title ?? '',
    looseTitle: task?.looseTitle ?? '',
    due: task?.due ?? null,
    level: extractLevel(tokens),
    period: extractPeriod(tokens),
    actor: extractActor(tokens),
    reference: extractReference(tokens),
    latest: asksLatest(tokens),
    current: asksCurrent(tokens),
    absenceMode: match?.intent === 'absence' ? readAbsenceMode(tokens) : null,
  }
}

/**
 * Sentence reads as a command
 * @param {string} text - Raw sentence
 * @return {boolean} - Intent found
 */

export const looksLikeCommand = (text: string): boolean => detectIntent(tokenize(text)) !== null
