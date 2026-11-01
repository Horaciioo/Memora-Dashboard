'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { Section } from '@/components/structures/page/Section'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { resolveDock } from '@/core/lib/pwa/dock'
import { API_ROUTES } from '@/core/lib/api/routes'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { NavigationItem } from '@/declarations/navigation'
import { DOCK_COPY } from '@/declarations/pwa/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'

export interface DockPreferencesProps {
  candidates: NavigationItem[]
  saved: string[]
}

/**
 * Pages of the phone dock, one menu per slot
 * @param {NavigationItem[]} candidates - Pages the member may open
 * @param {string[]} saved - Picks by slot, empty for the proposed page
 * @return {JSX.Element}
 */

export const DockPreferences = ({ candidates, saved }: DockPreferencesProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  // Each slot shows the page the dock really holds, a proposed one included
  const [picks, setPicks] = useState(() => {
    const shown = resolveDock(saved, candidates, APPLICATION_SETTINGS.dockSlots)

    return Array.from(
      { length: APPLICATION_SETTINGS.dockSlots },
      (_, index) => shown[index]?.href ?? ''
    )
  })

  const options = candidates.map((item) => ({ value: item.href, label: item.label }))

  // A page picked twice leaves its first slot
  const pick = async (slot: number, href: string) => {
    const next = picks.map((current, index) =>
      index === slot ? href : current === href && href ? '' : current
    )
    setPicks(next)

    const done = await run(() => apiPatch(API_ROUTES.mobileDock, { paths: next }), DOCK_COPY.saved)
    if (done) router.refresh()
  }

  return (
    <Section title={DOCK_COPY.title} description={DOCK_COPY.lead} padded>
      <div className={PREFERENCE_STYLES.rows}>
        {picks.map((href, slot) => (
          <div key={slot} className={PREFERENCE_STYLES.row}>
            <span className={PREFERENCE_STYLES.label}>
              {DOCK_COPY.slot.replace('{position}', String(slot + 1))}
            </span>
            <SelectMenu
              options={options}
              value={href}
              onChange={(next) => void pick(slot, next)}
              label={DOCK_COPY.slot.replace('{position}', String(slot + 1))}
              emptyLabel={ACTION_COPY.none}
              disabled={isSaving}
              size="compact"
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
