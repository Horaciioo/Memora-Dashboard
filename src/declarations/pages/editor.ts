import type { IconName } from '@/declarations/ui/icons'
import type { PageBlockKind } from '@/declarations/pages/blocks'

/**
 * Inline marks of the format bar
 * @type {{ name: string, label: string, icon: IconName }[]}
 */

export const PAGE_FORMAT_MARKS: { name: string; label: string; icon: IconName }[] = [
  { name: 'bold', label: 'Gras', icon: 'bold' },
  { name: 'italic', label: 'Italique', icon: 'italic' },
  { name: 'underline', label: 'Souligné', icon: 'underline' },
  { name: 'strike', label: 'Barré', icon: 'strike' },
  { name: 'code', label: 'Code', icon: 'code' },
]

/**
 * Blocks the phone toolbar turns the line into
 * @type {PageBlockKind[]}
 */

export const MOBILE_TOOLBAR_BLOCKS: PageBlockKind[] = ['heading2', 'bulletList', 'taskList', 'blockquote']

/**
 * Blocks offered by "Turn into"
 * @type {PageBlockKind[]}
 */

export const TURN_INTO_BLOCKS: PageBlockKind[] = [
  'paragraph',
  'heading1',
  'heading2',
  'heading3',
  'bulletList',
  'orderedList',
  'taskList',
  'blockquote',
  'callout',
  'codeBlock',
]

/**
 * Hash prefix of a block deep link
 * @type {string}
 */

export const BLOCK_HASH_PREFIX = '#bloc-'

/**
 * Deep link highlight
 * @type {{ highlightMs: number }}
 */

export const PAGE_TARGET_SETTINGS = {
  highlightMs: 2400,
} as const
