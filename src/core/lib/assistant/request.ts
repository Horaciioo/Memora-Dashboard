import type { AssistantEntityKind, AssistantMemory, AssistantRequest } from '@/types/assistant'

// Longest sentence read
const TEXT_MAX_LENGTH = 300

// Longest single value
const VALUE_MAX_LENGTH = 200

const KINDS: AssistantEntityKind[] = ['member', 'task', 'project', 'live']

// Plain object or nothing
const recordOf = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

// Bounded string or nothing
const textOf = (value: unknown, max = VALUE_MAX_LENGTH): string =>
  typeof value === 'string' ? value.slice(0, max) : ''

/**
 * Keep well formed references
 * @param {unknown} value - Raw memory
 * @return {AssistantMemory} - Clean memory
 */

const readMemory = (value: unknown): AssistantMemory => {
  const raw = recordOf(value)

  return Object.fromEntries(
    KINDS.flatMap((kind) => {
      const entry = recordOf(raw[kind])
      const id = textOf(entry.id)

      return id ? [[kind, { id, label: textOf(entry.label) }]] : []
    })
  )
}

/**
 * Read a palette request
 * @param {Record<string, unknown>} raw - Untouched body
 * @return {AssistantRequest} - Bounded request
 */

export const readAssistantRequest = (raw: Record<string, unknown>): AssistantRequest => {
  const pathname = textOf(raw.pathname)

  return {
    text: textOf(raw.text, TEXT_MAX_LENGTH),
    pathname: pathname.startsWith('/') ? pathname : '/',
    memory: readMemory(raw.memory),
    filled: Object.fromEntries(
      Object.entries(recordOf(raw.filled))
        .map(([key, value]) => [key.slice(0, VALUE_MAX_LENGTH), textOf(value)] as const)
        .filter(([, value]) => value.length > 0)
    ),
  }
}
