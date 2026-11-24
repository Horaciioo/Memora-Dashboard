import 'server-only'

import { nothing, proposeGesture } from '@/core/services/assistant/gestures'
import { fill, propose } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { listReviewQueue } from '@/core/services/absences/AbsenceService'
import { listTasks } from '@/core/services/work/TaskService'
import { workViewer } from '@/core/services/work/visibility'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { BATCHES, GESTURES } from '@/declarations/assistant/gestures'
import type { BatchId, GestureDef } from '@/declarations/assistant/gestures'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantProposal } from '@/types/assistant'

// What a series runs on, one entry per item
type Items = { id: string; name: string }[]

/**
 * Items waiting for a series
 * @type {Record<BatchId, (context: ResolverContext) => Promise<Items>>}
 */

const READERS: Record<BatchId, (context: ResolverContext) => Promise<Items>> = {
  approveAllAbsences: async ({ session, access }) =>
    (await listReviewQueue(session.id, access.isAdmin)).map((absence) => ({
      id: absence.id,
      name: absence.memberName,
    })),
  completeAllTasks: async ({ session, access, scope }) => {
    const tasks = await listTasks(await scope(), workViewer(session, access))

    return tasks
      .filter((task) => task.owner?.id === session.id && !task.isDone)
      .map((task) => ({ id: task.id, name: task.title }))
  },
}

// Nothing waiting, said in words
const EMPTY: Record<BatchId, string> = {
  approveAllAbsences: ASSISTANT_COPY.noPending,
  completeAllTasks: ASSISTANT_COPY.noOpenTask,
}

/**
 * Propose one gesture run on every waiting item, after a single yes
 * @param {BatchId} batch - Series registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal waiting for a yes
 */

const proposeBatch = async (
  batch: BatchId,
  context: ResolverContext
): Promise<AssistantProposal> => {
  const def = BATCHES[batch]
  const waiting = await READERS[batch](context)
  if (waiting.length === 0) return nothing(def.each, EMPTY[batch])

  // One item needs no series
  const items = waiting.slice(0, ASSISTANT_SETTINGS.maxBatch)
  if (items.length === 1) {
    return proposeGesture(def.each, { id: items[0].id, name: items[0].name })
  }

  const single: GestureDef = GESTURES[def.each]
  const count = String(items.length)
  const capped =
    waiting.length > items.length ? ` ${fill(ASSISTANT_COPY.batchCapped, { max: count })}` : ''

  return propose(def.each, {
    reply: `${fill(def.ask, { count })}${capped}`,
    confirm: true,
    action: {
      kind: 'act',
      gesture: def.each,
      risk: def.risk,
      call: single.call(items[0].id, {}),
      undo: null,
      batch: items.map((item) => single.call(item.id, {})),
      confirmLabel: def.confirmLabel,
      done: fill(def.done, { count }),
      sure: null,
      remember: null,
    },
  })
}

/**
 * Run a gesture on everything waiting
 * @type {Resolver}
 */

export const resolveBatch: Resolver = (context) =>
  proposeBatch(
    context.parsed.intent === 'approveAllAbsences' ? 'approveAllAbsences' : 'completeAllTasks',
    context
  )
