'use client'

import Link from '@/components/elements/navigation/AppLink'
import { useMemo, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Skeleton } from '@/components/elements/feedback/Skeleton'
import { Input } from '@/components/elements/forms/inputs/Input'
import { PageOptions, type PageOption } from '@/components/structures/page/PageOptions'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { LiveconTitle } from '@/composites/moderation/LiveconTitle'
import { SanctionLegend } from '@/composites/moderation/SanctionLegend'
import { OffenseGroups } from '@/composites/moderation/OffenseGroups'
import { OffenseSheet } from '@/composites/moderation/OffenseSheet'
import { useSanctions } from '@/core/hooks/data/lives/useSanctions'
import { groupOffenses } from '@/core/lib/sanctions/groups'
import { ROUTES } from '@/declarations/navigation'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import { measureSeed } from '@/declarations/sanctions/measures'
import { SANCTION_TEMPLATES } from '@/declarations/sanctions/template'
import { LIVECON_TITLE, SANCTION_PANEL } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { LiveconLevelView, LiveconStateView } from '@/types/livecon'
import type { SanctionMeasureView, SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { SanctionPanels } from '@/utils/constants/moderation'
import type { SanctionPanelName } from '@/utils/constants/moderation'

export interface ModerationBoardProps {
  creatorId: string
  // Creators the member may switch between
  creators: FieldOption[]
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
 * Sanction panel of the creator the member works for: the livecon in force on top, then every
 * offence of the member's surface as a box, each opening its full sheet
 * @param {ModerationBoardProps} props - Creator
 * @return {JSX.Element}
 */

export const ModerationBoard = ({
  creatorId,
  creators,
  levels,
  initialState,
  panels,
  initialPanel,
  measures,
  liveconFields,
  canUpdateLivecon,
  canManageSanctions,
}: ModerationBoardProps) => {
  const creator = creators.find((option) => option.value === creatorId)
  const sanctions = useSanctions(initialPanel)
  const [search, setSearch] = useState('')
  const [showLegend, setShowLegend] = useState(false)
  const [removing, setRemoving] = useState<SanctionOffenseCard | null>(null)

  const panel = sanctions.panel.panel
  const surface = SANCTION_PANEL_REGISTRY.get(panel)
  const level = levels.find((entry) => entry.id === sanctions.panel.levelId) ?? levels[0]

  // Heaviest first
  const groups = useMemo(
    () => groupOffenses(sanctions.panel.offenses, search),
    [search, sanctions.panel.offenses]
  )

  // A ladder only offers its surface's measures
  const panelMeasures = useMemo(
    () => measures.filter((measure) => measureSeed(measure.name)?.panels?.includes(panel) ?? true),
    [measures, panel]
  )

  const hasTemplate = SANCTION_TEMPLATES[panel].length > 0
  const isEmpty = sanctions.panel.offenses.length === 0

  const pageOptions: PageOption[] = isEmpty
    ? []
    : [
        {
          id: 'legend',
          label: PAGE_OPTIONS_COPY.showLegend,
          checked: showLegend,
          onChange: setShowLegend,
        },
      ]

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
      <OffenseGroups
        groups={groups}
        canManage={canManageSanctions}
        canCreate={search.trim() === ''}
        onOpen={(id) => void sanctions.openOffense(id)}
        onRename={(id, name) => sanctions.saveOffense(id, { name })}
        onRemove={setRemoving}
        onCreate={sanctions.createOffense}
      />
    )
  }

  return (
    <div className={SANCTION_PANEL.wrapper}>
      <PageOptions options={pageOptions} />
      <div className={LIVECON_TITLE.row} {...beaconProps(TOUR_BEACONS.sanctionsLivecon)}>
        <div className={LIVECON_TITLE.heading}>
          {creator && <Avatar name={creator.label} src={creator.image} size="lg" />}
          <LiveconTitle
            creatorId={creatorId}
            levels={levels}
            initialState={initialState}
            fields={liveconFields}
            canUpdate={canUpdateLivecon}
            onLevelChange={(next) => void sanctions.select(panel, next.id)}
          />
        </div>
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
          {panels.length > 1 && (
            <SegmentedControl
              label={SANCTION_COPY.panelTitle.replace('{panel}', '')}
              options={panels.map((key) => ({
                value: key,
                label: SANCTION_PANEL_REGISTRY.label(key),
              }))}
              value={panel}
              onChange={(next) => void sanctions.select(next, level?.id ?? null)}
            />
          )}
        </div>
      )}

      {!isEmpty && showLegend && <SanctionLegend panel={panel} />}

      {panelBody()}

      {sanctions.isOpening && (
        <Drawer open onClose={() => undefined} title={SANCTION_COPY.opening} icon="sanctions">
          <BrandLoader variant="block" caption={SANCTION_COPY.opening} />
        </Drawer>
      )}

      {sanctions.open && level && (
        <OffenseSheet
          offense={sanctions.open}
          panel={sanctions.panel}
          level={level}
          measures={panelMeasures}
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
