import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

import { SITE_PALETTE, TICKET_PALETTE as palette } from '@/core/lib/share/ticketPalette'
import { APP_NAME } from '@/declarations/app'
import { SHARE_COPY } from '@/declarations/share/copy'

export const alt = APP_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Fonts shipped with the app
const fontOf = (file: string) => readFile(path.join(process.cwd(), 'public', 'fonts', file))

/**
 * One window of the app, its loading bars drawn in colour
 * @param {Object} props - Window shape
 * @param {string} props.title - Window name
 * @param {Record<string, string | number>} props.place - Position and turn
 * @param {number[]} props.bars - Bar widths in percent
 * @param {number} props.tint - Index of the first bar colour
 * @return {JSX.Element}
 */

const AppWindow = ({
  title,
  place,
  bars,
  tint,
}: {
  title: string
  place: Record<string, string | number>
  bars: number[]
  tint: number
}) => (
  <div
    style={{
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      padding: '26px 28px',
      background: SITE_PALETTE.window,
      borderRadius: 30,
      boxShadow: `0 22px 50px ${SITE_PALETTE.shadow}`,
      ...place,
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, color: palette.accent }}>
      {title.toUpperCase()}
    </div>
    {bars.map((width, index) => (
      <div
        key={index}
        style={{
          width: `${width}%`,
          height: 18,
          borderRadius: 99,
          background: SITE_PALETTE.bars[(tint + index) % SITE_PALETTE.bars.length],
        }}
      />
    ))}
  </div>
)

/**
 * Picture of the site address: three windows of the app over the brand
 * @return {Promise<ImageResponse>} - Site image
 */

export default async function SiteImage() {
  const [bold, medium] = await Promise.all([
    fontOf('latin-700-normal.woff'),
    fontOf('latin-500-normal.woff'),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: palette.canvas,
        fontFamily: 'Quicksand',
      }}
    >
      <AppWindow
        title="Calendrier"
        place={{ left: 60, top: 80, width: 380, height: 330, transform: 'rotate(-3deg)' }}
        bars={[100, 72, 88, 56, 80]}
        tint={0}
      />
      <AppWindow
        title="Live en cours"
        place={{ left: 380, top: 130, width: 440, height: 380, zIndex: 2 }}
        bars={[84, 100, 62, 92, 70, 100]}
        tint={1}
      />
      <AppWindow
        title="Formations"
        place={{ left: 770, top: 70, width: 370, height: 320, transform: 'rotate(3deg)' }}
        bars={[90, 64, 100, 76]}
        tint={2}
      />
      <div
        style={{
          position: 'absolute',
          left: 60,
          bottom: 44,
          zIndex: 3,
          padding: '6px 34px',
          borderRadius: 99,
          background: SITE_PALETTE.window,
          fontSize: 64,
          fontWeight: 700,
          color: palette.ink,
        }}
      >
        {SHARE_COPY.site}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Quicksand', data: bold, weight: 700, style: 'normal' },
        { name: 'Quicksand', data: medium, weight: 500, style: 'normal' },
      ],
    }
  )
}
