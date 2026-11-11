'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { Dialog } from '@/components/structures/overlays/Dialog'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { ActionsPanel } from '@/composites/modview/actions/ActionsPanel'
import { PreferencesPanel } from '@/composites/modview/actions/PreferencesPanel'
import { useGlidePill } from '@/core/hooks/interaction/layout/useGlidePill'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_SETTINGS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

interface PanelProps {
  options: PageOption[]
}

// Window switches and layout gestures
const WindowsPanel = ({ options }: PanelProps) => (
  <ul className={MODVIEW_SETTINGS.list}>
    {options.map((option) => (
      <li key={option.id}>
        {'onSelect' in option ? (
          <button type="button" className={MODVIEW_SETTINGS.gesture} onClick={option.onSelect}>
            {option.label}
          </button>
        ) : (
          'checked' in option && (
            <div className={MODVIEW_SETTINGS.row}>
              <span>{option.label}</span>
              <Toggle
                bare
                label={option.label}
                checked={option.checked}
                onChange={option.onChange}
              />
            </div>
          )
        )}
      </li>
    ))}
  </ul>
)

// Pages of the box, in the order of the sidebar
const PAGES = {
  preferences: {
    label: MODVIEW_ACTION_COPY.preferences,
    icon: 'settingsLine',
    Panel: PreferencesPanel,
  },
  actions: { label: MODVIEW_ACTION_COPY.actionsPage, icon: 'modActions', Panel: ActionsPanel },
  windows: { label: MODVIEW_ACTION_COPY.windowsPage, icon: 'maximize', Panel: WindowsPanel },
} as const satisfies Record<
  string,
  { label: string; icon: IconName; Panel: (props: PanelProps) => React.JSX.Element }
>

type PageName = keyof typeof PAGES

const PAGE_NAMES = Object.keys(PAGES) as PageName[]

/**
 * Big settings box with its own sidebar: preferences, then the custom actions
 * @param {Object} props - Box props
 * @param {PageOption[]} props.options - Window switches and gestures
 * @param {() => void} props.onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const ModSettings = ({
  options,
  onClose,
}: {
  options: PageOption[]
  onClose: () => void
}) => {
  const { commit, discard } = useModPreferences()
  const [page, setPage] = useState<PageName>('preferences')
  const { Panel } = PAGES[page]
  const { itemsRef, pillRef } = useGlidePill(page)

  const cancel = () => {
    discard()
    onClose()
  }

  return (
    <Dialog
      open
      size="xl"
      title={MODVIEW_ACTION_COPY.settings}
      onClose={cancel}
      footer={
        <>
          <Button variant="secondary" onClick={cancel}>
            {MODVIEW_ACTION_COPY.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              commit()
              onClose()
            }}
          >
            {MODVIEW_ACTION_COPY.save}
          </Button>
        </>
      }
    >
      <div className={MODVIEW_SETTINGS.root}>
        <nav className={MODVIEW_SETTINGS.nav} aria-label={MODVIEW_ACTION_COPY.settings}>
          {PAGE_NAMES.map((name) => {
            const Icon = ICONS[PAGES[name].icon]

            return (
              <button
                key={name}
                ref={(node) => {
                  if (node) itemsRef.current.set(name, node)
                  else itemsRef.current.delete(name)
                }}
                type="button"
                className={cn(MODVIEW_SETTINGS.item, page === name && MODVIEW_SETTINGS.itemOn)}
                aria-current={page === name ? 'page' : undefined}
                onClick={() => setPage(name)}
              >
                <Icon
                  className={cn(MODVIEW_SETTINGS.icon, page === name && MODVIEW_SETTINGS.iconOn)}
                  aria-hidden="true"
                />
                {PAGES[name].label}
              </button>
            )
          })}
          <span ref={pillRef} className={MODVIEW_SETTINGS.pill} aria-hidden="true" />
        </nav>
        <div key={page} className={cn(MODVIEW_SETTINGS.page, MODVIEW_SETTINGS.swap)}>
          <Panel options={options} />
        </div>
      </div>
    </Dialog>
  )
}
