'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { useTabSlide } from '@/core/hooks/interaction/layout/useTabSlide'
import { Tabs, type TabItem } from '@/components/elements/navigation/Tabs'
import { useTabMemory } from '@/managers/front-end'

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
  const { remembered, remember } = useTabMemory(usePathname(), label)
  // Coming back to a page reopens the tab it was left on
  const [internalTab, setInternalTab] = useState(remembered ?? initial ?? visible[0]?.value ?? '')
  const tab = value ?? internalTab
  const setTab = onChange ?? setInternalTab

  // A tab losing its permission mid-session falls back rather than showing nothing
  const current = visible.find((entry) => entry.value === tab) ?? visible[0]
  const slide = useTabSlide(current ? visible.indexOf(current) : 0)

  // The trail names the open tab
  useEffect(() => {
    if (current) remember({ value: current.value, label: current.label })
  }, [current, remember])

  return (
    <>
      <Tabs
        items={visible.map(({ value, label: tabLabel, icon, danger }) => ({
          value,
          label: tabLabel,
          icon,
          danger,
        }))}
        value={current?.value ?? ''}
        onChange={setTab}
        label={label}
        centered={centered}
        inBanner
      />
      <div key={current?.value} className={slide}>
        {current?.render()}
      </div>
    </>
  )
}
