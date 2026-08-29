import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/tools/ThemeScript'
import { ColorVisionFilters } from '@/components/tools/ColorVisionFilters'
import { Providers } from '@/app/providers'
import { getSession } from '@/core/lib/auth/getSession'
import { APP_COMPANY, APP_DESCRIPTION, APP_FONTS, APP_NAME } from '@/declarations/app'

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: APP_COMPANY }],
}

/**
 * Root layout
 * @param {Object} props - App tree
 * @param {ReactNode} props.children - Routed content
 * @return {Promise<JSX.Element>} - Document shell
 */

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialSession = await getSession()

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {APP_FONTS.preconnect.map((href) => (
          <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
        ))}
        <link rel="stylesheet" href={APP_FONTS.stylesheet} />
        <ThemeScript />
      </head>
      <body className="bg-[var(--color-background)] text-[var(--color-ink)] antialiased">
        <ColorVisionFilters />
        <Providers initialSession={initialSession}>{children}</Providers>
      </body>
    </html>
  )
}
