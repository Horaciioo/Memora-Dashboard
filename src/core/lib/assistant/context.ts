import { ROUTES } from '@/declarations/navigation'
import type { AssistantElement, AssistantEntityKind, AssistantMemory } from '@/types/assistant'

/**
 * Resource on screen
 * @typedef {Object} PageContext
 * @property {AssistantEntityKind} kind - Resource kind
 * @property {string} id - Resource identifier
 */

export interface PageContext {
  kind: AssistantEntityKind
  id: string
}

// List page of each kind, its detail under it
const DETAIL_ROOTS: Record<AssistantEntityKind, string> = {
  member: ROUTES.members,
  task: ROUTES.tasks,
  project: ROUTES.projects,
  live: ROUTES.lives,
}

/**
 * Read the resource on screen
 * @param {string} pathname - Page on screen
 * @param {AssistantElement | null} [element] - Record the page declared, it wins over the address
 * @return {PageContext | null} - Resource or none
 */

export const readPageContext = (
  pathname: string,
  element: AssistantElement | null = null
): PageContext | null => {
  const declared = (Object.keys(DETAIL_ROOTS) as string[]).includes(element?.kind ?? '')
  if (element && declared) return { kind: element.kind as AssistantEntityKind, id: element.id }

  for (const [kind, root] of Object.entries(DETAIL_ROOTS) as [AssistantEntityKind, string][]) {
    const id = pathname.startsWith(`${root}/`) ? pathname.slice(root.length + 1).split('/')[0] : ''
    if (id) return { kind, id: decodeURIComponent(id) }
  }

  return null
}

/**
 * Resource a pointing word means
 * @param {AssistantEntityKind} kind - Kind expected
 * @param {PageContext | null} page - Resource on screen
 * @param {AssistantMemory} memory - Earlier references
 * @return {string | null} - Identifier when certain
 */

export const resolveReference = (
  kind: AssistantEntityKind,
  page: PageContext | null,
  memory: AssistantMemory
): string | null => {
  // The screen wins over memory
  if (page?.kind === kind) return page.id

  return memory[kind]?.id ?? null
}
