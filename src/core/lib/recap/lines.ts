import { RECAP_ALERT_LEAD, RECAP_BEATS, RECAP_FIGURES } from '@/declarations/recap/beats'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import type { RecapChapter } from '@/core/lib/recap/compose'
import type { RecapBeat, RecapThread } from '@/types/recap'
import { DATE_LOCALE } from '@/declarations/ui/dates'
import { notificationSentence } from '@/utils/format/notifications'
import { addDays, isSameDay, parseDay } from '@/utils/format/time/days'

/**
 * Piece of a line, the strong ones carry the eye, the who one stands for the people
 * @typedef {Object} RecapLinePart
 * @property {string} text - Words
 * @property {boolean} [strong] - Read first
 * @property {boolean} [who] - Place of the people
 */

export interface RecapLinePart {
  text: string
  strong?: boolean
  who?: boolean
}

// People marker and **strong** words
const TOKENS = /(\{who\}|\*\*[^*]+\*\*)/

/**
 * Cut a template into the pieces a line is drawn from
 * @param {string} template - Words with {who} and **strong** marks
 * @return {RecapLinePart[]} - Pieces
 */

export const readTemplate = (template: string): RecapLinePart[] =>
  template
    .split(TOKENS)
    .filter(Boolean)
    .map((piece) => {
      if (piece === '{who}') return { text: '', who: true }

      return piece.startsWith('**') ? { text: piece.slice(2, -2), strong: true } : { text: piece }
    })

// Members beyond the names, nothing when there are none
const othersLabel = (others: number): string | null => {
  if (others < 1) return null

  return others === 1 ? RECAP_COPY.otherOne : RECAP_COPY.others.replace('{count}', String(others))
}

/**
 * Names as a sentence subject
 * @param {string[]} names - Names shown
 * @param {number} others - Members beyond the names
 * @return {string} - Léa, Hugo et 2 autres
 */

export const listNames = (names: string[], others: number): string => {
  const tail = othersLabel(others)
  const parts = tail ? [...names, tail] : names
  if (parts.length < 2) return parts[0] ?? RECAP_COPY.system

  return `${parts.slice(0, -1).join(', ')} ${RECAP_COPY.and} ${parts.at(-1)}`
}

/**
 * One beat as a sentence the eye can skim
 * @param {RecapBeat} beat - Beat to read
 * @param {string | null} subject - Record title, worked into the lines addressed to the member
 * @return {RecapLinePart[]} - Pieces
 */

export const beatLine = (beat: RecapBeat, subject: string | null): RecapLinePart[] => {
  // An alert keeps the sentence its notification always had
  const kind = beat.alert ? NOTIFICATION_KIND_REGISTRY.get(beat.alert) : null
  if (kind) {
    const { before, verb, after } = notificationSentence(kind, '{who}', subject)

    const lead = subject && beat.alert ? RECAP_ALERT_LEAD[beat.alert] : null

    return readTemplate(`${before}**${verb}**${lead ? ` ${lead}` : ''}${after.replace(/\.$/, '')}`)
  }

  const option = RECAP_BEATS[beat.beat]
  const several = beat.people.length + beat.others > 1

  return readTemplate(several ? option.many : option.one)
}

/**
 * Title of a day, near ones by name and the others by weekday and date
 * @param {string} day - Day key
 * @return {string} - Title
 */

export const dayTitle = (day: string): string => {
  const date = parseDay(day)
  const today = new Date()

  if (isSameDay(date, today)) return RECAP_COPY.today
  if (isSameDay(date, addDays(today, -1))) return RECAP_COPY.yesterday

  const text = date.toLocaleDateString(DATE_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * One thread as a plain sentence, the people named
 * @param {RecapThread} thread - What moved around one record
 * @return {string} - Sentence
 */

export const threadSentence = (thread: RecapThread): string => {
  const beat = thread.beats[0]
  const people = beat.alert ? beat.people.slice(0, 1) : beat.people
  const names =
    people.length > 0
      ? listNames(
          people.map((person) => person.name),
          0
        )
      : RECAP_COPY.system
  const text = beatLine(beat, thread.subject)
    .map((part) => (part.who ? names : part.text))
    .join('')
    .trim()
  const subject = thread.subject && !beat.alert?.startsWith('Absence') ? ` “${thread.subject}”` : ''

  return `${text}${subject}`
}

/**
 * Piece of a written line, in the order it is read
 * @typedef {Object} RecapPiece
 * @property {'who' | 'text' | 'subject' | 'figure'} kind - What it is
 * @property {string} text - Words, empty for the portraits
 * @property {boolean} [strong] - Read first
 * @property {string} [key] - Tally it counts
 */

export interface RecapPiece {
  kind: 'who' | 'text' | 'subject' | 'figure'
  text: string
  strong?: boolean
  key?: string
}

/**
 * The pieces of one thread's line, so it can be written letter by letter
 * @param {RecapThread} thread - What moved around one record
 * @return {RecapPiece[]} - Pieces in reading order
 */

export const linePieces = (thread: RecapThread): RecapPiece[] => {
  const beat = thread.beats[0]
  const pieces: RecapPiece[] = beatLine(beat, thread.subject).map((part) =>
    part.who ? { kind: 'who', text: '' } : { kind: 'text', text: part.text, strong: part.strong }
  )

  if (thread.subject && !beat.alert?.startsWith('Absence')) {
    pieces.push({ kind: 'subject', text: ` “${thread.subject}”` })
  }

  for (const figure of beat.figures) {
    const copy = RECAP_FIGURES[figure.key]
    pieces.push({
      kind: 'figure',
      key: figure.key,
      text: ` ${figure.count} ${figure.count > 1 ? copy.many : copy.one}`,
    })
  }

  return pieces
}

/**
 * Letters Memora writes for one thread's line
 * @param {RecapThread} thread - What moved around one record
 * @return {number} - Letters
 */

export const lineLength = (thread: RecapThread): number =>
  linePieces(thread).reduce((total, piece) => total + piece.text.length, 0)

/**
 * Letters Memora writes for every line of a chapter
 * @param {RecapChapter} chapter - Chapter told
 * @return {number} - Letters
 */

export const chapterLength = (chapter: RecapChapter): number =>
  chapter.groups.reduce(
    (total, group) => total + group.threads.reduce((sum, thread) => sum + lineLength(thread), 0),
    0
  )
