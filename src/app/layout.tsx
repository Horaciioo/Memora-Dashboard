import type { CSSProperties } from 'react'
import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/tools/ThemeScript'
import { ColorVisionFilters } from '@/components/tools/ColorVisionFilters'
import { Providers } from '@/app/providers'
import { getSession } from '@/core/lib/auth/getSession'
import { NONCE_HEADER } from '@/declarations/system/securityHeaders'
import { APP_COMPANY, APP_DESCRIPTION, APP_FONTS, APP_NAME } from '@/declarations/app'
import { SHELL_DIMENSIONS } from '@/declarations/ui/responsive'

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: APP_COMPANY }],
}

// Lets the floating mobile nav pill read env(safe-area-inset-*) under the notch/home indicator
export const viewport: Viewport = { viewportFit: 'cover' }

// Mobile chrome dimensions, on <body> so every fixed surface reads the same source
const SHELL_VARS = {
  '--shell-top-bar-h': `${SHELL_DIMENSIONS.topBar}px`,
  '--shell-bottom-nav-h': `${SHELL_DIMENSIONS.bottomNav}px`,
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
        <ColorVisionFilters />
        <Providers initialSession={initialSession}>{children}</Providers>
      </body>
    </html>
  )
}
