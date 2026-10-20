import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { ShareRedirect } from '@/composites/share/ShareRedirect'
import { readPublicOrigin } from '@/core/lib/http/origin'
import { TICKET_PALETTE } from '@/core/lib/share/ticketPalette'
import { DEMO_EVENT_ID, readSharedEvent } from '@/core/lib/share/sharedEvent'
import { ROUTES } from '@/declarations/navigation'
import { SHARE_COPY } from '@/declarations/share/copy'

interface ShareProps {
  params: Promise<{ eventId: string }>
}

// Where a member lands, the showcase ticket has no event behind it
const destinationOf = (eventId: string): string =>
  eventId === DEMO_EVENT_ID ? ROUTES.calendar : ROUTES.calendarEvent(eventId)

/**
 * Card Discord and other robots draw for the address
 * @param {ShareProps} props - Route props
 * @return {Promise<Metadata>} - Open Graph description of the event
 */

export const generateMetadata = async ({ params }: ShareProps): Promise<Metadata> => {
  const { eventId } = await params
  const shared = readSharedEvent(eventId)
  if (!shared) return {}

  const origin = readPublicOrigin(await headers(), 'http://localhost:3000')

  return {
    metadataBase: new URL(origin),
    title: shared.title,
    description: shared.when,
    openGraph: {
      type: 'website',
      siteName: SHARE_COPY.site,
      title: shared.title,
      description: shared.when,
      url: `/${eventId}`,
    },
    twitter: { card: 'summary_large_image', title: shared.title, description: shared.when },
  }
}

/**
 * Colour of the bar beside the card
 * @return {Viewport} - Theme colour
 */

export const generateViewport = (): Viewport => ({ themeColor: TICKET_PALETTE.accent })

/**
 * Short address of an event: a card for robots, a redirect for members
 * @param {ShareProps} props - Route props
 * @return {Promise<JSX.Element>} - Redirect
 */

export default async function ShortEventPage({ params }: ShareProps) {
  const { eventId } = await params
  if (!readSharedEvent(eventId)) notFound()

  return <ShareRedirect to={destinationOf(eventId)} />
}
