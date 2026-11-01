import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { lookupName } from '@/core/lib/assistant/matching'
import { goTo, openListPage } from '@/core/services/assistant/navigation'
import { askChoice, fill, missing } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { search } from '@/core/services/search/SearchService'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantIntentName } from '@/declarations/assistant/lexicon'
import { ROUTES } from '@/declarations/navigation'
import type { SearchGroup } from '@/declarations/ui/copy/navigation'
import type { AssistantEntityKind, AssistantProposal } from '@/types/assistant'
import type { SearchHit } from '@/types/search'

/**
 * Searchable family
 * @typedef {Object} RecordFamily
 * @property {AssistantEntityKind} kind - Resource kind
 * @property {SearchGroup} group - Search group
 * @property {string} list - List page
 * @property {(id: string) => string} detail - Detail page
 */

interface RecordFamily {
  kind: AssistantEntityKind
  group: SearchGroup
  list: string
  detail: (id: string) => string
}

// Families per intent
const FAMILIES: Partial<Record<AssistantIntentName, RecordFamily>> = {
  findMember: { kind: 'member', group: 'members', list: ROUTES.members, detail: ROUTES.member },
  openTask: { kind: 'task', group: 'tasks', list: ROUTES.tasks, detail: ROUTES.task },
  openProject: {
    kind: 'project',
    group: 'projects',
    list: ROUTES.projects,
    detail: ROUTES.project,
  },
}

// Shortest stem tried
const STEM_LENGTH = 3

/**
 * Hits of one family
 * @param {string} term - Typed name
 * @param {RecordFamily} family - Searched family
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<SearchHit[]>} - Allowed hits
 */

const hitsOf = async (
  term: string,
  family: RecordFamily,
  { session }: ResolverContext
): Promise<SearchHit[]> => {
  const sections = await search(term, session)

  return sections.find((section) => section.group === family.group)?.hits ?? []
}

/**
 * Find hits, typos included
 * @param {string} name - Typed name
 * @param {RecordFamily} family - Searched family
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<SearchHit[]>} - Candidates
 */

const findCandidates = async (
  name: string,
  family: RecordFamily,
  context: ResolverContext
): Promise<SearchHit[]> => {
  const direct = await hitsOf(name, family, context)
  if (direct.length > 0) return direct

  // A typo still shares its stem
  const stem = name.split(/\s+/).sort((left, right) => right.length - left.length)[0]
  if (!stem || stem.length <= STEM_LENGTH) return []

  return hitsOf(stem.slice(0, STEM_LENGTH), family, context)
}

/**
 * Open a hit
 * @param {AssistantIntentName} intent - Recognised intent
 * @param {RecordFamily} family - Searched family
 * @param {SearchHit} hit - Chosen hit
 * @return {AssistantProposal} - Navigation
 */

const openHit = (
  intent: AssistantIntentName,
  family: RecordFamily,
  hit: SearchHit
): AssistantProposal =>
  goTo({
    intent,
    href: hit.href,
    reply: fill(ASSISTANT_COPY.openRecord, { name: hit.label }),
    memory: { [family.kind]: { id: hit.id, label: hit.label } },
  })

/**
 * Open a named record
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal
 */

export const resolveRecord: Resolver = async (context) => {
  const { parsed, request, page } = context
  const intent = parsed.intent!
  const family = FAMILIES[intent]!

  // Pointing word or bare list
  if (!parsed.subject) {
    const id = parsed.reference ? resolveReference(family.kind, page, request.memory) : null
    if (!id) return openListPage(intent, family.list, context)

    const known = request.memory[family.kind]
    return goTo({
      intent,
      href: family.detail(id),
      reply:
        known?.id === id
          ? fill(ASSISTANT_COPY.openRecord, { name: known.label })
          : ASSISTANT_COPY.openPointed,
    })
  }

  const hits = await findCandidates(parsed.subject, family, context)
  const picked = hits.find((hit) => hit.id === request.filled[family.kind])
  if (picked) return openHit(intent, family, picked)

  const found = lookupName(
    parsed.subject,
    hits.map((hit) => ({ ...hit, value: hit.id })),
    ASSISTANT_SETTINGS.maxChoices
  )
  if (found.kind === 'none') return missing(intent, parsed.subject)
  if (found.kind === 'one') return openHit(intent, family, found.match)

  return askChoice({
    intent,
    slotKey: family.kind,
    reply: fill(ASSISTANT_COPY.pickOne, { name: parsed.subject }),
    choices: found.matches.map(({ id, label, hint }) => ({ value: id, label, hint })),
  })
}
