'use client'

import { usePathname, useRouter } from 'next/navigation'

import { Tabs } from '@/components/elements/navigation/Tabs'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'

/**
 * Board and lexicon tab strip of the academy space
 * @return {JSX.Element}
 */

export const AcademyTabs = () => {
  const pathname = usePathname()
  const router = useRouter()

  // The lexicon holds its own route, everything else is the board
  const value = pathname.startsWith(ROUTES.glossary) ? 'glossary' : 'sessions'

  return (
    <Tabs
      label={ACADEMY_COPY.title}
      value={value}
      onChange={(next) => router.push(next === 'glossary' ? ROUTES.glossary : ROUTES.academy)}
      items={[
        { value: 'sessions', label: ACADEMY_COPY.tabSessions, icon: 'academy' },
        { value: 'glossary', label: ACADEMY_COPY.tabGlossary, icon: 'glossary' },
      ]}
    />
  )
}
