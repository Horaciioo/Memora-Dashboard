'use client'

import { createPortal } from 'react-dom'

import { PresenceAvatar } from '@/components/structures/presence/PresenceAvatar'
import { useAnchorElements } from '@/core/hooks/data/realtime/useAnchorElements'
import { anchorOfPlace } from '@/core/lib/realtime/anchors'
import { PRESENCE_STYLES } from '@/declarations/ui/variants'
import type { PresenceMember } from '@/types/presence'

export interface PresenceMarkersProps {
  members: PresenceMember[]
  pathname: string
  isLive: boolean
}

/**
 * Portraits sitting on the touched elements
 * @param {PresenceMarkersProps} props - Members and route
 * @return {JSX.Element[]}
 */

export const PresenceMarkers = ({ members, pathname, isLive }: PresenceMarkersProps) => {
  const placed = Map.groupBy(
    members.filter((member) => member.status !== 'left' && anchorOfPlace(member.place, pathname)),
    (member) => anchorOfPlace(member.place, pathname) as string
  )
  const elements = useAnchorElements([...placed.keys()].sort())

  return [...placed].flatMap(([anchor, group]) => {
    const element = elements.get(anchor)

    return element
      ? [
          createPortal(
            <div className={PRESENCE_STYLES.marker}>
              {group.map((member) => (
                <PresenceAvatar
                  key={member.accountId}
                  member={member}
                  isLive={isLive}
                  position={null}
                />
              ))}
            </div>,
            element,
            anchor
          ),
        ]
      : []
  })
}
