'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { Drawer } from '@/components/structures/Drawer'
import { LIVECON_COPY, LIVECON_FIELD_COPY } from '@/declarations/livecon/copy'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import { HOME_FLOW } from '@/declarations/ui/variants'
import type { LiveconStateView } from '@/types/livecon'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface HomeLivesProps {
  items: LiveconStateView[]
}

/**
 * Where each creator stands on the livecon: a portrait with its level on the corner, the
 * reason and the rest one click away
 * @param {LiveconStateView[]} items - Levels in force
 * @return {JSX.Element | null}
 */

export const HomeLives = ({ items }: HomeLivesProps) => {
  const [opened, setOpened] = useState<LiveconStateView | null>(null)

  if (items.length === 0) return null

  const scopeOf = (entry: LiveconStateView) => entry.youtuber?.label ?? LIVECON_COPY.global

  return (
    <section className="flex flex-col gap-4">
      <h2 className={HOME_FLOW.label}>{PERSONAL_COPY.livesTitle}</h2>
      <ul className={HOME_FLOW.lives}>
        {items.map((entry) => {
          const Level = ICONS[entry.level.icon ?? 'livecon']
          const paint = accentPaint(entry.level.accent)

          return (
            <li key={entry.id}>
              <button type="button" className={HOME_FLOW.liveTile} onClick={() => setOpened(entry)}>
                <span className={HOME_FLOW.livePortrait}>
                  <Avatar name={scopeOf(entry)} src={entry.youtuber?.image} size="md" />
                  <span className={cn(HOME_FLOW.liveLevel, paint.text)} style={paint.style}>
                    <Level className={HOME_FLOW.liveLevelIcon} aria-hidden="true" />
                  </span>
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={HOME_FLOW.liveName}>{scopeOf(entry)}</span>
                  <span className={HOME_FLOW.liveState}>{entry.level.name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {opened && (
        <Drawer
          open
          onClose={() => setOpened(null)}
          title={opened.level.name}
          icon={opened.level.icon ?? 'livecon'}
          subheader={scopeOf(opened)}
          footer={
            <Link href={ROUTES.sanctions}>
              <Button variant="primary" icon="forward">
                {PERSONAL_COPY.urgentGo}
              </Button>
            </Link>
          }
        >
          <DetailGrid
            entries={[
              { label: LIVECON_FIELD_COPY.reason, value: opened.reason ?? undefined, wide: true },
              { label: PERSONAL_COPY.urgentScope, value: scopeOf(opened) },
              { label: PERSONAL_COPY.urgentSince, value: formatDay(opened.startedAt) },
              { label: PERSONAL_COPY.urgentBy, value: opened.actorName ?? undefined },
            ]}
          />
        </Drawer>
      )}
    </section>
  )
}
