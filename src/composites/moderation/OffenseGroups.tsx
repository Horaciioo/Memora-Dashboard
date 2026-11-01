'use client'

import { InlineCreate } from '@/components/structures/inline/InlineCreate'
import { OffenseBox } from '@/composites/moderation/OffenseBox'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import { accentVars } from '@/declarations/ui/theme'
import { SANCTION_PANEL } from '@/declarations/ui/variants'
import type { OffenseGroup } from '@/core/lib/sanctions/groups'
import type { SanctionOffenseCard } from '@/types/sanctions'

export interface OffenseGroupsProps {
  groups: OffenseGroup[]
  canManage: boolean
  // Search is empty, so a new box fits at the end
  canCreate: boolean
  onOpen: (id: string) => void
  onRename: (id: string, name: string) => Promise<boolean>
  onRemove: (offense: SanctionOffenseCard) => void
  onCreate: (name: string) => Promise<boolean>
}

/**
 * Offences as boxes under their gravity
 * @param {OffenseGroupsProps} props - Groups and handlers
 * @return {JSX.Element}
 */

export const OffenseGroups = ({
  groups,
  canManage,
  canCreate,
  onOpen,
  onRename,
  onRemove,
  onCreate,
}: OffenseGroupsProps) => (
  <>
    {groups.length === 0 && <p className={SANCTION_PANEL.empty}>{SANCTION_COPY.searchEmpty}</p>}
    {groups.map(({ gravity, offenses }) => {
      const tone = SANCTION_GRAVITY_REGISTRY.get(gravity)

      return (
        <section
          key={gravity}
          className={SANCTION_PANEL.group}
          style={accentVars(tone.accent)}
          {...beaconProps(TOUR_BEACONS.sanctionsOffenses)}
        >
          <div className={SANCTION_PANEL.groupHead}>
            <h2 className={SANCTION_PANEL.groupTitle}>{tone.label}</h2>
            <span className={SANCTION_PANEL.groupRule} aria-hidden="true" />
          </div>
          <div className={SANCTION_PANEL.grid}>
            {offenses.map((offense) => (
              <OffenseBox
                key={offense.id}
                offense={offense}
                canManage={canManage}
                onOpen={() => onOpen(offense.id)}
                onRename={(name) => onRename(offense.id, name)}
                onRemove={() => onRemove(offense)}
              />
            ))}
          </div>
        </section>
      )
    })}
    {canManage && canCreate && (
      <div className={SANCTION_PANEL.grid}>
        <InlineCreate
          tile="offense"
          label={SANCTION_COPY.newOffense}
          maxLength={FORM_SETTINGS.titleMaxLength}
          onCommit={onCreate}
        />
      </div>
    )}
  </>
)
