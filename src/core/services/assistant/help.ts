import 'server-only'

import { findPage } from '@/core/lib/assistant/intents'
import { tokenize } from '@/core/lib/assistant/normalize'
import { rankNamed } from '@/core/lib/assistant/topics'
import type { Nameable } from '@/core/lib/assistant/topics'
import { askChoice, fill, speak } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { canOpenPage, pageName } from '@/core/services/assistant/navigation'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_DOMAINS, ASSISTANT_INTENTS } from '@/declarations/assistant/domains'
import { GLOSSARY } from '@/declarations/assistant/help/glossary'
import { HELP_TOPICS } from '@/declarations/assistant/help/topics'
import { ASSISTANT_PAGES } from '@/declarations/assistant/lexicon'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantProposal, AssistantSayLine } from '@/types/assistant'

/**
 * One answer Memora can give about herself or the app
 * @typedef {Object} HelpEntry
 * @property {string} label - Name offered when two entries tie
 * @property {string[]} lines - What she says
 * @property {string} [href] - Page the entry describes
 * @property {string} [offer] - Sentence that makes her do it for the member
 */

interface HelpEntry extends Nameable {
  label: string
  lines: readonly string[]
  href?: string
  offer?: string
}

// Pages are named the way the rest of Memora names them
const topicEntries: HelpEntry[] = HELP_TOPICS.map((topic) => ({
  id: topic.href,
  label: pageName(topic.href),
  phrases: [
    ...(ASSISTANT_PAGES.find((page) => page.href === topic.href)?.phrases ?? []),
    ...(topic.extra ?? []),
  ],
  lines: topic.lines,
  href: topic.href,
  offer: topic.offer,
}))

const glossaryEntries: HelpEntry[] = GLOSSARY.map((entry) => ({
  id: entry.term,
  label: entry.term,
  phrases: entry.keywords,
  lines: entry.lines,
}))

/**
 * Lines of an entry, the page it describes last
 * @param {HelpEntry} entry - Entry answered
 * @param {ResolverContext} context - Resolver context
 * @return {AssistantSayLine[]} - What she says
 */

const linesOf = (entry: HelpEntry, { session, access }: ResolverContext): AssistantSayLine[] => {
  const said = entry.lines.map((text) => ({ text: fill(text, { page: entry.label }) }))
  if (!entry.href) return said

  // The link follows the rail: never to a page the member cannot open
  return canOpenPage({ href: entry.href }, session, access)
    ? [...said, { text: ASSISTANT_COPY.helpLink, link: { href: entry.href, label: entry.label } }]
    : [...said, { text: ASSISTANT_COPY.helpClosed }]
}

/**
 * Entry named by the sentence, or the question that settles a tie
 * @param {HelpEntry[][]} groups - Candidates, the first group that names something decides
 * @param {ResolverContext} context - Resolver context
 * @return {HelpEntry | AssistantProposal | null} - Entry, question, or nothing
 */

const pick = (
  groups: HelpEntry[][],
  { parsed, request }: ResolverContext
): HelpEntry | AssistantProposal | null => {
  const tokens = tokenize(request.text)
  const settled = groups.flat().find((entry) => entry.id === request.filled.topic)
  if (settled) return settled

  for (const group of groups) {
    const [best, second] = rankNamed(tokens, group)
    if (!best) continue
    if (!second || second.score < best.score) return best.entry

    return askChoice({
      intent: parsed.intent!,
      slotKey: 'topic',
      reply: ASSISTANT_COPY.whichTopic,
      choices: rankNamed(tokens, group)
        .filter(({ score }) => score === best.score)
        .slice(0, ASSISTANT_SETTINGS.maxChoices)
        .map(({ entry }) => ({ value: entry.id, label: entry.label })),
    })
  }

  return null
}

/**
 * Explain a page or a word of the team
 * @type {Resolver}
 */

export const resolveGuide: Resolver = async (context) => {
  // A question about a word looks in the glossary first, any other in the pages
  const isWord = context.parsed.intent === 'define'
  const found = pick(
    isWord ? [glossaryEntries, topicEntries] : [topicEntries, glossaryEntries],
    context
  )

  if (found && 'status' in found) return found

  return found
    ? speak({
        intent: context.parsed.intent,
        lines: linesOf(found, context),
        replies: found.offer ? [found.offer] : [],
      })
    : speak({
        intent: context.parsed.intent,
        lines: [{ text: ASSISTANT_COPY.helpMissing }],
        replies: [ASSISTANT_INTENTS.capabilities.examples[0]],
      })
}

/**
 * Say where a page is, link only when the member may open it
 * @type {Resolver}
 */

export const resolveWhere: Resolver = async (context) => {
  const { session, access, request, parsed } = context
  const found = pick([topicEntries], context)
  if (found && 'status' in found) return found

  // Pages without a sheet are still known by name
  const named = found ? null : findPage(tokenize(request.text))?.page
  const target = found ? { href: found.href!, label: found.label } : named
  if (!target) {
    return speak({ intent: parsed.intent, lines: [{ text: ASSISTANT_COPY.whereMissing }] })
  }

  return speak({
    intent: parsed.intent,
    lines: canOpenPage(target, session, access)
      ? [{ text: ASSISTANT_COPY.helpLink, link: { href: target.href, label: target.label } }]
      : [{ text: ASSISTANT_COPY.helpClosed }],
  })
}

/**
 * Tell what Memora can do for this member, nothing behind a right they lack
 * @type {Resolver}
 */

export const resolveCapabilities: Resolver = async ({ access }) => {
  // A domain shows when one of its intents is open to the member
  const open = ASSISTANT_DOMAINS.filter((domain) =>
    Object.values(domain.intents).some(
      (intent) => !intent.permission || access.can(intent.permission)
    )
  )

  return speak({
    intent: 'capabilities',
    lines: [
      { text: ASSISTANT_COPY.capabilitiesIntro },
      ...open.map((domain) => ({ text: domain.summary })),
      { text: ASSISTANT_COPY.capabilitiesOutro },
    ],
    replies: open
      .flatMap((domain) => Object.values(domain.intents)[0]?.examples.slice(0, 1) ?? [])
      .slice(0, ASSISTANT_SETTINGS.maxPicks),
  })
}
