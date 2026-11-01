import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Block offered by the slash menu
 * @typedef {Object} PageBlockOption
 * @property {string} label - Menu label
 * @property {string} description - Menu hint
 * @property {IconName} icon - Menu glyph
 * @property {string[]} keywords - Filter words
 * @property {string} [shortcut] - Markdown typed at line start
 * @property {boolean} convertible - A text block may turn into it
 */

interface PageBlockOption {
  label: string
  description: string
  icon: IconName
  keywords: string[]
  shortcut?: string
  convertible: boolean
}

const PAGE_BLOCK_MAP = {
  paragraph: {
    label: 'Texte',
    description: 'Un paragraphe simple.',
    icon: 'paragraph',
    keywords: ['texte', 'paragraphe', 'text'],
    convertible: true,
  },
  heading1: {
    label: 'Titre 1',
    description: 'Grand titre de section.',
    icon: 'heading',
    keywords: ['titre', 'h1', 'heading'],
    shortcut: '#',
    convertible: true,
  },
  heading2: {
    label: 'Titre 2',
    description: 'Titre moyen.',
    icon: 'headingTwo',
    keywords: ['titre', 'h2', 'sous-titre'],
    shortcut: '##',
    convertible: true,
  },
  heading3: {
    label: 'Titre 3',
    description: 'Petit titre.',
    icon: 'headingThree',
    keywords: ['titre', 'h3'],
    shortcut: '###',
    convertible: true,
  },
  heading4: {
    label: 'Titre 4',
    description: 'Intertitre.',
    icon: 'headingFour',
    keywords: ['titre', 'h4'],
    shortcut: '####',
    convertible: true,
  },
  heading5: {
    label: 'Titre 5',
    description: 'Le plus discret des titres.',
    icon: 'headingFive',
    keywords: ['titre', 'h5'],
    shortcut: '#####',
    convertible: true,
  },
  bulletList: {
    label: 'Liste à puces',
    description: 'Une liste simple.',
    icon: 'bulletList',
    keywords: ['liste', 'puce', 'bullet'],
    shortcut: '-',
    convertible: true,
  },
  orderedList: {
    label: 'Liste numérotée',
    description: 'Une liste dans l’ordre.',
    icon: 'orderedList',
    keywords: ['liste', 'numéro', 'ordonnée'],
    shortcut: '1.',
    convertible: true,
  },
  taskList: {
    label: 'Tâches',
    description: 'Des cases à cocher.',
    icon: 'checkbox',
    keywords: ['tâche', 'todo', 'case', 'cocher'],
    shortcut: '[]',
    convertible: true,
  },
  blockquote: {
    label: 'Citation',
    description: 'Mettre une phrase en avant.',
    icon: 'quote',
    keywords: ['citation', 'quote'],
    shortcut: '>',
    convertible: true,
  },
  callout: {
    label: 'Encadré',
    description: 'Une note qui ressort.',
    icon: 'callout',
    keywords: ['encadré', 'callout', 'note', 'info'],
    convertible: true,
  },
  codeBlock: {
    label: 'Code',
    description: 'Un bloc de code.',
    icon: 'codeBlock',
    keywords: ['code'],
    shortcut: '```',
    convertible: true,
  },
  horizontalRule: {
    label: 'Séparateur',
    description: 'Une ligne entre deux parties.',
    icon: 'rule',
    keywords: ['séparateur', 'ligne', 'divider'],
    shortcut: '---',
    convertible: false,
  },
  image: {
    label: 'Image',
    description: 'Envoyer une image.',
    icon: 'image',
    keywords: ['image', 'photo', 'illustration'],
    convertible: false,
  },
  link: {
    label: 'Lien',
    description: 'Un lien vers une adresse.',
    icon: 'link',
    keywords: ['lien', 'url', 'link'],
    convertible: false,
  },
  subpage: {
    label: 'Sous-page',
    description: 'Une page rangée dans celle-ci.',
    icon: 'page',
    keywords: ['page', 'sous-page', 'enfant'],
    convertible: false,
  },
} satisfies Record<string, PageBlockOption>

export type PageBlockKind = keyof typeof PAGE_BLOCK_MAP

export const PAGE_BLOCKS = createRegistry<PageBlockKind, PageBlockOption>(PAGE_BLOCK_MAP)

/**
 * Glyphs a callout cycles through
 * @type {string[]}
 */

export const CALLOUT_ICONS = ['💡', '📌', '⚠️', '✅', '❗', '💬']

/**
 * Blocks matching typed words
 * @param {string} query - Typed words
 * @return {PageBlockKind[]} - Matches
 */

export const filterBlocks = (query: string): PageBlockKind[] => {
  const needle = query.trim().toLowerCase()
  if (!needle) return PAGE_BLOCKS.keys

  // Label beats keyword, start beats middle
  const score = (kind: PageBlockKind): number => {
    const { label, keywords } = PAGE_BLOCKS.get(kind)
    const name = label.toLowerCase()
    if (name.startsWith(needle)) return 0
    if (name.includes(needle)) return 1
    if (keywords.some((word) => word.startsWith(needle))) return 2

    return keywords.some((word) => word.includes(needle)) ? 3 : 4
  }

  return PAGE_BLOCKS.keys.filter((kind) => score(kind) < 4).toSorted((left, right) => score(left) - score(right))
}
