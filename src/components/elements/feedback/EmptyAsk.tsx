'use client'

import { usePathname } from 'next/navigation'

import { useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { onPageExamples } from '@/declarations/assistant/domains'
import { fillTemplate } from '@/utils/format/strings'
import { Permissions } from '@/utils/constants/permissions'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Line offering to ask Memora what the page can do
 * @return {JSX.Element | null}
 */

export const EmptyAsk = () => {
  const pathname = usePathname()
  const { can } = useAuthContext()
  const ask = useAssistantDock((state) => state.ask)

  // Only where Memora has something to do
  const sentence = can(Permissions.IntelligenceUse) ? onPageExamples(pathname, can)[0] : undefined
  if (!sentence) return null

  return (
    <button
      type="button"
      onClick={() => ask(sentence)}
      className="text-sm text-[var(--color-ink-subtle)] underline-offset-4 hover:underline"
    >
      {fillTemplate(ASSISTANT_COPY.askEmpty, { ask: sentence })}
    </button>
  )
}
