import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { lookupName } from '@/core/lib/assistant/matching'
import { askChoice, fill, missing, propose, refuse, slot } from '@/core/services/assistant/reply'
import type { Resolver, ResolverContext } from '@/core/services/assistant/reply'
import { taskFields } from '@/core/services/work/TaskService'
import { workViewer } from '@/core/services/work/visibility'
import { ASSISTANT_COPY, ASSISTANT_SLOT_LABELS } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantChoice, AssistantProposal, AssistantSlot } from '@/types/assistant'
import type { FieldOption } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

// Choice resolved, asked or failed
type Pick = { option: FieldOption | null } | { proposal: AssistantProposal }

// Options as answers
const toChoices = (options: FieldOption[]): AssistantChoice[] =>
  options
    .filter((option) => !option.disabled)
    .slice(0, ASSISTANT_SETTINGS.maxChoices)
    .map(({ value, label, hint }) => ({ value, label, hint }))

/**
 * Pick the assignee
 * @param {ResolverContext} context - Resolver context
 * @param {FieldOption[]} options - Allowed members
 * @return {Pick} - Assignee or question
 */

const pickOwner = (context: ResolverContext, options: FieldOption[]): Pick => {
  const { parsed, request, session, page } = context
  const byId = (id: string | null) => options.find((option) => option.value === id) ?? null

  // Answered, pointing word, then self
  if (request.filled.ownerId) return { option: byId(request.filled.ownerId) }
  const isPointed = parsed.owner?.pointed || (!parsed.owner && parsed.reference === 'member')
  if (isPointed) {
    const pointed = byId(resolveReference('member', page, request.memory))
    return pointed
      ? { option: pointed }
      : {
          proposal: askChoice({
            intent: 'createTask',
            slotKey: 'ownerId',
            reply: ASSISTANT_COPY.whoIs,
            choices: toChoices(options),
          }),
        }
  }
  if (!parsed.owner || parsed.owner.self) return { option: byId(session.id) }

  const found = lookupName(parsed.owner.name, options, ASSISTANT_SETTINGS.maxChoices)
  if (found.kind === 'one' && found.match.disabled) {
    return {
      proposal: askChoice({
        intent: 'createTask',
        slotKey: 'ownerId',
        reply: fill(ASSISTANT_COPY.ownerAway, { name: found.match.label }),
        choices: toChoices(options),
      }),
    }
  }
  if (found.kind === 'one') return { option: found.match }
  if (found.kind === 'many') {
    return {
      proposal: askChoice({
        intent: 'createTask',
        slotKey: 'ownerId',
        reply: fill(ASSISTANT_COPY.pickOne, { name: parsed.owner.name }),
        choices: toChoices(found.matches),
      }),
    }
  }

  // A weak marker was no name
  return parsed.owner.strong
    ? { proposal: missing('createTask', parsed.owner.name) }
    : { option: byId(session.id) }
}

/**
 * Pick the project
 * @param {ResolverContext} context - Resolver context
 * @param {FieldOption[]} options - Allowed projects
 * @return {Pick} - Project or question
 */

const pickProject = (context: ResolverContext, options: FieldOption[]): Pick => {
  const { parsed, request, page } = context
  const byId = (id: string | null) => options.find((option) => option.value === id) ?? null

  if (request.filled.projectId) return { option: byId(request.filled.projectId) }
  if (!parsed.project) return { option: byId(resolveReference('project', page, request.memory)) }

  const found = lookupName(parsed.project, options, ASSISTANT_SETTINGS.maxChoices)
  if (found.kind === 'one') return { option: found.match }
  if (found.kind === 'none') return { proposal: missing('createTask', parsed.project) }

  return {
    proposal: askChoice({
      intent: 'createTask',
      slotKey: 'projectId',
      reply: fill(ASSISTANT_COPY.pickOne, { name: parsed.project }),
      choices: toChoices(found.matches),
    }),
  }
}

/**
 * Parameters known so far
 * @param {Object} parts - Resolved parts
 * @return {AssistantSlot[]} - Chips
 */

const knownSlots = (parts: {
  title: string
  owner: FieldOption | null
  project: FieldOption | null
  due: string | null
}): AssistantSlot[] =>
  [
    parts.title && slot('title', parts.title),
    parts.owner && slot('ownerId', parts.owner.label),
    parts.project && slot('projectId', parts.project.label),
    parts.due && slot('dueDate', formatDay(parts.due)),
  ].filter((entry): entry is AssistantSlot => Boolean(entry))

/**
 * Create a task by sentence
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal
 */

export const resolveCreateTask: Resolver = async (context) => {
  const { parsed, request, session, access, scope } = context
  if (!access.can(Permissions.TaskCreate)) return refuse('createTask')

  const fields = await taskFields(await scope(), workViewer(session, access))
  const optionsOf = (name: string) => fields.find((field) => field.name === name)?.options ?? []
  const canManage = access.can(Permissions.TaskManage)

  const owner = pickOwner(context, optionsOf('ownerId'))
  if ('proposal' in owner) return owner.proposal
  if (!canManage && owner.option?.value !== session.id) {
    return refuse('createTask', ASSISTANT_COPY.taskOthers)
  }

  const project = pickProject(context, optionsOf('projectId'))
  if ('proposal' in project) return project.proposal

  const isWeakOwner =
    parsed.owner !== null && !parsed.owner.strong && owner.option?.value === session.id
  const title = request.filled.title ?? (isWeakOwner ? parsed.looseTitle : parsed.title)
  const due = request.filled.dueDate ?? parsed.due
  const slots = knownSlots({ title, owner: owner.option, project: project.option, due })

  // Members write inside a project
  if (!canManage && !project.option) {
    return askChoice({
      intent: 'createTask',
      slotKey: 'projectId',
      reply: ASSISTANT_COPY.taskProject,
      choices: toChoices(optionsOf('projectId')),
      slots,
    })
  }

  if (!title) {
    return propose('createTask', {
      status: 'question',
      reply: ASSISTANT_COPY.taskTitle,
      slots,
      question: { slot: 'title', label: ASSISTANT_SLOT_LABELS.title, kind: 'text', choices: [] },
    })
  }

  return propose('createTask', {
    reply: ASSISTANT_COPY.taskReady,
    slots,
    confirm: true,
    action: {
      kind: 'createTask',
      values: {
        title,
        ...(owner.option && { ownerId: owner.option.value }),
        ...(project.option && { projectId: project.option.value }),
        ...(due && { dueDate: due }),
      },
    },
    memory: owner.option ? { member: { id: owner.option.value, label: owner.option.label } } : {},
  })
}
