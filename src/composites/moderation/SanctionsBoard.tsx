'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { Section } from '@/components/structures/Section'
import { LiveconLevelCard } from '@/composites/moderation/LiveconLevelCard'
import { SanctionOffenseDialog } from '@/composites/moderation/SanctionOffenseDialog'
import { useLivecon } from '@/core/hooks/data/useLivecon'
import { useSanctions } from '@/core/hooks/data/useSanctions'
import { ROUTES } from '@/declarations/navigation'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { LIVECON_COPY } from '@/declarations/livecon/copy'
import { SANCTION_STYLES, TIMELINE_STYLES } from '@/declarations/ui/variants'
import { TONES, toTone } from '@/declarations/ui/theme'
import type { FieldDefinition } from '@/types/forms'
import type { LiveconHistoryEntry, LiveconLevelView, LiveconStateView } from '@/types/livecon'
import type { SanctionMeasureView, SanctionPanelView } from '@/types/sanctions'
import type { FieldOption } from '@/types/forms'
import { formatDayTime } from '@/utils/format/dates'
import { cn } from '@/utils/classnames'

export interface SanctionsBoardProps {
  levels: LiveconLevelView[]
  initialState: LiveconStateView[]
  history: LiveconHistoryEntry[]
  creators: FieldOption[]
  measures: SanctionMeasureView[]
  initialPanel: SanctionPanelView
  liveconFields: FieldDefinition[]
  offenseFields: FieldDefinition[]
  canUpdateLivecon: boolean
  canManageSanctions: boolean
}

/**
 * Moderation board — the livecon level in force picks the sanction panel of the creator on
 * screen, every offence opening its own ladder
 * @param {LiveconLevelView[]} levels - Declared levels, one panel each
 * @param {LiveconStateView[]} initialState - Levels in force, resolved server-side
 * @param {LiveconHistoryEntry[]} history - Past switches
 * @param {FieldOption[]} creators - Creators in perimeter
 * @param {SanctionMeasureView[]} measures - Measures a rung may pick
 * @param {SanctionPanelView} initialPanel - Panel resolved server-side
 * @param {FieldDefinition[]} liveconFields - Declarations of the switch form
 * @param {FieldDefinition[]} offenseFields - Declarations of the offence form
 * @param {boolean} canUpdateLivecon - Member may switch a level
 * @param {boolean} canManageSanctions - Member may edit the panel
 * @return {JSX.Element}
 */

