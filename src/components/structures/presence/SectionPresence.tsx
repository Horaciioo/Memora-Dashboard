'use client'

import { usePathname } from 'next/navigation'

import { PresenceStack } from '@/components/structures/presence/PresenceStack'
import { usePresence } from '@/core/hooks/data/realtime'
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
  const presence = usePresence(SECTION_TOPICS.section(sectionId), pathname)

  return <PresenceStack members={presence.members} isLive={presence.isLive} isDown={false} />
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
