'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { usePlayAdminConfig } from '@/core/hooks/data/play/usePlayAdminConfig'
import { isBoostLive } from '@/core/lib/play/boost'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_BOOST_FIELDS, PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayConfigView } from '@/types/play'
import { formatDay } from '@/utils/format/time/dates'

type BoostKind = 'featured' | 'global'

/**
 * Fields of the config each boost writes
 * @type {Record<BoostKind, { on: string, percent: string, until: string }>}
 */

const KEYS: Record<BoostKind, { on: string; percent: string; until: string }> = {
  featured: { on: 'featuredBoostOn', percent: 'featuredBoostPercent', until: 'featuredBoostUntil' },
  global: { on: 'globalBoostOn', percent: 'globalBoostPercent', until: 'globalBoostUntil' },
}

/**
 * Boosts of XP: on the featured games, on every game
 * @param {{ initial: PlayConfigView }} props - Settings
 * @return {JSX.Element}
 */

export const PlayAdminBoosts = ({ initial }: { initial: PlayConfigView }) => {
  const admin = usePlayAdminConfig(initial)
  const [editing, setEditing] = useState<BoostKind | null>(null)
  const { config } = admin
  const now = new Date()

  const cards: {
    kind: BoostKind
    title: string
    note: string
    isOn: boolean
    percent: number
    until: string | null
  }[] = [
    {
      kind: 'featured',
      title: PLAY_CONFIG_COPY.boostFeatured,
      note: PLAY_CONFIG_COPY.boostFeaturedNote,
      isOn: config.featuredBoostOn,
      percent: config.featuredBoostPercent,
      until: config.featuredBoostUntil,
    },
    {
      kind: 'global',
      title: PLAY_CONFIG_COPY.boostGlobal,
      note: PLAY_CONFIG_COPY.boostGlobalNote,
      isOn: config.globalBoostOn,
      percent: config.globalBoostPercent,
      until: config.globalBoostUntil,
    },
  ]

  const stateOf = (card: (typeof cards)[number]) => {
    if (!card.isOn) return PLAY_CONFIG_COPY.boostIdle
    if (!isBoostLive(card.isOn, card.percent, card.until, now)) return PLAY_CONFIG_COPY.boostEnded

    return PLAY_CONFIG_COPY.boostLive
  }

  return (
    <PlayPageTitle
      aside={null}
      body={
        <div className={PLAY_ADMIN.list}>
          <p className={PLAY_ADMIN.note}>{PLAY_CONFIG_COPY.boostsIntro}</p>
          <div className={PLAY_ADMIN.boosts}>
            {cards.map((card) => (
              <div key={card.kind} className={PLAY_ADMIN.boost}>
                <div className={PLAY_ADMIN.boostHead}>
                  <div className={PLAY_ADMIN.controlText}>
                    <h3 className={PLAY_ADMIN.boostTitle}>{card.title}</h3>
                    <p className={PLAY_ADMIN.controlNote}>{card.note}</p>
                  </div>
                  <Toggle
                    bare
                    binary
                    checked={card.isOn}
                    disabled={admin.isSaving}
                    label={card.title}
                    onChange={(next) =>
                      void admin.save({ [KEYS[card.kind].on]: next }, PLAY_CONFIG_COPY.boostSaved)
                    }
                  />
                </div>
                <p className={PLAY_ADMIN.boostValue}>
                  {fillPlayMessage(PLAY_CONFIG_COPY.boostBadge, { percent: card.percent })}
                </p>
                <p className={PLAY_ADMIN.boostState}>
                  {stateOf(card)}
                  {'. '}
                  {card.until
                    ? fillPlayMessage(PLAY_CONFIG_COPY.boostEndsOn, { date: formatDay(card.until) })
                    : PLAY_CONFIG_COPY.boostOpen}
                </p>
                {card.kind === 'featured' && (
                  <div className={PLAY_ADMIN.boostGames}>
                    {config.featuredGames.map((game) => (
                      <span key={game} className={PLAY_ADMIN.boostGame}>
                        <PlayGameLogo game={game} className={PLAY_ADMIN.boostLogo} />
                        {PLAY_GAMES.get(game).label}
                      </span>
                    ))}
                  </div>
                )}
                <div className={PLAY_ADMIN.boostActions}>
                  <Button variant="arcade" onClick={() => setEditing(card.kind)}>
                    {PLAY_CONFIG_COPY.boostEdit}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className={PLAY_ADMIN.note}>{PLAY_CONFIG_COPY.boostStack}</p>

          <FormDrawer
            key={editing ?? 'closed'}
            subject={FORM_SUBJECTS.playBoost}
            open={editing !== null}
            title={PLAY_CONFIG_COPY.boostEdit}
            fields={PLAY_BOOST_FIELDS}
            initialValues={
              editing
                ? {
                    percent: cards.find((card) => card.kind === editing)?.percent ?? 0,
                    until: cards.find((card) => card.kind === editing)?.until ?? '',
                  }
                : undefined
            }
            issues={admin.issues}
            isSaving={admin.isSaving}
            onSubmit={async (values) => {
              if (!editing) return false

              return admin.save(
                {
                  [KEYS[editing].percent]: values.percent,
                  [KEYS[editing].until]: values.until || null,
                },
                PLAY_CONFIG_COPY.boostSaved
              )
            }}
            onClose={() => setEditing(null)}
          />
        </div>
      }
    >
      {PLAY_CONFIG_COPY.titleBoosts}
    </PlayPageTitle>
  )
}