export const SanctionsBoard = ({
  levels,
  initialState,
  history,
  creators,
  measures,
  initialPanel,
  liveconFields,
  offenseFields,
  canUpdateLivecon,
  canManageSanctions,
}: SanctionsBoardProps) => {
  const livecon = useLivecon(initialState)
  const sanctions = useSanctions(initialPanel)

  const [creatorId, setCreatorId] = useState(initialPanel.youtuberId)
  const [levelId, setLevelId] = useState(initialPanel.activeLevelId ?? levels[0]?.id ?? '')
  const [isAbout, setAbout] = useState(false)
  const [isSwitching, setSwitching] = useState(false)

  // The level in force for the creator on screen, falling back to the corp-wide one
  const inForce =
    livecon.state.find((entry) => entry.youtuber?.id === creatorId) ??
    livecon.state.find((entry) => entry.youtuber === null)

  const openLevel = levels.find((level) => level.id === levelId) ?? levels[0]
  const openTone = toTone(openLevel?.accent, 'neutral')

  const select = async (nextCreatorId: string, nextLevelId: string) => {
    setCreatorId(nextCreatorId)
    setLevelId(nextLevelId)
    await sanctions.select(nextCreatorId, nextLevelId)
  }

  if (levels.length === 0) {
    return (
      <EmptyState
        figure="livecon"
        title={SANCTION_COPY.levelsEmptyTitle}
        description={SANCTION_COPY.levelsEmptyDescription}
        action={
          <Link href={ROUTES.settingsSection('livecon')}>
            <Button variant="primary" icon="settings">
              {SANCTION_COPY.configure}
            </Button>
          </Link>
        }
      />
    )
  }

  if (creators.length === 0) {
    return (
      <EmptyState
        figure="moderation"
        title={SANCTION_COPY.creatorsEmptyTitle}
        description={SANCTION_COPY.creatorsEmptyDescription}
        action={
          <Link href={ROUTES.settingsSection('youtubeurs')}>
            <Button variant="primary" icon="settings">
              {SANCTION_COPY.configure}
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className={SANCTION_STYLES.banner}>
        <div className="flex flex-col gap-1">
          <div className={SANCTION_STYLES.level}>
            <span
              className={cn(
                SANCTION_STYLES.levelNumber,
                TONES[toTone(inForce?.level.accent, 'brand')].text
              )}
            >
              {inForce?.level.level ?? openLevel?.level}
            </span>
            <span className={SANCTION_STYLES.levelIdentity}>
              <span className={SANCTION_STYLES.levelName}>
                {inForce?.level.name ?? openLevel?.name}
              </span>
              <span className="text-xs text-[var(--color-ink-subtle)]">
                {inForce
                  ? `${LIVECON_COPY.since} ${formatDayTime(inForce.startedAt)}`
                  : LIVECON_COPY.emptyStateTitle}
              </span>
            </span>
          </div>
          <Button variant="link" onClick={() => setAbout(true)}>
            {SANCTION_COPY.moreInfo}
          </Button>
        </div>

        <div className={SANCTION_STYLES.bannerActions}>
          {creators.length > 1 && (
            <SelectMenu
              label={SANCTION_COPY.creator}
              options={creators}
              value={creatorId}
              mark="avatar"
              onChange={(next) => void select(next, levelId)}
            />
          )}
          {canUpdateLivecon && (
            <Button
              variant="primary"
              icon="livecon"
              onClick={() => {
                livecon.clearIssues()
                setSwitching(true)
              }}
            >
              {SANCTION_COPY.change}
            </Button>
          )}
        </div>
      </div>

      <Section title={SANCTION_COPY.title} bare>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              label={SANCTION_COPY.panel}
              options={levels.map((level) => ({
                value: level.id,
                label: `${SANCTION_COPY.panel} ${level.level}`,
              }))}
              value={openLevel?.id ?? ''}
              onChange={(next) => void select(creatorId, next)}
            />
            {inForce?.level.id === openLevel?.id && (
              <Badge label={SANCTION_COPY.currentBadge} tone="brand" dot />
            )}
          </div>

          {sanctions.panel.offenses.length === 0 ? (
            <EmptyState
              figure="moderation"
              title={SANCTION_COPY.emptyTitle}
              description={SANCTION_COPY.emptyDescription}
              action={
                <Button
                  variant="primary"
                  icon="spark"
                  disabled={!canManageSanctions || sanctions.isSaving}
                  onClick={() => void sanctions.generate(creatorId, levelId)}
                >
                  {SANCTION_COPY.generate}
                </Button>
              }
            />
          ) : (
            <div className={SANCTION_STYLES.grid}>
              {sanctions.panel.offenses.map((offense) => {
                const tone = toTone(offense.peakAccent ?? offense.accent, 'neutral')

                return (
                  <button
                    key={offense.id}
                    type="button"
                    onClick={() => void sanctions.openOffense(offense.id)}
                    className={cn(SANCTION_STYLES.tile, TONES[tone].border, TONES[tone].soft)}
                  >
                    {offense.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </Section>

      <Section
        title={SANCTION_COPY.historyTitle}
        bare={history.length === 0}
        padded={history.length > 0}
      >
        {history.length === 0 ? (
          <EmptyState
            figure="notes"
            title={SANCTION_COPY.historyEmptyTitle}
            description={SANCTION_COPY.historyEmptyDescription}
            action={<Badge label={SANCTION_COPY.historyEmptyTitle} tone="neutral" />}
          />
        ) : (
          <ol className={TIMELINE_STYLES.list}>
            {history.map((entry, index) => {
              const tone = toTone(entry.accent, 'neutral')

              return (
                <li key={entry.id} className={TIMELINE_STYLES.item}>
                  {index < history.length - 1 && (
                    <span className={TIMELINE_STYLES.rail} aria-hidden="true" />
                  )}
                  <span className={cn(TIMELINE_STYLES.dot, TONES[tone].dot)} aria-hidden="true" />
                  <div className={TIMELINE_STYLES.body}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge label={`${entry.level} · ${entry.levelName}`} tone={tone} />
                      <span>{entry.scopeLabel}</span>
                    </span>
                    <span className={TIMELINE_STYLES.meta}>
                      {[formatDayTime(entry.startedAt), entry.actorName, entry.reason]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Section>

      <Dialog
        open={isAbout}
        onClose={() => setAbout(false)}
        title={SANCTION_COPY.aboutTitle}
        description={SANCTION_COPY.aboutLead}
        tone={openTone}
        icon="livecon"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          {levels.map((level) => (
            <LiveconLevelCard
              key={level.id}
              level={level}
              current={level.id === inForce?.level.id}
            />
          ))}
        </div>
      </Dialog>

      <SanctionOffenseDialog
        offense={sanctions.open}
        levelId={openLevel?.id ?? null}
        levelName={`${SANCTION_COPY.panel} ${openLevel?.level ?? ''}`}
        measures={measures}
        fields={offenseFields}
        issues={sanctions.issues}
        isSaving={sanctions.isSaving}
        canManage={canManageSanctions}
        onSaveOffense={sanctions.saveOffense}
        onSaveLadder={sanctions.saveLadder}
        onClose={sanctions.closeOffense}
      />

      <FormDialog
        open={isSwitching}
        title={SANCTION_COPY.changeTitle}
        fields={liveconFields}
        issues={livecon.issues}
        isSaving={livecon.isSaving}
        onSubmit={livecon.apply}
        onClose={() => setSwitching(false)}
      />
    </>
  )
}
