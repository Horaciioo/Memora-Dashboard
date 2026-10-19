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
  acts.filter(
    (act) =>
      SANCTION_KINDS.includes(act.kind) &&
      [chatter.name, chatter.login].some((name) => name.toLowerCase() === act.target?.toLowerCase())
  )
