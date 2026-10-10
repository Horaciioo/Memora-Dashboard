'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Skeleton } from '@/components/elements/feedback/Skeleton'
import { Input } from '@/components/elements/forms/Input'
import { Drawer } from '@/components/structures/Drawer'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { InlineCreate } from '@/components/structures/InlineCreate'
import { LiveconTitle } from '@/composites/moderation/LiveconTitle'
import { OffenseSheet } from '@/composites/moderation/OffenseSheet'
import { useActionMenu } from '@/core/hooks/interaction/useActionMenu'
import { useSanctions } from '@/core/hooks/data/useSanctions'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import {
  SANCTION_GRAVITY_REGISTRY,
  SANCTION_PANEL_REGISTRY,
} from '@/declarations/sanctions/registries'
import { SANCTION_TEMPLATES } from '@/declarations/sanctions/template'
import { accentVars } from '@/declarations/ui/theme'
import { LIVECON_TITLE, SANCTION_PANEL } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LiveconLevelView, LiveconStateView } from '@/types/livecon'
import type { SanctionMeasureView, SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { SanctionPanels } from '@/utils/constants/moderation'
import type { SanctionPanelName } from '@/utils/constants/moderation'
import { foldText } from '@/utils/format/strings'

export interface ModerationBoardProps {
  creatorId: string
  levels: LiveconLevelView[]
  initialState: LiveconStateView[]
  panels: SanctionPanelName[]
  initialPanel: SanctionPanelView
  measures: SanctionMeasureView[]
  liveconFields: FieldDefinition[]
  canUpdateLivecon: boolean
  canManageSanctions: boolean
}

/**
 * One offence as a box
 * @param {Object} props - Offence
 * @return {JSX.Element}
 */

const OffenseBox = ({
  offense,
  canManage,
  onOpen,
  onRename,
  onRemove,
}: {
  offense: SanctionOffenseCard
  canManage: boolean
  onOpen: () => void
  onRename: (name: string) => Promise<boolean>
  onRemove: () => void
}) => {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(offense.name)
  const gravity = SANCTION_GRAVITY_REGISTRY.get(offense.gravity)

  const menu = useActionMenu(
    canManage
      ? [
          { id: 'open', label: SANCTION_COPY.open, icon: 'forward', onSelect: onOpen },
          {
            id: 'rename',
            label: SANCTION_COPY.rename,
            icon: 'edit',
            onSelect: () => {
              setDraft(offense.name)
              setRenaming(true)
            },
          },
          {
            id: 'remove',
            label: SANCTION_COPY.remove,
            icon: 'remove',
            danger: true,
            separatorBefore: true,
            onSelect: onRemove,
          },
        ]
      : []
  )

  const commit = async () => {
    const next = draft.trim()
    if (next && next !== offense.name) await onRename(next)
    setRenaming(false)
  }

  const body = (
    <>
      <span className={SANCTION_PANEL.cardRule} aria-hidden="true" />
      {renaming ? (
        <input
          ref={(node) => node?.focus()}
          value={draft}
          maxLength={FORM_SETTINGS.titleMaxLength}
          aria-label={SANCTION_COPY.rename}
          className={SANCTION_PANEL.cardInput}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void commit()
            if (event.key === 'Escape') setRenaming(false)
          }}
        />
      ) : (
        <span className={SANCTION_PANEL.cardName}>{offense.name}</span>
      )}
    </>
  )

  // A box being renamed holds a field
  return renaming ? (
    <div className={SANCTION_PANEL.card} style={accentVars(gravity.accent)}>
      {body}
    </div>
  ) : (
    <button
      type="button"
      className={SANCTION_PANEL.card}
      style={accentVars(gravity.accent)}
      onClick={onOpen}
      onContextMenu={menu.onContextMenu}
    >
      {body}
    </button>
  )
}

/**
 * Sanction panel of the creator the member works for: the livecon in force on top, then every
 * offence of the member's surface as a box, each opening its full sheet
 * @param {ModerationBoardProps} props - Creator
 * @return {JSX.Element}
 */

