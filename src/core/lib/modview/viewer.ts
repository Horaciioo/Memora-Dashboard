import type { Chatter, ModAct, ModActKind } from '@/types/modview'

// Acts that count as a sanction
const SANCTION_KINDS: ModActKind[] = ['delete', 'warn', 'timeout', 'ban']

/**
 * Sanctions a viewer got on this live
 * @param {ModAct[]} acts - Acts of the live
 * @param {Chatter} chatter - Viewer
 * @return {ModAct[]} - Sanctions
 */

export const sanctionsOn = (acts: ModAct[], chatter: Chatter): ModAct[] =>
  actsOn(acts, chatter).filter((act) => SANCTION_KINDS.includes(act.kind))

/**
 * Every act aimed at a viewer on this live
 * @param {ModAct[]} acts - Acts of the live
 * @param {Chatter} chatter - Viewer
 * @return {ModAct[]} - Acts
 */

export const actsOn = (acts: ModAct[], chatter: Chatter): ModAct[] =>
  acts.filter((act) =>
    [chatter.name, chatter.login].some((name) => name.toLowerCase() === act.target?.toLowerCase())
  )
