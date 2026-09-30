import { EDITOR_COPY } from '@/declarations/ui/copy/forms'
import type { IconName } from '@/declarations/ui/icons'
import type { EditorBlockKind } from '@/utils/editor/markdownBlocks'

/**
 * Slash command
 * @typedef {Object} SlashCommand
 * @property {EditorBlockKind} kind - Block made
 * @property {string} label - Menu label
 * @property {string} description - Menu hint
 * @property {IconName} icon - Menu glyph
 * @property {string[]} keywords - Filter words
 */

export interface SlashCommand {
  kind: EditorBlockKind
  label: string
  description: string
  icon: IconName
  keywords: string[]
}

/**
 * Commands of the slash menu
 * @type {SlashCommand[]}
 */

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    kind: 'paragraph',
    label: EDITOR_COPY.paragraph,
    description: EDITOR_COPY.paragraphHint,
    icon: 'paragraph',
    keywords: ['texte', 'paragraphe', 'text'],
  },
  {
    kind: 'heading1',
    label: EDITOR_COPY.heading1,
    description: EDITOR_COPY.heading1Hint,
    icon: 'heading',
    keywords: ['titre', 'h1', 'heading'],
  },
  {
    kind: 'heading2',
    label: EDITOR_COPY.heading2,
    description: EDITOR_COPY.heading2Hint,
    icon: 'heading',
    keywords: ['titre', 'h2', 'sous-titre'],
  },
  {
    kind: 'heading3',
    label: EDITOR_COPY.heading3,
    description: EDITOR_COPY.heading3Hint,
    icon: 'heading',
    keywords: ['titre', 'h3'],
  },
  {
    kind: 'bullet',
    label: EDITOR_COPY.list,
    description: EDITOR_COPY.listHint,
    icon: 'bulletList',
    keywords: ['liste', 'puce', 'bullet'],
  },
  {
    kind: 'numbered',
    label: EDITOR_COPY.orderedList,
    description: EDITOR_COPY.orderedListHint,
    icon: 'orderedList',
    keywords: ['liste', 'numéro', 'ordonnée'],
  },
  {
    kind: 'quote',
    label: EDITOR_COPY.quote,
    description: EDITOR_COPY.quoteHint,
    icon: 'quote',
    keywords: ['citation', 'quote'],
  },
  {
    kind: 'code',
    label: EDITOR_COPY.codeBlock,
    description: EDITOR_COPY.codeBlockHint,
    icon: 'codeBlock',
    keywords: ['code'],
  },
  {
    kind: 'rule',
    label: EDITOR_COPY.rule,
    description: EDITOR_COPY.ruleHint,
    icon: 'rule',
    keywords: ['séparateur', 'ligne', 'divider'],
  },
]

/**
 * Inline marks of the format bar
 * @type {{ command: string, label: string, icon: IconName }[]}
 */

export const FORMAT_MARKS: { command: string; label: string; icon: IconName }[] = [
  { command: 'bold', label: EDITOR_COPY.bold, icon: 'bold' },
  { command: 'italic', label: EDITOR_COPY.italic, icon: 'italic' },
  { command: 'underline', label: EDITOR_COPY.underline, icon: 'underline' },
  { command: 'strikeThrough', label: EDITOR_COPY.strike, icon: 'strike' },
]
