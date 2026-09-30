/**
 * Grammatical gender of a French noun
 * @type {'masculine' | 'feminine'}
 */

export type NounGender = 'masculine' | 'feminine'

// Masculine nouns taking "cet"
const ELIDED_START = /^[aeiouyàâäéèêëîïôöùûüh]/i

// Capital past the first letter, as in YouTubeur
const INNER_CAPITAL = /\p{Lu}/u

/**
 * Noun as it reads mid-sentence
 * @param {string} noun - Display label
 * @return {string} - Lowered noun
 */

export const inlineNoun = (noun: string): string => {
  // Brand casing survives
  if (INNER_CAPITAL.test(noun.slice(1))) return noun

  return noun.charAt(0).toLowerCase() + noun.slice(1)
}

/**
 * Demonstrative before a noun
 * @param {string} noun - Display label
 * @param {NounGender} gender - Noun gender
 * @return {string} - ce, cet or cette
 */

export const demonstrative = (noun: string, gender: NounGender): string => {
  if (gender === 'feminine') return 'cette'

  return ELIDED_START.test(noun) ? 'cet' : 'ce'
}

/**
 * Verb aimed at one record
 * @param {string} verb - Leading verb
 * @param {string} noun - Display label
 * @param {NounGender} gender - Noun gender
 * @return {string} - Full phrase
 */

export const aimedPhrase = (verb: string, noun: string, gender: NounGender): string =>
  `${verb} ${demonstrative(noun, gender)} ${inlineNoun(noun)}`
