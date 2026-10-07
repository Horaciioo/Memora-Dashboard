'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Tabs, type TabItem } from '@/components/elements/navigation/Tabs'

/**
 * One tab of a file surface
 * @typedef {Object} FileTab
 * @property {string} value - Tab identifier
 * @property {string} label - Display label
 * @property {IconName} [icon] - Glyph key
 * @property {boolean} [visible] - Kept out of the strip when false
 * @property {() => ReactNode} render - Panel renderer, called only when opened
 */

export interface FileTab extends TabItem {
  visible?: boolean
  render: () => ReactNode
}

export interface FileTabsProps {
  label: string
  tabs: FileTab[]
  initial?: string
  // Lets a parent drive the open tab
  value?: string
  onChange?: (value: string) => void
  // Strip centred over its panel
  centered?: boolean
}

/**
 * Tab strip paired with the single panel it drives
 * @param {string} label - Accessible name of the strip
 * @param {FileTab[]} tabs - Tabs in display order
 * @param {string} [initial] - Tab opened first
 * @param {string} [value] - Open tab
 * @param {(value: string) => void} [onChange] - Called when the open tab changes
 * @param {boolean} [centered] - Centres the strip
 * @return {JSX.Element}
 */

export const FileTabs = ({ label, tabs, initial, value, onChange, centered }: FileTabsProps) => {
  const visible = tabs.filter((entry) => entry.visible !== false)
  const [internalTab, setInternalTab] = useState(initial ?? visible[0]?.value ?? '')
  const tab = value ?? internalTab
  const setTab = onChange ?? setInternalTab

  // A tab losing its permission mid-session falls back rather than showing nothing
  const current = visible.find((entry) => entry.value === tab) ?? visible[0]

  return (
    <>
      <Tabs
        items={visible.map(({ value, label: tabLabel, icon, maturity }) => ({
          value,
          label: tabLabel,
          icon,
          maturity,
        }))}
        value={current?.value ?? ''}
        onChange={setTab}
        label={label}
        centered={centered}
        inBanner
      />
      {current?.render()}
    </>
  )
}
