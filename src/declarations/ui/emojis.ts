import catalogue from './emojis.json'

/**
 * One glyph and the two languages it is searched in
 * @typedef {Object} EmojiEntry
 * @property {string} glyph - Rendered character
 * @property {string} fr - French name
 * @property {string} en - English name
 * @property {string[]} tags - Keywords of both languages
 */

export interface EmojiEntry {
  glyph: string
  fr: string
  en: string
  tags: string[]
}

/**
 * Family the keyboard groups its glyphs under
 * @typedef {Object} EmojiGroup
 * @property {string} key - Family identifier
 * @property {string} fr - French family name
 * @property {string} en - English family name
 * @property {EmojiEntry[]} emojis - Glyphs of the family
 */

export interface EmojiGroup {
  key: string
  fr: string
  en: string
  emojis: EmojiEntry[]
}

/**
 * Glyphs offered by the picker, in keyboard order, the Unicode release the file
 * names. Country flags, skin tones and joined sequences stay out: they are the
 * ones systems disagree on
 * @type {EmojiGroup[]}
 */

export const EMOJI_GROUPS: EmojiGroup[] = catalogue.groups
