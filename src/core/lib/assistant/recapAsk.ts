import { foldText } from '@/utils/format/strings'

// Words that ask for the recap of an absence
const RECAP_ASK = /\b(recap|resume|ce que j.?ai (loupe|manque|rate)|pendant mon absence)\b/

/**
 * A typed line that asks Memora to tell the recap again
 * @param {string} text - Typed line
 * @return {boolean} - The member wants their recap
 */

export const isRecapAsk = (text: string): boolean => RECAP_ASK.test(foldText(text))
