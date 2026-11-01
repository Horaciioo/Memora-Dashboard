import type { CSSProperties } from 'react'
import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/tools/ThemeScript'
import { Providers } from '@/app/providers'
import { getSession } from '@/core/lib/auth/getSession'
import { readPublicOrigin } from '@/core/lib/http/origin'
import { TICKET_PALETTE } from '@/core/lib/share/ticketPalette'
import { NONCE_HEADER } from '@/declarations/system/security/securityHeaders'
import { APP_COMPANY, APP_DESCRIPTION, APP_FONTS, APP_NAME } from '@/declarations/app'
import { DRAWER_DIMENSIONS, SHELL_DIMENSIONS } from '@/declarations/ui/responsive'

/**
 * Title, description and the card a pasted address turns into
 * @return {Promise<Metadata>} - Site metadata
 */

export const generateMetadata = async (): Promise<Metadata> => ({
  metadataBase: new URL(readPublicOrigin(await headers(), 'http://localhost:3000')),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  // Home screen application on iOS
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  authors: [{ name: APP_COMPANY }],
  openGraph: { type: 'website', siteName: APP_NAME, title: APP_NAME, description: APP_DESCRIPTION },
  twitter: { card: 'summary_large_image', title: APP_NAME, description: APP_DESCRIPTION },
})

// Link preview crawlers, the only readers of the card colour
const PREVIEW_BOTS = /discordbot|twitterbot|slackbot|facebookexternalhit|telegrambot|whatsapp/i

/**
 * Safe-area fit for the floating mobile nav pill, the card colour for crawlers only: browsers tint their toolbar with it
 * @return {Promise<Viewport>} - Viewport
 */

export const generateViewport = async (): Promise<Viewport> => {
  const isPreview = PREVIEW_BOTS.test((await headers()).get('user-agent') ?? '')

  return { viewportFit: 'cover', ...(isPreview && { themeColor: TICKET_PALETTE.accent }) }
}

// Chrome dimensions
const SHELL_VARS = {
  '--shell-top-bar-h': `${SHELL_DIMENSIONS.topBar}px`,
  '--shell-dock-h': `${SHELL_DIMENSIONS.dock}px`,
  '--shell-sidebar-w': `${SHELL_DIMENSIONS.sidebar}px`,
  '--shell-banner-h': `${SHELL_DIMENSIONS.banner}px`,
  '--shell-banner-h-mobile': `${SHELL_DIMENSIONS.bannerMobile}px`,
  '--drawer-w': `${DRAWER_DIMENSIONS.width}px`,
  '--drawer-h-share': `${DRAWER_DIMENSIONS.heightShare}`,
  '--drawer-min-h': `${DRAWER_DIMENSIONS.minHeight}px`,
  '--drawer-gap': `${DRAWER_DIMENSIONS.gap}px`,
} as CSSProperties

/**
 * Root layout
 * @param {Object} props - App tree
 * @param {ReactNode} props.children - Routed content
 * @return {Promise<JSX.Element>} - Document shell
 */

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [initialSession, headerStore] = await Promise.all([getSession(), headers()])

  const nonce = headerStore.get(NONCE_HEADER) ?? undefined

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {APP_FONTS.preconnect.map((href) => (
          <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
        ))}
        <link rel="stylesheet" href={APP_FONTS.stylesheet} />
        <ThemeScript nonce={nonce} />
      </head>
      <body
        style={SHELL_VARS}
        className="bg-[var(--color-background)] text-[var(--color-ink)] antialiased"
      >
        <Providers initialSession={initialSession}>{children}</Providers>
      </body>
    </html>
  )
}