export const ModerationBoard = ({
  creatorId,
  levels,
  initialState,
  panels,
  initialPanel,
  measures,
  liveconFields,
  canUpdateLivecon,
  canManageSanctions,
}: ModerationBoardProps) => {
  const sanctions = useSanctions(initialPanel)
  const [search, setSearch] = useState('')
  const [removing, setRemoving] = useState<SanctionOffenseCard | null>(null)

  const panel = sanctions.panel.panel
  const surface = SANCTION_PANEL_REGISTRY.get(panel)
  const level = levels.find((entry) => entry.id === sanctions.panel.levelId) ?? levels[0]
  const needle = foldText(search.trim())

  // Heaviest first
  const offenses = useMemo(
    () =>
      [...sanctions.panel.offenses]
        .filter((offense) => !needle || foldText(offense.name).includes(needle))
        .sort(
          (left, right) =>
            SANCTION_GRAVITY_REGISTRY.get(right.gravity).rank -
            SANCTION_GRAVITY_REGISTRY.get(left.gravity).rank
        ),
    [needle, sanctions.panel.offenses]
  )

  const hasTemplate = SANCTION_TEMPLATES[panel].length > 0
  const isEmpty = sanctions.panel.offenses.length === 0

  const panelBody = () => {
    if (sanctions.isLoading) {
      return (
        <div className={SANCTION_PANEL.grid}>
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} shape="row" className="h-16" />
          ))}
        </div>
      )
    }

    if (isEmpty && !hasTemplate) {
      return (
        <EmptyState
          figure="moderation"
          title={SANCTION_COPY.unwrittenTitle.replace('{panel}', surface.label)}
          description={SANCTION_COPY.unwrittenDescription}
          action={
            panel === SanctionPanels.Discord ? (
              <Link href={ROUTES.marsha}>
                <Button variant="primary" icon="discord">
                  {SANCTION_COPY.marshaLink}
                </Button>
              </Link>
            ) : (
              <Button disabled>{SANCTION_COPY.generate}</Button>
            )
          }
        />
      )
    }

    if (isEmpty) {
      return (
        <EmptyState
          figure="moderation"
          title={SANCTION_COPY.emptyTitle}
          description={SANCTION_COPY.emptyDescription}
          action={
            <Button
              variant="primary"
              icon="spark"
              disabled={!canManageSanctions}
              isLoading={sanctions.isSaving}
              onClick={() => void sanctions.generate(false)}
            >
              {SANCTION_COPY.generate}
            </Button>
          }
        />
      )
    }

    return (
      <>
        {offenses.length === 0 && (
          <p className={SANCTION_PANEL.empty}>{SANCTION_COPY.searchEmpty}</p>
        )}
        {SANCTION_GRAVITY_REGISTRY.keys
          .slice()
          .sort(
            (left, right) =>
              SANCTION_GRAVITY_REGISTRY.get(right).rank - SANCTION_GRAVITY_REGISTRY.get(left).rank
          )
          .map((key) => {
            const entries = offenses.filter((offense) => offense.gravity === key)
            if (entries.length === 0) return null
            const tone = SANCTION_GRAVITY_REGISTRY.get(key)

            return (
              <section
                key={key}
                className={SANCTION_PANEL.group}
                style={accentVars(tone.accent)}
                {...beaconProps(TOUR_BEACONS.sanctionsOffenses)}
              >
                <h2 className={SANCTION_PANEL.groupTitle}>{tone.label}</h2>
                <div className={SANCTION_PANEL.grid}>
                  {entries.map((offense) => (
                    <OffenseBox
                      key={offense.id}
                      offense={offense}
                      canManage={canManageSanctions}
                      onOpen={() => void sanctions.openOffense(offense.id)}
                      onRename={(name) => sanctions.saveOffense(offense.id, { name })}
                      onRemove={() => setRemoving(offense)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        {canManageSanctions && !needle && (
          <div className={SANCTION_PANEL.grid}>
            <InlineCreate
              tile
              label={SANCTION_COPY.newOffense}
              maxLength={FORM_SETTINGS.titleMaxLength}
              onCommit={sanctions.createOffense}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div className={SANCTION_PANEL.wrapper}>
      <div className={LIVECON_TITLE.row} {...beaconProps(TOUR_BEACONS.sanctionsLivecon)}>
        <LiveconTitle
          creatorId={creatorId}
          levels={levels}
          initialState={initialState}
          fields={liveconFields}
          canUpdate={canUpdateLivecon}
          onLevelChange={(next) => void sanctions.select(panel, next.id)}
        />
        {!isEmpty && (
          <Input
            className={LIVECON_TITLE.search}
            type="search"
            value={search}
            placeholder={SANCTION_COPY.search}
            aria-label={SANCTION_COPY.search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}
      </div>

      {panels.length > 1 && (
        <div className={SANCTION_PANEL.toolbar}>
          <SegmentedControl
            label={SANCTION_COPY.panelTitle.replace('{panel}', '')}
            options={panels.map((key) => ({
              value: key,
              label: SANCTION_PANEL_REGISTRY.label(key),
            }))}
            value={panel}
            onChange={(next) => void sanctions.select(next, level?.id ?? null)}
          />
        </div>
      )}

      {panelBody()}

      {sanctions.isOpening && (
        <Drawer open onClose={() => undefined} title={SANCTION_COPY.opening} icon="sanctions">
          <BrandLoader variant="block" caption={SANCTION_COPY.opening} />
        </Drawer>
      )}

      {sanctions.open && level && (
        <OffenseSheet
          offense={sanctions.open}
          level={level}
          measures={measures}
          canManage={canManageSanctions}
          isSaving={sanctions.isSaving}
          onSaveOffense={sanctions.saveOffense}
          onSaveLadder={sanctions.saveLadder}
          onClose={sanctions.closeOffense}
        />
      )}

      <ConfirmDialog
        open={removing !== null}
        title={SANCTION_COPY.removeTitle}
        description={SANCTION_COPY.removeDescription}
        tone="danger"
        pending={sanctions.isSaving}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          if (removing) await sanctions.removeOffense(removing.id)
          setRemoving(null)
        }}
      />
    </div>
  )
}
