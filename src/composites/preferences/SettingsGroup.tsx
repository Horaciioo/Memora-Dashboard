import type { ReactNode } from 'react'

import { Section } from '@/components/structures/page/Section'
import type { MaturityName } from '@/declarations/maturity/registries'
import { ILLUSTRATIONS } from '@/declarations/ui/illustrations'
import type { IllustrationName } from '@/declarations/ui/illustrations'
import { SETTINGS_GROUP } from '@/declarations/ui/variants'

export interface SettingsGroupProps {
  title: string
  lead?: string
  maturity?: MaturityName
  // Large drawn figure beside the lead
  figure?: IllustrationName
  children: ReactNode
}

/**
 * Titled category of a settings tab, with the line that says what it holds
 * @param {string} title - Category name
 * @param {string} [lead] - What it holds
 * @param {MaturityName} [maturity] - Lifecycle tag
 * @param {IllustrationName} [figure] - Large drawn figure
 * @param {ReactNode} children - Settings of the category
 * @return {JSX.Element}
 */

export const SettingsGroup = ({ title, lead, maturity, figure, children }: SettingsGroupProps) => {
  const Figure = figure ? ILLUSTRATIONS[figure] : null

  return (
    <Section title={title} maturity={maturity} padded>
      {(lead || Figure) && (
        <div className={SETTINGS_GROUP.head}>
          {lead && <p className={SETTINGS_GROUP.lead}>{lead}</p>}
          {Figure && <Figure className={SETTINGS_GROUP.figure} />}
        </div>
      )}
      {children}
    </Section>
  )
}
