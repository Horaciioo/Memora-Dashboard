import { createRegistry } from '@/core/lib/registry'
import type { PageDocument } from '@/types/pages'

/**
 * Starting point of a new page
 * @typedef {Object} PageTemplateOption
 * @property {string} label - Card title
 * @property {string} description - Card hint
 * @property {string} icon - Page emoji
 * @property {string} title - Page title
 * @property {PageDocument[]} blocks - First blocks
 */

interface PageTemplateOption {
  label: string
  description: string
  icon: string
  title: string
  blocks: PageDocument[]
}

const text = (value: string): PageDocument[] => (value ? [{ type: 'text', text: value }] : [])
const line = (value = ''): PageDocument => ({ type: 'paragraph', content: text(value) })
const heading = (level: number, value: string): PageDocument => ({
  type: 'heading',
  attrs: { level },
  content: text(value),
})
const tasks = (...items: string[]): PageDocument => ({
  type: 'taskList',
  content: items.map((item) => ({
    type: 'taskItem',
    attrs: { checked: false },
    content: [line(item)],
  })),
})
const bullets = (...items: string[]): PageDocument => ({
  type: 'bulletList',
  content: items.map((item) => ({ type: 'listItem', content: [line(item)] })),
})
const callout = (icon: string, value: string): PageDocument => ({
  type: 'callout',
  attrs: { icon },
  content: [line(value)],
})

const PAGE_TEMPLATE_MAP = {
  note: {
    label: 'Note',
    description: 'Une idée, un brouillon, un pense-bête.',
    icon: '📝',
    title: 'Note',
    blocks: [line()],
  },
  documentation: {
    label: 'Documentation',
    description: 'Expliquer un fonctionnement, étape par étape.',
    icon: '📘',
    title: 'Documentation',
    blocks: [
      callout('💡', 'En une phrase : à quoi sert ce document.'),
      heading(2, 'Contexte'),
      line(),
      heading(2, 'Fonctionnement'),
      { type: 'orderedList', content: [{ type: 'listItem', content: [line('Première étape')] }] },
      heading(2, 'Questions fréquentes'),
      line(),
    ],
  },
  tasks: {
    label: 'Liste de tâches',
    description: 'Cocher au fur et à mesure.',
    icon: '✅',
    title: 'À faire',
    blocks: [
      heading(2, 'Aujourd’hui'),
      tasks('Première tâche'),
      heading(2, 'Plus tard'),
      tasks(''),
    ],
  },
  minutes: {
    label: 'Compte rendu',
    description: 'Ce qui s’est dit et qui fait quoi.',
    icon: '🗒️',
    title: 'Compte rendu',
    blocks: [
      heading(2, 'Présents'),
      bullets(''),
      heading(2, 'Points abordés'),
      bullets(''),
      heading(2, 'Décisions'),
      line(),
      heading(2, 'Suites à donner'),
      tasks(''),
    ],
  },
} satisfies Record<string, PageTemplateOption>

export type PageTemplateName = keyof typeof PAGE_TEMPLATE_MAP

export const PAGE_TEMPLATES = createRegistry<PageTemplateName, PageTemplateOption>(
  PAGE_TEMPLATE_MAP
)

/**
 * Document of a template
 * @param {PageTemplateName} name - Template key
 * @return {PageDocument} - First document
 */

export const templateDocument = (name: PageTemplateName): PageDocument => ({
  type: 'doc',
  content: PAGE_TEMPLATES.get(name).blocks,
})
