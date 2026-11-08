'use client'

import { usePathname } from 'next/navigation'

import { PresenceMarkers } from '@/components/structures/presence/PresenceMarkers'
import { PresenceStack } from '@/components/structures/presence/PresenceStack'
import { usePresence } from '@/core/hooks/data/realtime'
import { useAnchorPlace } from '@/core/hooks/data/realtime/useAnchorPlace'
import { anchorOfPlace, elementOfAnchor } from '@/core/lib/realtime/anchors'
import { revealElement } from '@/core/lib/realtime/reveal'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'
import { SECTION_TOPICS, sectionOfPath } from '@/declarations/system/sections'

export interface SectionRoomProps {
  sectionId: string
  pathname: string
}

/**
 * Seat in one section room
 * @param {SectionRoomProps} props - Section and route
 * @return {JSX.Element | null}
 */

const SectionRoom = ({ sectionId, pathname }: SectionRoomProps) => {
  const presence = usePresence(SECTION_TOPICS.section(sectionId), useAnchorPlace(pathname))

  const elementOf = (place: string) => {
    const anchor = anchorOfPlace(place, pathname)

    return anchor ? elementOfAnchor(anchor) : null
  }

  // Property label, else its text
  const describe = (place: string) => {
    const element = elementOf(place)
    if (!element) return null
    const preview = (element.querySelector('dt') ?? element).textContent
      ?.trim()
      .slice(0, REALTIME_SETTINGS.presencePreviewLength)

    return preview
      ? PRESENCE_COPY.position.replace('{block}', preview)
      : PRESENCE_COPY.positionEmpty
  }

  return (
    <>
      <PresenceStack
        members={presence.members}
        isLive={presence.isLive}
        isDown={false}
        describe={describe}
        onJump={(place) => void revealElement(elementOf(place))}
      />
      <PresenceMarkers members={presence.members} pathname={pathname} isLive={presence.isLive} />
    </>
  )
}

/**
 * Who else is in this collaborative section
 * @return {JSX.Element | null}
 */

export const SectionPresence = () => {
  const pathname = usePathname()
  const section = sectionOfPath(pathname)

  return section ? (
    <SectionRoom key={section.id} sectionId={section.id} pathname={pathname} />
  ) : null
}
