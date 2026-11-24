import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { proposeGesture } from '@/core/services/assistant/gestures'
import { FAMILIES, pickRecord } from '@/core/services/assistant/records'
import { missing } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { askText } from '@/core/services/assistant/taskEdits'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'

/**
 * Put a point on a meeting
 * @type {Resolver}
 */

export const resolveTopic: Resolver = async (context) => {
  const { parsed, request, page } = context

  // Named, answered or on screen
  const id =
    request.filled.meeting ??
    (parsed.subject ? null : resolveReference('meeting', page, request.memory))
  const found = id ? null : await pickRecord(context, 'addMeetingTopic', FAMILIES.meeting!)
  if (found && 'proposal' in found) return found.proposal

  const meeting = found && 'hit' in found ? { id: found.hit.id, label: found.hit.label } : null
  if (!id && !meeting) return missing('addMeetingTopic', parsed.subject)

  const title = request.filled.title ?? parsed.note
  if (!title) return askText('addMeetingTopic', ASSISTANT_COPY.whatTopic, 'title')

  const label = meeting?.label ?? request.memory.meeting?.label ?? ''

  return proposeGesture('addMeetingTopic', {
    id: meeting?.id ?? id!,
    name: label,
    values: { title },
    tell: { title },
  })
}
