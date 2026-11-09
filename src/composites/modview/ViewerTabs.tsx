'use client'

import { useGlideBox } from '@/core/hooks/interaction/layout/useGlideBox'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ViewerTabsProps<Key extends string> {
  tabs: { key: Key; label: string }[]
  value: Key
  onChange: (key: Key) => void
  // Bold buttons instead of the light strip
  isBold?: boolean
}

/**
 * Tab strip of the viewer card, a box gliding under the open one
 * @param {ViewerTabsProps<Key>} props - Tabs, open tab and change handler
 * @return {JSX.Element}
 */

export const ViewerTabs = <Key extends string>({
  tabs,
  value,
  onChange,
  isBold,
}: ViewerTabsProps<Key>) => {
  const { listRef, boxRef } = useGlideBox<HTMLDivElement>(`${value}:${tabs.length}`)

  return (
    <div ref={listRef} className={isBold ? MODVIEW_USER.buttons : MODVIEW_USER.tabs} role="tablist">
      <span
        ref={boxRef}
        className={isBold ? MODVIEW_USER.buttonBox : MODVIEW_USER.tabBox}
        aria-hidden="true"
      />
      {tabs.map((entry) => (
        <button
          key={entry.key}
          type="button"
          role="tab"
          aria-selected={value === entry.key}
          className={cn(
            isBold ? MODVIEW_USER.button : MODVIEW_USER.tab,
            value === entry.key && MODVIEW_USER.tabOn
          )}
          onClick={() => onChange(entry.key)}
        >
          {entry.label}
        </button>
      ))}
    </div>
  )
}
