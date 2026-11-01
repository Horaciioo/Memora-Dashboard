'use client'

import type { ReactNode } from 'react'

import { InlineText } from '@/components/structures/inline/InlineText'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { useLiveData } from '@/core/hooks/data/lives/useLiveData'
import { LIVE_REPORT_COPY, MODERATION_KINDS } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine } from '@/types/lives'

/**
 * Line of a gesture, corrected from its right click menu
 * @param {Object} props - Line, live and content
 * @return {JSX.Element}
 */

export const GestureItem = ({
  liveId,
  line,
  canEdit,
  children,
}: {
  liveId: string
  line: LiveLogLine
  canEdit: boolean
  children: ReactNode
}) => {
  const data = useLiveData()

  const menu = useActionMenu(
    canEdit
      ? [
          ...Object.entries(MODERATION_KINDS)
            .filter(([kind]) => kind !== line.kind)
            .map(([kind, meta]) => ({
              id: kind,
              label: LIVE_REPORT_COPY.changeKind.replace('{kind}', meta.label),
              icon: meta.icon,
              onSelect: () => void data.editGesture(liveId, line.id, { kind }),
            })),
          {
            id: 'remove',
            label: LIVE_REPORT_COPY.removeGesture,
            icon: 'remove',
            onSelect: () => void data.removeGesture(liveId, line.id),
          },
        ]
      : []
  )

  return (
    <li className={LIVE_REPORT.line} onContextMenu={canEdit ? menu.onContextMenu : undefined}>
      {children}
    </li>
  )
}

/**
 * Viewer, length and reason of a gesture, each edited where it stands
 * @param {Object} props - Line and live
 * @return {JSX.Element}
 */

export const GestureFields = ({ liveId, line }: { liveId: string; line: LiveLogLine }) => {
  const data = useLiveData()

  return (
    <span className={LIVE_REPORT.lineDetail}>
      <InlineText
        id={`target-${line.id}`}
        value={line.targetLogin ?? ''}
        placeholder={LIVE_REPORT_COPY.gestureTarget}
        onCommit={(targetLogin) => data.editGesture(liveId, line.id, { targetLogin })}
      />
      {' · '}
      <InlineText
        id={`duration-${line.id}`}
        value={line.durationSeconds ? String(line.durationSeconds) : ''}
        placeholder={LIVE_REPORT_COPY.gestureDuration}
        onCommit={(value) =>
          data.editGesture(liveId, line.id, { durationSeconds: Number.parseInt(value, 10) || 0 })
        }
      />
      {' · '}
      <InlineText
        id={`reason-${line.id}`}
        value={line.reason ?? ''}
        placeholder={LIVE_REPORT_COPY.gestureReason}
        onCommit={(reason) => data.editGesture(liveId, line.id, { reason })}
      />
    </span>
  )
}
