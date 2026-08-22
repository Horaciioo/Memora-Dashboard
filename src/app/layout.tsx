import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, Outfit } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/tools/ThemeScript'
import { ColorVisionFilters } from '@/components/tools/ColorVisionFilters'
import { Providers } from '@/app/providers'
import { getSession } from '@/core/lib/auth/getSession'
import { APP_COMPANY, APP_DESCRIPTION, APP_NAME } from '@/declarations/app'

const bodyFont = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const displayFont = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

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
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
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
