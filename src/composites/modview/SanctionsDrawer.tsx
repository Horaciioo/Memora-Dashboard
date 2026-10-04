'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { nextRung, thirdRung } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { MODVIEW_COPY, MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { MODVIEW_SANCTIONS } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView, SanctionRungView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

// Favourites kept per browser, a reading convenience
const FAVORITES_KEY = 'memora:modview:favorites'

// Glyph tabs, no written title
type PanelTab = 'favorites' | 'recents' | 'all'
const TABS: { key: PanelTab; icon: IconName; label: string }[] = [
  { key: 'favorites', icon: 'star', label: MODVIEW_PANEL_COPY.favorites },
  { key: 'recents', icon: 'history', label: MODVIEW_PANEL_COPY.recents },
  { key: 'all', icon: 'sanctionsPanel', label: MODVIEW_PANEL_COPY.all },
]

/**
 * Read the pinned offences, an empty list when storage is out of reach
 * @return {string[]} - Offence identifiers
 */

const readFavorites = (): string[] => {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * Keep the pinned offences, silently when storage is out of reach
 * @param {string[]} ids - Offence identifiers
 * @return {void}
 */

const writeFavorites = (ids: string[]): void => {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  } catch {
    // Pins simply last for the visit
  }
}

/**
 * One rung read as text
 * @param {SanctionRungView} rung - Rung
 * @return {string} - Measures then condition
 */

const rungText = (rung: SanctionRungView): string =>
  [rung.measures.map((measure) => measure.name).join(' + '), rung.condition]
    .filter(Boolean)
    .join(' · ')

export interface SanctionsDrawerProps {
  panel: SanctionPanelView | null
  levelName: string | null
  levelIcon: IconName | null
  isOpen: boolean
  onToggle: () => void
  target: Chatter | null
  memory: PanelMemory
  recentIds: string[]
  onPrefill: (offense: SanctionOffenseCard, rung: number) => void
}

/**
 * Sanctions panel at hand: the level in force, a search, three glyph tabs and the offences as
 * text boxes, the rungs already applied to the picked viewer struck through
 * @param {SanctionsDrawerProps} props - Drawer props
 * @return {JSX.Element}
 */

