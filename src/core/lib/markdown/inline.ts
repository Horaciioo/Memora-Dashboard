import type { InlineNode } from '@/core/lib/markdown/types'

/**
 * Inline rule
 * @typedef {Object} InlineRule
 * @property {RegExp} pattern - Match pattern
 * @property {(match: RegExpExecArray) => InlineNode} build - Node builder
 */

interface InlineRule {
  pattern: RegExp
  build: (match: RegExpExecArray) => InlineNode
}

/**
 * Ordered rules, longest delimiters first
 * @type {InlineRule[]}
 */

const RULES: InlineRule[] = [
  { pattern: /`([^`\n]+)`/, build: (match) => ({ type: 'code', value: match[1] }) },
  {
    pattern: /\|\|([\s\S]+?)\|\|/,
    build: (match) => ({ type: 'spoiler', children: parseInline(match[1]) }),
  },
  {
    pattern: /\*\*\*([\s\S]+?)\*\*\*/,
    build: (match) => ({
      type: 'bold',
      children: [{ type: 'italic', children: parseInline(match[1]) }],
    }),
  },
  {
    pattern: /\*\*([\s\S]+?)\*\*/,
    build: (match) => ({ type: 'bold', children: parseInline(match[1]) }),
  },
  {
    pattern: /__([\s\S]+?)__/,
    build: (match) => ({ type: 'underline', children: parseInline(match[1]) }),
  },
  {
    pattern: /~~([\s\S]+?)~~/,
    build: (match) => ({ type: 'strike', children: parseInline(match[1]) }),
  },
  {
    pattern: /\*([^*\n]+)\*/,
    build: (match) => ({ type: 'italic', children: parseInline(match[1]) }),
  },
  {
    pattern: /_([^_\n]+)_/,
    build: (match) => ({ type: 'italic', children: parseInline(match[1]) }),
  },
  {
    pattern: /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/,
    build: (match) => ({ type: 'link', href: match[2], children: parseInline(match[1]) }),
  },
  {
    pattern: /(https?:\/\/[^\s<]+)/,
    build: (match) => ({ type: 'link', href: match[1], children: [{ type: 'text', value: match[1] }] }),
  },
]

/**
 * Turn one line into inline nodes
 * @param {string} source - Raw line
 * @return {InlineNode[]} - Inline nodes
 */

export const parseInline = (source: string): InlineNode[] => {
  if (source.length === 0) return []

  // Keep the earliest match so nesting stays predictable
  let earliest: { index: number; rule: InlineRule; match: RegExpExecArray } | null = null

  for (const rule of RULES) {
    const match = rule.pattern.exec(source)
    if (!match) continue
    if (earliest === null || match.index < earliest.index) {
      earliest = { index: match.index, rule, match }
    }
  }

  if (!earliest) return [{ type: 'text', value: source }]

  const { index, rule, match } = earliest
  const before = source.slice(0, index)
  const after = source.slice(index + match[0].length)

  return [
    ...(before.length > 0 ? [{ type: 'text' as const, value: before }] : []),
    rule.build(match),
    ...parseInline(after),
  ]
}
