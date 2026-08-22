import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/tools/ThemeScript'
import { ColorVisionFilters } from '@/components/tools/ColorVisionFilters'
import { Providers } from '@/app/providers'
import { getSession } from '@/core/lib/auth/getSession'
import { toSessionUser } from '@/core/lib/auth/session'
import { APP_DESCRIPTION, APP_NAME } from '@/declarations/app'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

/**
 * Root layout
 * @param {{ children: ReactNode }} props - App tree
 * @return {Promise<JSX.Element>}
 */

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  const initialSession = session ? toSessionUser(session) : null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-[var(--color-background)] text-[var(--color-ink)] antialiased">
        <ColorVisionFilters />
        <Providers initialSession={initialSession}>{children}</Providers>
      </body>
    </html>
  )
}