export const SanctionsDrawer = ({
  panel,
  levelName,
  levelIcon,
  isOpen,
  onToggle,
  target,
  memory,
  recentIds,
  onPrefill,
}: SanctionsDrawerProps) => {
  const [tab, setTab] = useState<PanelTab>('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  // Pins live in this browser, read once mounted
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readFavorites())
  }, [])
  const ToggleIcon = ICONS.sanctionsPanel
  const LevelIcon = levelIcon ? ICONS[levelIcon] : null
  const StarIcon = ICONS.star

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((entry) => entry !== id)
      : [...favorites, id]
    setFavorites(next)
    writeFavorites(next)
  }

  // Tab, then search on the name and the examples
  const needle = search.trim().toLowerCase()
  const offenses = (panel?.offenses ?? [])
    .filter((offense) =>
      tab === 'favorites'
        ? favorites.includes(offense.id)
        : tab === 'recents'
          ? recentIds.includes(offense.id)
          : true
    )
    .filter(
      (offense) =>
        !needle ||
        offense.name.toLowerCase().includes(needle) ||
        offense.examples.some((example) => example.toLowerCase().includes(needle))
    )

  const empty =
    tab === 'favorites'
      ? MODVIEW_PANEL_COPY.emptyFavorites
      : tab === 'recents'
        ? MODVIEW_PANEL_COPY.emptyRecents
        : needle
          ? MODVIEW_PANEL_COPY.emptySearch
          : MODVIEW_COPY.sanctionsEmpty

  return (
    <aside
      className={cn(
        MODVIEW_SANCTIONS.root,
        isOpen ? MODVIEW_SANCTIONS.open : MODVIEW_SANCTIONS.closed
      )}
      aria-label={MODVIEW_COPY.sanctions}
    >
      <button
        type="button"
        className={MODVIEW_SANCTIONS.toggle}
        aria-expanded={isOpen}
        title={isOpen ? MODVIEW_COPY.sanctionsClose : MODVIEW_COPY.sanctionsOpen}
        onClick={onToggle}
      >
        <ToggleIcon className={MODVIEW_SANCTIONS.toggleIcon} aria-hidden="true" />
        {isOpen && MODVIEW_COPY.sanctions}
      </button>

      {isOpen && (
        <div className={MODVIEW_SANCTIONS.body}>
          <div className={MODVIEW_SANCTIONS.head}>
            {LevelIcon && <LevelIcon className={MODVIEW_SANCTIONS.headGlyph} aria-hidden="true" />}
            {levelName && <p className={MODVIEW_SANCTIONS.headName}>{levelName}</p>}
          </div>

          <input
            className={MODVIEW_SANCTIONS.search}
            placeholder={MODVIEW_PANEL_COPY.search}
            aria-label={MODVIEW_PANEL_COPY.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className={MODVIEW_SANCTIONS.tabs} role="tablist">
            {TABS.map((entry) => {
              const Glyph = ICONS[entry.icon]

              return (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === entry.key}
                  aria-label={entry.label}
                  title={entry.label}
                  className={cn(
                    MODVIEW_SANCTIONS.tab,
                    tab === entry.key && MODVIEW_SANCTIONS.tabOn
                  )}
                  onClick={() => setTab(entry.key)}
                >
                  <Glyph className={MODVIEW_SANCTIONS.tabGlyph} aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <div className={MODVIEW_SANCTIONS.divider} />

          {!target && offenses.length > 0 && (
            <p className={MODVIEW_SANCTIONS.hint}>{MODVIEW_PANEL_COPY.pickTarget}</p>
          )}
          {offenses.length === 0 && <p className={MODVIEW_SANCTIONS.empty}>{empty}</p>}

          <div className={MODVIEW_SANCTIONS.list}>
            {offenses.map((offense) => {
              const applied = target ? (memory[target.id]?.[offense.id] ?? []) : []
              const next = nextRung(applied, offense.rungs.length)
              const third = thirdRung(offense.rungs.length)
              const isFavorite = favorites.includes(offense.id)

              return (
                <article
                  key={offense.id}
                  className={MODVIEW_SANCTIONS.box}
                  style={accentVars(SANCTION_GRAVITY_REGISTRY.get(offense.gravity).accent)}
                >
                  <span className={MODVIEW_SANCTIONS.offenseRule} aria-hidden="true" />
                  <div className={MODVIEW_SANCTIONS.boxHead}>
                    <span className={MODVIEW_SANCTIONS.offenseName}>{offense.name}</span>
                    <button
                      type="button"
                      className={cn(MODVIEW_SANCTIONS.star, isFavorite && MODVIEW_SANCTIONS.starOn)}
                      aria-pressed={isFavorite}
                      title={
                        isFavorite ? MODVIEW_PANEL_COPY.unfavorite : MODVIEW_PANEL_COPY.favorite
                      }
                      onClick={() => toggleFavorite(offense.id)}
                    >
                      <StarIcon className={MODVIEW_SANCTIONS.starGlyph} aria-hidden="true" />
                    </button>
                  </div>

                  {offense.rungs.map((rung, index) => (
                    <p
                      key={rung.id}
                      className={
                        applied.includes(index)
                          ? MODVIEW_SANCTIONS.rungDone
                          : target && index === next
                            ? MODVIEW_SANCTIONS.rungNext
                            : MODVIEW_SANCTIONS.rung
                      }
                    >
                      {`${MODVIEW_PANEL_COPY.rung.replace('{n}', String(index + 1))} : ${rungText(rung)}`}
                    </p>
                  ))}

                  {target && next !== null && (
                    <div className={MODVIEW_SANCTIONS.actions}>
                      <Button variant="primary" onClick={() => onPrefill(offense, next)}>
                        {applied.length === 0
                          ? MODVIEW_PANEL_COPY.prefill.replace('{name}', target.name)
                          : MODVIEW_PANEL_COPY.next}
                      </Button>
                      {third !== null && third !== next && (
                        <Button variant="secondary" onClick={() => onPrefill(offense, third)}>
                          {MODVIEW_PANEL_COPY.third}
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
