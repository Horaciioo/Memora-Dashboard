import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { lookupName } from '@/core/lib/assistant/matching'
import { FAMILIES, pickRecord } from '@/core/services/assistant/records'
import { askChoice, fill, missing, propose } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { listReviewQueue } from '@/core/services/absences/AbsenceService'
import { listRequests, readRequest } from '@/core/services/unban/UnbanRequestService'
import { listTasks, readTask } from '@/core/services/work/TaskService'
import { assertTaskVisible, workViewer } from '@/core/services/work/visibility'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { GESTURES } from '@/declarations/assistant/gestures'
import type { GestureDef, GestureId } from '@/declarations/assistant/gestures'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantProposal, AssistantReference } from '@/types/assistant'
import { UnbanStatuses } from '@/utils/constants/unban'
import { formatDayRange } from '@/utils/format/time/dates'

// Nothing to act on, said in words
export const nothing = (gesture: GestureId, reply: string): AssistantProposal =>
  propose(gesture, { status: 'notFound', reply })

// Target found, or the question that finds it
export type Found = { target: AssistantReference } | { proposal: AssistantProposal }

/**
 * Proposal that asks before doing a gesture
 * @param {GestureId} gesture - Registry entry
 * @param {Object} input - What it acts on
 * @param {string} input.id - Target identifier, empty for a global gesture
 * @param {string} input.name - Target name told back
 * @param {Record<string, unknown>} [input.values] - Payload of a creation
 * @param {Record<string, unknown>} [input.back] - Values the gesture takes back to
 * @param {Record<string, string>} [input.tell] - Words the sentences also name
 * @return {AssistantProposal} - Proposal waiting for a yes
 */

export const proposeGesture = (
  gesture: GestureId,
  {
    id,
    name,
    values = {},
    back = {},
    tell = {},
  }: {
    id: string
    name: string
    values?: Record<string, unknown>
    back?: Record<string, unknown>
    tell?: Record<string, string>
  }
): AssistantProposal => {
  const def: GestureDef = GESTURES[gesture]
  const reverse: GestureDef | null = def.undo ? GESTURES[def.undo as GestureId] : null

  return propose(gesture, {
    reply: fill(def.ask, { name, ...tell }),
    confirm: true,
    action: {
      kind: 'act',
      gesture,
      risk: def.risk,
      call: def.call(id, values),
      undo: reverse ? reverse.call(id, back) : null,
      batch: [],
      confirmLabel: def.confirmLabel,
      done: fill(def.done, { name, ...tell }),
      sure: def.sure ? fill(def.sure, { name, ...tell }) : null,
      remember: def.remember ?? null,
    },
    memory: def.target && id ? { [def.target]: { id, label: name } } : {},
  })
}

/**
 * Title of a task the member can reach
 * @param {string} id - Task identifier
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<string | null>} - Title, none when hidden or gone
 */

const reachableTask = async (
  id: string,
  { session, access }: ResolverContext
): Promise<string | null> => {
  try {
    await assertTaskVisible(id, workViewer(session, access))

    return (await readTask(id)).title
  } catch {
    return null
  }
}

/**
 * Own tasks a gesture could still apply to, offered when none was named
 * @param {GestureId} gesture - Registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Question, or a word when nothing fits
 */

const askTask = async (
  gesture: GestureId,
  context: ResolverContext
): Promise<AssistantProposal> => {
  const { session, access, scope } = context
  const wantsDone = gesture === 'reopenTask'
  const tasks = await listTasks(await scope(), workViewer(session, access))
  const mine = tasks
    .filter((task) => task.owner?.id === session.id && task.isDone === wantsDone)
    .slice(0, ASSISTANT_SETTINGS.maxChoices)

  if (mine.length === 0) return nothing(gesture, ASSISTANT_COPY.noTask)

  return askChoice({
    intent: gesture,
    slotKey: 'task',
    reply: ASSISTANT_COPY.whichTask,
    choices: mine.map((task) => ({ value: task.id, label: task.title })),
  })
}

/**
 * Task a sentence points at: answered, named, on screen or just said
 * @param {GestureId} gesture - Registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<Found>} - Task or question
 */

