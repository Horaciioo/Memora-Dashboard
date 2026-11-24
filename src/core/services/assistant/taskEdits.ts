import 'server-only'

import { extractDue } from '@/core/lib/assistant/dates'
import { lookupName } from '@/core/lib/assistant/matching'
import { tokenize } from '@/core/lib/assistant/normalize'
import { findTask, proposeGesture } from '@/core/services/assistant/gestures'
import { askChoice, fill, missing, propose } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { readTask, taskFields } from '@/core/services/work/TaskService'
import { workViewer } from '@/core/services/work/visibility'
import { ASSISTANT_COPY, ASSISTANT_SLOT_LABELS } from '@/declarations/assistant/copy'
import type { GestureId } from '@/declarations/assistant/gestures'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantChoice, AssistantProposal } from '@/types/assistant'
import type { FieldOption } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { formatDay } from '@/utils/format/time/dates'
import { instantToWall } from '@/utils/format/time/zone'

// Task found and read, or the question that finds it
type Located = { task: TaskSummary } | { proposal: AssistantProposal }

// Day typed or already read
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Task the sentence points at, read whole
 * @param {GestureId} gesture - Registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<Located>} - Task or question
 */

const locate = async (gesture: GestureId, context: ResolverContext): Promise<Located> => {
  const found = await findTask(gesture, context)

  return 'proposal' in found ? found : { task: await readTask(found.target.id) }
}

/**
 * Options of a task field
 * @param {ResolverContext} context - Resolver context
 * @param {string} name - Field name
 * @return {Promise<FieldOption[]>} - Allowed options
 */

const optionsOf = async (context: ResolverContext, name: string): Promise<FieldOption[]> => {
  const { session, access, scope } = context
  const fields = await taskFields(await scope(), workViewer(session, access))

  return fields.find((field) => field.name === name)?.options ?? []
}

// A question that waits for typed words
export const askText = (gesture: GestureId, reply: string, slotKey: 'dueDate' | 'note' | 'title') =>
  propose(gesture, {
    status: 'question',
    reply,
    question: {
      slot: slotKey,
      label: ASSISTANT_SLOT_LABELS[slotKey],
      kind: slotKey === 'dueDate' ? 'date' : 'text',
      choices: [],
    },
  })

/**
 * Move a task to another day
 * @type {Resolver}
 */

export const resolvePostpone: Resolver = async (context) => {
  const located = await locate('postponeTask', context)
  if ('proposal' in located) return located.proposal

  // The day was said, or answered in words
  const today = instantToWall(new Date()).slice(0, 10)
  const answered = context.request.filled.dueDate
  const due =
    answered && !ISO_DAY.test(answered)
      ? (extractDue(tokenize(answered), today)?.value ?? null)
      : (answered ?? context.parsed.due)
  if (!due) return askText('postponeTask', ASSISTANT_COPY.whichDay, 'dueDate')

  const { task } = located

  return proposeGesture('postponeTask', {
    id: task.id,
    name: task.title,
    values: { dueDate: due },
    back: { dueDate: task.values.dueDate },
    tell: { date: formatDay(due) },
  })
}

/**
 * Give a task to somebody
 * @type {Resolver}
 */

export const resolveAssign: Resolver = async (context) => {
  const { parsed, request } = context
  const located = await locate('assignTask', context)
  if ('proposal' in located) return located.proposal

  // Allowed members, those away cannot take it
  const options = (await optionsOf(context, 'ownerId')).filter((option) => !option.disabled)
  const choices = options
    .slice(0, ASSISTANT_SETTINGS.maxChoices)
    .map(({ value, label, hint }) => ({ value, label, hint }))
  const ask = (reply: string, picked: AssistantChoice[] = choices) =>
    askChoice({ intent: 'assignTask', slotKey: 'ownerId', reply, choices: picked })

  const answered = options.find((option) => option.value === request.filled.ownerId)
  const named = parsed.owner && !parsed.owner.self ? parsed.owner.name : ''
  const found = answered
    ? ({ kind: 'one', match: answered } as const)
    : named
      ? lookupName(named, options, ASSISTANT_SETTINGS.maxChoices)
      : null

  if (!found) return ask(ASSISTANT_COPY.whoIs)
  if (found.kind === 'none') return missing('assignTask', named)
  if (found.kind === 'many') {
    return ask(fill(ASSISTANT_COPY.pickOne, { name: named }), found.matches)
  }

  const { task } = located

  return proposeGesture('assignTask', {
    id: task.id,
    name: task.title,
    values: { ownerId: found.match.value },
    back: { ownerId: task.values.ownerId },
    tell: { who: found.match.label },
  })
}

/**
 * Change how urgent a task is
 * @type {Resolver}
 */

export const resolvePriority: Resolver = async (context) => {
  const located = await locate('setTaskPriority', context)
  if ('proposal' in located) return located.proposal

  const options = await optionsOf(context, 'priorityId')
  const answered = options.find((option) => option.value === context.request.filled.priorityId)
  const named = options.find((option) => option.label === context.parsed.priority)
  const picked = answered ?? named

  if (!picked) {
    return askChoice({
      intent: 'setTaskPriority',
      slotKey: 'priorityId',
      reply: ASSISTANT_COPY.whichPriority,
      choices: options.map(({ value, label }) => ({ value, label })),
    })
  }

  const { task } = located

  return proposeGesture('setTaskPriority', {
    id: task.id,
    name: task.title,
    values: { priorityId: picked.value },
    back: { priorityId: task.values.priorityId },
    tell: { priority: picked.label },
  })
}

/**
 * Leave a remark on a task
 * @type {Resolver}
 */

export const resolveComment: Resolver = async (context) => {
  const located = await locate('commentTask', context)
  if ('proposal' in located) return located.proposal

  const note = context.request.filled.note ?? context.parsed.note
  if (!note) return askText('commentTask', ASSISTANT_COPY.whatNote, 'note')

  const { task } = located

  return proposeGesture('commentTask', {
    id: task.id,
    name: task.title,
    values: { note },
    tell: { note },
  })
}
