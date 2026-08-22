/**
 * Inline piece of a markdown line
 * @type {Object}
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'break' }
  | { type: 'link'; href: string; children: InlineNode[] }
  | { type: 'bold' | 'italic' | 'underline' | 'strike' | 'spoiler'; children: InlineNode[] }

/**
 * Block of a markdown document
 * @type {Object}
 */

export type BlockNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'code'; language: string | null; value: string }
  | { type: 'rule' }
