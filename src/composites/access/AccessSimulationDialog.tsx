'use client'

import { Badge } from '@/components/elements/display/Badge'
import { Dialog } from '@/components/structures/Dialog'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PERMISSION_SECTIONS } from '@/declarations/access/permissions'
import { ACCESS_CONSOLE } from '@/declarations/ui/blocks'
import type { AccessSimulation } from '@/types/access'

export interface AccessSimulationDialogProps {
  simulation: AccessSimulation | null
  onClose: () => void
}

/**
 * Simulation overlay — what a role or function actually opens once the floor, the overwrites
 * and the refusals have all been folded in, the way the member themselves would see it
 * @param {AccessSimulation | null} simulation - Resolved access, null keeping the overlay shut
 * @param {() => void} onClose - Close handler
 * @return {JSX.Element}
 */

export const AccessSimulationDialog = ({ simulation, onClose }: AccessSimulationDialogProps) => {
  const held = new Set(simulation?.permissions ?? [])

  // Only the pages the holder actually reaches, each with the permissions it opens
  const sections = PERMISSION_SECTIONS.map((section) => ({
    ...section,
    permissions: section.permissions.filter((entry) => held.has(entry.name)),
  })).filter((section) => section.permissions.length > 0)

  return (
    <Dialog
      open={simulation !== null}
      onClose={onClose}
      size="md"
      title={simulation ? `${ACCESS_COPY.simulateTitle} · ${simulation.label}` : ''}
      description={ACCESS_COPY.simulateLead}
    >
      {sections.length === 0 ? (
        <p className={ACCESS_CONSOLE.detailKind}>{ACCESS_COPY.simulateEmpty}</p>
      ) : (
        <div className={ACCESS_CONSOLE.simulation}>
          {sections.map((section) => (
            <section key={section.group} className={ACCESS_CONSOLE.simulationSection}>
              <h3 className={ACCESS_CONSOLE.simulationTitle}>{section.label}</h3>
              <div className={ACCESS_CONSOLE.simulationTags}>
                {section.permissions.map((permission) => (
                  <Badge
                    key={permission.name}
                    label={permission.displayName}
                    tone={permission.important ? 'warning' : 'success'}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Dialog>
  )
}
