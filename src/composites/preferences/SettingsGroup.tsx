import type { ReactNode } from 'react'

import { Section } from '@/components/structures/page/Section'
import type { MaturityName } from '@/declarations/maturity/registries'

export interface SettingsGroupProps {
  title: string
  maturity?: MaturityName
  children: ReactNode
}

/**
 * Titled category of a settings tab
 * @param {string} title - Category name
 * @param {MaturityName} [maturity] - Lifecycle tag
 * @param {ReactNode} children - Settings of the category
 * @return {JSX.Element}
 */

export const SettingsGroup = ({ title, maturity, children }: SettingsGroupProps) => {
  return (
    <Section title={title} maturity={maturity} padded>
      {children}
    </Section>
  )
}
