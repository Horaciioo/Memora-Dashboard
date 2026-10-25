import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

import { TICKET_PALETTE as palette } from '@/core/lib/share/ticketPalette'
import { readSharedEvent } from '@/core/lib/share/sharedEvent'
import { SHARE_COPY } from '@/declarations/share/copy'

export const alt = SHARE_COPY.alt
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Fonts shipped with the app
const fontOf = (file: string) => readFile(path.join(process.cwd(), 'public', 'fonts', file))

// Notch cut out of the ticket on the tear line
const NOTCH = 44
const STUB_WIDTH = 300

/**
 * Ticket picture of a shared event
 * @param {Object} props - Route props
 * @param {Promise<{ eventId: string }>} props.params - Address segment
 * @return {Promise<ImageResponse>} - Ticket image
 */

export default async function TicketImage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const event = readSharedEvent(eventId)
  const [bold, medium] = await Promise.all([
    fontOf('latin-700-normal.woff'),
    fontOf('latin-500-normal.woff'),
  ])

  return new ImageResponse(
    event ? (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: palette.canvas,
          fontFamily: 'Quicksand',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 1060,
            height: 430,
            position: 'relative',
            background: palette.ticket,
            borderRadius: 40,
            color: palette.ink,
          }}
        >
          <div
            style={{
              width: STUB_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: palette.stub,
              borderRadius: '40px 0 0 40px',
              borderRight: `4px dashed ${palette.line}`,
            }}
          >
            {event.date ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: palette.accent }}>
                  {event.date.month.toUpperCase()}
                </div>
                <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>
                  {event.date.day}
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, color: palette.accent }}>
                  {event.date.weekday.toUpperCase()}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 120, fontWeight: 700, color: palette.accent }}>M</div>
            )}
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 56px',
              gap: 18,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: palette.accent, letterSpacing: 4 }}>
              {`${SHARE_COPY.site.toUpperCase()} - ${SHARE_COPY.eventKind.toUpperCase()}`}
            </div>
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{event.title}</div>
            <div style={{ fontSize: 36, fontWeight: 500, color: palette.subtle }}>
              {event.hours ?? event.when}
            </div>
            <div style={{ display: 'flex', marginTop: 8 }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  padding: '8px 22px',
                  borderRadius: 999,
                  background: palette.pill,
                  color: palette.pillInk,
                }}
              >
                {event.scope}
              </div>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: STUB_WIDTH - NOTCH / 2 + 2,
              top: -NOTCH / 2,
              width: NOTCH,
              height: NOTCH,
              borderRadius: NOTCH,
              background: palette.canvas,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: STUB_WIDTH - NOTCH / 2 + 2,
              bottom: -NOTCH / 2,
              width: NOTCH,
              height: NOTCH,
              borderRadius: NOTCH,
              background: palette.canvas,
            }}
          />
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: palette.canvas }} />
    ),
    {
      ...size,
      fonts: [
        { name: 'Quicksand', data: bold, weight: 700, style: 'normal' },
        { name: 'Quicksand', data: medium, weight: 500, style: 'normal' },
      ],
    }
  )
}
