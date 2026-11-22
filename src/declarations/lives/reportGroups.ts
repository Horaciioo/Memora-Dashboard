import type { ModerationKind } from '@prisma/client'

/**
 * Families of gestures the Bilan charts draw
 * @type {readonly string[]}
 */

export const REPORT_GROUPS = ['delete', 'timeout', 'ban', 'other'] as const

export type ReportGroup = (typeof REPORT_GROUPS)[number]

/**
 * Family of each gesture
 * @type {Record<ModerationKind, ReportGroup>}
 */

export const GROUP_OF_KIND: Record<ModerationKind, ReportGroup> = {
  DELETE: 'delete',
  AUTOMOD_DENY: 'delete',
  TIMEOUT: 'timeout',
  WARN: 'timeout',
  BAN: 'ban',
  UNBAN: 'other',
  AUTOMOD_APPROVE: 'other',
  TERM_ADD: 'other',
  TERM_REMOVE: 'other',
  MODE_CHANGE: 'other',
  UNBAN_REQUEST_APPROVE: 'other',
  UNBAN_REQUEST_DENY: 'other',
  MESSAGE_SEND: 'other',
  ROLE_CHANGE: 'other',
  WARN_ACK: 'other',
}

/**
 * Label and colour of each family
 * @type {Record<ReportGroup, { label: string, colour: string }>}
 */

export const REPORT_GROUP_META: Record<ReportGroup, { label: string; colour: string }> = {
  delete: { label: 'Suppressions', colour: 'var(--color-border-strong)' },
  timeout: { label: 'Timeouts et avertissements', colour: 'var(--color-brand-300)' },
  ban: { label: 'Bannissements', colour: 'var(--color-brand-700)' },
  other: { label: 'Autres actions de Mod.', colour: 'var(--color-ink-subtle)' },
}