export const findTask = async (gesture: GestureId, context: ResolverContext): Promise<Found> => {
  const { parsed, request, page } = context

  // A name goes through the search the member is allowed
  if (parsed.subject && !request.filled.task) {
    const found = await pickRecord(context, gesture, FAMILIES.task!)

    return 'proposal' in found ? found : { target: { id: found.hit.id, label: found.hit.label } }
  }

  const id = request.filled.task ?? resolveReference('task', page, request.memory)
  if (!id) return { proposal: await askTask(gesture, context) }

  const title = await reachableTask(id, context)

  return title
    ? { target: { id, label: title } }
    : { proposal: nothing(gesture, ASSISTANT_COPY.noTask) }
}

/**
 * Absence waiting for an answer: answered, named, or the only one
 * @param {GestureId} gesture - Registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<Found>} - Absence or question
 */

const findAbsence = async (gesture: GestureId, context: ResolverContext): Promise<Found> => {
  const { parsed, request, session, access } = context
  const queue = await listReviewQueue(session.id, access.isAdmin)
  if (queue.length === 0) return { proposal: nothing(gesture, ASSISTANT_COPY.noPending) }

  const options = queue.map((absence) => ({
    value: absence.id,
    label: absence.memberName,
    hint: formatDayRange(absence.startDate, absence.endDate),
  }))
  const toTarget = (value: string, label: string) => ({ target: { id: value, label } })

  const answered = options.find((option) => option.value === request.filled.absence)
  if (answered) return toTarget(answered.value, answered.label)

  const found = parsed.subject
    ? lookupName(parsed.subject, options, ASSISTANT_SETTINGS.maxChoices)
    : queue.length === 1
      ? ({ kind: 'one', match: options[0] } as const)
      : ({ kind: 'many', matches: options.slice(0, ASSISTANT_SETTINGS.maxChoices) } as const)

  if (found.kind === 'none') return { proposal: missing(gesture, parsed.subject) }
  if (found.kind === 'one') return toTarget(found.match.value, found.match.label)

  return {
    proposal: askChoice({
      intent: gesture,
      slotKey: 'absence',
      reply: ASSISTANT_COPY.whichOne,
      choices: found.matches,
    }),
  }
}

/**
 * Deban. request to take or hand back: answered, named, or the only one
 * @param {GestureId} gesture - Registry entry
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<Found & { version?: number }>} - Request, its counter, or a question
 */

const findUnban = async (
  gesture: GestureId,
  context: ResolverContext
): Promise<(Found & { version?: number }) | { proposal: AssistantProposal }> => {
  const { parsed, request, session, access, scope } = context
  const caller = { access, scope: await scope(), actorId: session.id }
  const { items } = await listRequests(
    {
      statuses: [UnbanStatuses.Pending, UnbanStatuses.InReview],
      assignee: gesture === 'takeUnban' ? 'none' : 'me',
      limit: ASSISTANT_SETTINGS.maxChoices,
    },
    caller
  )
  if (items.length === 0) return { proposal: nothing(gesture, ASSISTANT_COPY.noRequest) }

  const options = items.map((item) => ({
    value: item.id,
    label: item.discordName,
    hint: item.youtuberName,
  }))
  const answered = options.find((option) => option.value === request.filled.unban)
  const found = answered
    ? ({ kind: 'one', match: answered } as const)
    : parsed.subject
      ? lookupName(parsed.subject, options, ASSISTANT_SETTINGS.maxChoices)
      : options.length === 1
        ? ({ kind: 'one', match: options[0] } as const)
        : ({ kind: 'many', matches: options } as const)

  if (found.kind === 'none') return { proposal: missing(gesture, parsed.subject) }
  if (found.kind === 'many') {
    return {
      proposal: askChoice({
        intent: gesture,
        slotKey: 'unban',
        reply: ASSISTANT_COPY.whichOne,
        choices: found.matches,
      }),
    }
  }

  const { version } = await readRequest(found.match.value, caller)

  return { target: { id: found.match.value, label: found.match.label }, version }
}

/**
 * Do something in the member's place, after a yes
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal waiting for a yes
 */

export const resolveGesture: Resolver = async (context) => {
  const gesture = context.parsed.intent as GestureId
  const kind = GESTURES[gesture].target

  if (kind === null) return proposeGesture(gesture, { id: '', name: '' })

  const found =
    kind === 'task'
      ? await findTask(gesture, context)
      : kind === 'unban'
        ? await findUnban(gesture, context)
        : await findAbsence(gesture, context)

  return 'proposal' in found
    ? found.proposal
    : proposeGesture(gesture, {
        id: found.target.id,
        name: found.target.label,
        values: 'version' in found ? { version: found.version } : {},
      })
}
